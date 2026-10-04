import { Injectable } from '@angular/core';

interface PdfOptions {
  content: HTMLElement;
  isDarkTheme: boolean;
  fileName: string;
}

/** One visual line of text in the capture, in CSS px from the resume's top-left. */
interface TextLine {
  text: string;
  x: number;
  top: number;
  width: number;
  height: number;
  fontSize: number;
}

type Span = [top: number, bottom: number];

/** One column of the resume: its text, and the spans a page break must not cut. */
interface Column {
  x: number;
  width: number;
  lines: TextLine[];
  keepTogether: Span[];
}

interface CaptureLayout {
  width: number;
  height: number;
  /** Everything above this is full-width (the name header); below it two columns flow. */
  columnsTop: number;
  left: Column;
  right: Column;
  /** A row of pure column background, stretched to fill page margins. */
  backgroundRow: number;
}

/**
 * The visual resume PDF: a pixel-faithful capture of the resume page, cut into
 * A4 pages and made machine-readable.
 *
 * - Always captured at desktop width, so a phone download gets the same
 *   two-column layout as a laptop. The resume is copied into a hidden
 *   1200px-wide iframe first: html2canvas inlines the live computed styles of
 *   everything inside a custom element (app-root), so capturing in place on a
 *   phone would freeze the mobile layout no matter what CSS is injected.
 * - Each column flows on its own and breaks only between lines, chips, cards
 *   and headings (never through them), like a typeset two-column document.
 * - An invisible text layer, positioned and horizontally scaled to match the
 *   captured words, makes the PDF searchable, selectable and readable by ATS
 *   parsers. The pixels are an image; the words are real text.
 */
@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly A4_WIDTH = 595.28;
  private readonly A4_HEIGHT = 841.89;
  private readonly CAPTURE_WIDTH = 1200;
  /** Continuation pages get room above the columns; every page gets room below. */
  private readonly MARGIN_TOP = 34;
  private readonly MARGIN_BOTTOM = 30;
  /** iOS Safari refuses canvases above ~16.7 megapixels. */
  private readonly MAX_CANVAS_PIXELS = 16_000_000;
  /** Elements a page break must never cut through. */
  private readonly ATOMIC = [
    '.header-box', '.achievement-item', '.skill-tier', '.skill-chip', '.hobby-item', '.language-item',
    '.detail-item', '.links-content > div', '.reference-item', '.education-item', '.course-item'
  ].join(', ');
  /** Headings that must stay with the first ~3 lines that follow them. */
  private readonly KEEP_WITH_NEXT = 'h3, h6, .job-header';

  async generatePDF({ content, isDarkTheme, fileName }: PdfOptions): Promise<void> {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    await this.prepareContent(content);

    const frame = await this.createDesktopFrame(content, isDarkTheme);
    let capture: HTMLCanvasElement;
    let layout: CaptureLayout;
    try {
      const root = frame.contentDocument!.getElementById('resume-content')!;
      layout = this.measure(root);
      capture = await html2canvas(root, {
        // The sharpest scale that stays under the mobile canvas budget.
        scale: Math.min(2, Math.sqrt(this.MAX_CANVAS_PIXELS / (layout.width * layout.height))),
        useCORS: true,
        logging: false,
        backgroundColor: isDarkTheme ? '#121212' : '#ffffff',
        windowWidth: this.CAPTURE_WIDTH,
        scrollX: 0,
        scrollY: 0
      });
    } finally {
      frame.remove();
    }

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true });
    pdf.setProperties({
      title: 'Akhigbe Iruobe — Senior Frontend Engineer — Resume',
      author: 'Akhigbe Iruobe',
      subject: 'Resume',
      keywords: 'Akhigbe Iruobe, Senior Frontend Engineer, Angular, TypeScript, RxJS, fintech, banking'
    });

    const ptPerPx = this.A4_WIDTH / layout.width;
    const pxPerCss = capture.width / layout.width;
    const pageCss = this.A4_HEIGHT / ptPerPx;
    const topCss = this.MARGIN_TOP / ptPerPx;
    const bottomCss = this.MARGIN_BOTTOM / ptPerPx;

    const leftCuts = this.paginate(layout.left, layout.columnsTop, layout.height, pageCss - bottomCss - layout.columnsTop, pageCss - topCss - bottomCss);
    const rightCuts = this.paginate(layout.right, layout.columnsTop, layout.height, pageCss - bottomCss - layout.columnsTop, pageCss - topCss - bottomCss);
    const pageCount = Math.max(leftCuts.length, rightCuts.length);

    const page = document.createElement('canvas');
    page.width = capture.width;
    page.height = Math.round(capture.width * this.A4_HEIGHT / this.A4_WIDTH);
    const ctx = page.getContext('2d')!;

    for (let p = 0; p < pageCount; p++) {
      if (p > 0) pdf.addPage();
      const offsetY = p === 0 ? 0 : topCss; // where column content starts on this page

      // Column backgrounds over the whole page, then the full-width header on page 1.
      ctx.drawImage(capture, 0, Math.round(layout.backgroundRow * pxPerCss), capture.width, 1, 0, 0, page.width, page.height);
      if (p === 0) {
        ctx.drawImage(capture, 0, 0, capture.width, Math.round(layout.columnsTop * pxPerCss), 0, 0, capture.width, Math.round(layout.columnsTop * pxPerCss));
      }

      for (const [column, cuts] of [[layout.left, leftCuts], [layout.right, rightCuts]] as const) {
        if (p >= cuts.length) continue;
        const from = p === 0 ? layout.columnsTop : cuts[p - 1];
        const to = cuts[p];
        const destY = p === 0 ? layout.columnsTop : offsetY;
        const sx = Math.round(column.x * pxPerCss);
        const sw = Math.round(column.width * pxPerCss);
        const sy = Math.round(from * pxPerCss);
        const sh = Math.round((to - from) * pxPerCss);
        if (sh > 0) ctx.drawImage(capture, sx, sy, sw, sh, sx, Math.round(destY * pxPerCss), sw, sh);
      }

      pdf.addImage(page.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, this.A4_WIDTH, this.A4_HEIGHT, undefined, 'FAST');

      // Invisible text layer: header (page 1), then left column, then right,
      // so text extraction reads the resume in a sensible order.
      const header = p === 0 ? [...layout.left.lines, ...layout.right.lines].filter(l => l.top < layout.columnsTop) : [];
      const pageLines = [
        ...header.map(l => ({ line: l, y: l.top })),
        ...this.linesOnPage(layout.left, leftCuts, p, layout.columnsTop, offsetY),
        ...this.linesOnPage(layout.right, rightCuts, p, layout.columnsTop, offsetY)
      ];
      for (const { line, y } of pageLines) this.drawInvisibleText(pdf, line, line.x * ptPerPx, y * ptPerPx, ptPerPx);
    }

    pdf.save(fileName);
  }

  /** Where each page of one column ends, in CSS px. Breaks only between keep-together spans. */
  private paginate(column: Column, start: number, end: number, firstRoom: number, nextRoom: number): number[] {
    const spans = this.mergeSpans(column.keepTogether);
    const lastContent = Math.max(start, ...column.keepTogether.map(([, bottom]) => bottom));
    const cuts: number[] = [];
    let from = start;
    while (true) {
      const room = cuts.length === 0 ? firstRoom : nextRoom;
      if (lastContent - from <= room) {
        cuts.push(Math.min(end, Math.max(lastContent + 8, from + 1)));
        return cuts;
      }
      let cut = from + room;
      const blocked = spans.find(([top, bottom]) => cut > top && cut < bottom);
      // Pull the break up to the start of the blocking span, unless that would
      // waste more than half the page (one enormous block): then cut through.
      if (blocked && blocked[0] > from + room * 0.5) cut = blocked[0];
      cuts.push(cut);
      from = cut;
    }
  }

  private linesOnPage(column: Column, cuts: number[], p: number, columnsTop: number, offsetY: number) {
    if (p >= cuts.length) return [];
    const from = p === 0 ? columnsTop : cuts[p - 1];
    const to = cuts[p];
    return column.lines
      .filter(l => l.top >= from - 0.5 && l.top < to - 0.5 && l.top >= columnsTop)
      .map(l => ({ line: l, y: p === 0 ? l.top : offsetY + (l.top - from) }));
  }

  private drawInvisibleText(pdf: import('jspdf').jsPDF, line: TextLine, x: number, y: number, ptPerPx: number): void {
    const text = this.pdfSafe(line.text);
    if (!text) return;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(Math.max(1, line.fontSize * ptPerPx));
    const natural = pdf.getTextWidth(text);
    const target = line.width * ptPerPx;
    pdf.text(text, x, y, {
      baseline: 'top',
      renderingMode: 'invisible',
      horizontalScale: natural > 0 ? target / natural : 1
    });
  }

  /** The standard PDF fonts speak Windows-1252: map what we can, drop the rest (emoji). */
  private pdfSafe(text: string): string {
    const cp1252 = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
    return text
      .replace(/₦\s?/g, 'NGN ')
      .replace(/→/g, '->')
      .replace(/↑/g, '')
      .split('')
      .filter(ch => ch.charCodeAt(0) <= 0xff || cp1252.includes(ch))
      .join('')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Measures the cloned, desktop-width resume: text lines and unbreakable spans per column. */
  private measure(root: HTMLElement): CaptureLayout {
    const doc = root.ownerDocument;
    const view = doc.defaultView!;
    const origin = root.getBoundingClientRect();
    const rel = (r: DOMRect): Span => [r.top - origin.top, r.bottom - origin.top];

    const rightEl = root.querySelector('.resume-right') as HTMLElement;
    const splitX = rightEl.getBoundingClientRect().left - origin.left;
    const firstSections = [root.querySelector('.resume-left > *'), root.querySelector('.resume-right > *')]
      .filter((el): el is Element => !!el)
      .map(el => el.getBoundingClientRect().top - origin.top);
    const columnsTop = Math.min(...firstSections) - 12;

    const left: Column = { x: 0, width: splitX, lines: [], keepTogether: [] };
    const right: Column = { x: splitX, width: origin.width - splitX, lines: [], keepTogether: [] };
    const columnOf = (x: number) => (x < splitX ? left : right);

    // Text, word by word, grouped into visual lines.
    const range = doc.createRange();
    const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
      const parent = node.parentElement;
      if (!parent || !node.data.trim()) continue;
      const style = view.getComputedStyle(parent);
      if (style.visibility === 'hidden') continue;
      const fontSize = parseFloat(style.fontSize);
      let line: { words: string[]; left: number; right: number; top: number; bottom: number } | null = null;
      const flush = () => {
        if (!line) return;
        const entry: TextLine = {
          text: line.words.join(' '),
          x: line.left - origin.left,
          top: line.top - origin.top,
          width: line.right - line.left,
          height: line.bottom - line.top,
          fontSize
        };
        const col = columnOf(entry.x + 1);
        col.lines.push(entry);
        col.keepTogether.push([entry.top - 1, entry.top + entry.height + 1]);
        line = null;
      };
      for (const match of node.data.matchAll(/\S+/g)) {
        range.setStart(node, match.index!);
        range.setEnd(node, match.index! + match[0].length);
        const r = range.getBoundingClientRect();
        if (!r.width && !r.height) continue;
        if (line && Math.abs(r.top - line.top) < fontSize * 0.5) {
          line.words.push(match[0]);
          line.right = Math.max(line.right, r.right);
          line.bottom = Math.max(line.bottom, r.bottom);
        } else {
          flush();
          line = { words: [match[0]], left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        }
      }
      flush();
    }

    root.querySelectorAll(this.ATOMIC).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height) columnOf(r.left - origin.left + 1).keepTogether.push([rel(r)[0] - 3, rel(r)[1] + 3]);
    });
    root.querySelectorAll(this.KEEP_WITH_NEXT).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.height) columnOf(r.left - origin.left + 1).keepTogether.push([rel(r)[0] - 3, rel(r)[1] + 60]);
    });
    // A job keeps its promotion marker, header and first lines together.
    root.querySelectorAll('.job-item').forEach(item => {
      const header = item.querySelector('.job-header');
      if (header) right.keepTogether.push([rel(item.getBoundingClientRect())[0] - 3, rel(header.getBoundingClientRect())[1] + 60]);
    });

    return {
      width: origin.width,
      height: origin.height,
      columnsTop,
      left,
      right,
      backgroundRow: Math.max(0, origin.height - 2)
    };
  }

  private mergeSpans(spans: Span[]): Span[] {
    const sorted = [...spans].sort((a, b) => a[0] - b[0]);
    const merged: Span[] = [];
    for (const [top, bottom] of sorted) {
      const last = merged[merged.length - 1];
      if (last && top <= last[1]) last[1] = Math.max(last[1], bottom);
      else merged.push([top, bottom]);
    }
    return merged;
  }

  /**
   * A hidden, same-origin iframe at desktop width holding a copy of the resume
   * and every stylesheet on the page, with the PDF overrides applied. Resolves
   * once its stylesheets and fonts have loaded.
   */
  private async createDesktopFrame(content: HTMLElement, isDarkTheme: boolean): Promise<HTMLIFrameElement> {
    const host = (content.closest('app-resume') as HTMLElement | null) ?? content;
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = `position:fixed;top:0;left:-${this.CAPTURE_WIDTH + 200}px;width:${this.CAPTURE_WIDTH}px;height:1400px;border:0;visibility:hidden;pointer-events:none`;
    document.body.appendChild(frame);

    const html = document.documentElement;
    const styles = Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]')).map(n => n.outerHTML).join('');
    const doc = frame.contentDocument!;
    doc.open();
    doc.write(
      `<!doctype html><html class="${html.className}" style="${html.getAttribute('style') ?? ''}">` +
      `<head><base href="${document.baseURI}">${styles}</head>` +
      `<body class="${document.body.className}" style="margin:0">${host.outerHTML}</body></html>`
    );
    doc.close();

    await Promise.all(Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')).map(link =>
      link.sheet ? Promise.resolve() : new Promise(resolve => { link.onload = resolve; link.onerror = resolve; })
    ));
    this.injectPdfStyles(doc, isDarkTheme);
    await doc.fonts.ready;
    void doc.body.offsetHeight;
    return frame;
  }

  private async prepareContent(content: HTMLElement): Promise<void> {
    const images = Array.from(content.querySelectorAll('img'));
    await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve; // a missing image must not block the download
    })));
    await document.fonts.ready;
  }

  /** Desktop layout, settled animations and explicit colours for the clone html2canvas renders. */
  private injectPdfStyles(doc: Document, isDarkTheme: boolean): void {
    const colors = {
      textPrimary: isDarkTheme ? '#F1F5F9' : '#0F172A',
      textSecondary: isDarkTheme ? '#94A3B8' : '#475569',
      leftBg: isDarkTheme ? '#1E1E1E' : '#F4F4F4',
      rightBg: isDarkTheme ? '#121212' : '#FFFFFF'
    };

    const style = doc.createElement('style');
    style.textContent = `
      *, *::before, *::after { animation: none !important; transition: none !important; }
      .resume-container {
        width: ${this.CAPTURE_WIDTH}px !important;
        max-width: none !important;
        min-height: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .resume-main-content {
        background: linear-gradient(to right, ${colors.leftBg} 0%, ${colors.leftBg} 300px, ${colors.rightBg} 300px, ${colors.rightBg} 100%) !important;
        margin-top: -1px !important;
      }
      .resume-header-wrapper { padding: 3.5rem 2rem 0 !important; }
      .resume-header, .resume-header-wrapper { position: relative !important; z-index: 2 !important; }
      .header-box { transform: none !important; background-color: ${colors.rightBg} !important; position: relative !important; z-index: 3 !important; }
      /* html2canvas drops the name unless these are explicit (the original capture code learnt this too). */
      body .resume-header .header-box h1, body .resume-header .header-box h2 {
        display: block !important;
        position: relative !important;
        z-index: 4 !important;
        opacity: 1 !important;
        visibility: visible !important;
        background: transparent !important;
        text-align: left !important;
        -webkit-font-smoothing: antialiased !important;
      }
      body .resume-header .header-box h1 {
        color: ${colors.textPrimary} !important;
        -webkit-text-fill-color: ${colors.textPrimary} !important;
        font: 700 3rem/1.2 'Outfit', 'Sora', sans-serif !important;
        letter-spacing: 0.1em !important;
        margin: 0 !important;
      }
      body .resume-header .header-box h2 {
        color: ${colors.textSecondary} !important;
        -webkit-text-fill-color: ${colors.textSecondary} !important;
        font: 400 1.125rem 'Sora', sans-serif !important;
        letter-spacing: 0.1em !important;
        margin: 0.5rem 0 0 !important;
      }
      .resume-grid { grid-template-columns: 300px 1fr !important; }
      .resume-left { background-color: ${colors.leftBg} !important; }
      .resume-right { background-color: ${colors.rightBg} !important; padding: 2rem 3rem !important; }
      .job-header { flex-direction: row !important; }
      .job-meta { text-align: right !important; }
      .download-pdf { display: none !important; }
      #resume-content, #resume-content * { overflow: visible !important; max-height: none !important; }
    `;
    doc.head.appendChild(style);
  }
}
