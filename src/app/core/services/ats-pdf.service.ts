// core/services/ats-pdf.service.ts
import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import type { AtsResume, Job } from './resume-data.service';

interface PDFColors {
  primary: string;
  secondary: string;
  accent: string;
  textDark: string;
  textLight: string;
  rule: string;
  promoted: string;
}

/** A run of text inside a wrapped line: bold or normal, optionally a link. */
interface Segment {
  text: string;
  bold?: boolean;
  url?: string;
}

/**
 * The ATS resume: one column, top to bottom, in the order every parser
 * expects — contact header, profile, achievements, skills, experience,
 * education, certifications, languages, interests, references.
 *
 * Single column on purpose. A two-column PDF reads cleanly in content-stream
 * order (modern ATS), but parsers that rebuild lines by position interleave the
 * sidebar into the main text; one column cannot be misread either way. The
 * visual PDF keeps the designed two-column layout.
 */
@Injectable({
  providedIn: 'root'
})
export class AtsPdfService {
  private readonly PAGE_WIDTH = 595.28;
  private readonly PAGE_HEIGHT = 841.89;
  private readonly MARGIN_X = 50;
  private readonly MARGIN_TOP = 46;
  private readonly MARGIN_BOTTOM = 52;
  private readonly WIDTH = this.PAGE_WIDTH - this.MARGIN_X * 2;
  private readonly BODY = 9.5;
  private readonly LINE = 13;

  private pdf!: jsPDF;
  private y = 0;
  private colors!: PDFColors;
  private isDark = false;

  async generateATSFriendlyPDF(data: AtsResume, isDarkTheme: boolean): Promise<void> {
    const { jsPDF } = await import('jspdf');
    this.pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true });
    this.isDark = isDarkTheme;
    this.colors = isDarkTheme ? {
      primary: '#F1F5F9', secondary: '#CBD5E1', accent: '#60A5FA',
      textDark: '#E2E8F0', textLight: '#94A3B8', rule: '#334155', promoted: '#34D399'
    } : {
      primary: '#0F172A', secondary: '#334155', accent: '#1D4ED8',
      textDark: '#1E293B', textLight: '#64748B', rule: '#CBD5E1', promoted: '#047857'
    };

    this.pdf.setProperties({
      title: `${data.name} — Resume`,
      author: data.name,
      subject: data.title,
      keywords: 'Akhigbe Iruobe, Senior Frontend Engineer, Angular, TypeScript, RxJS, React, Next.js, fintech, banking'
    });

    this.paintBackground();
    this.y = this.MARGIN_TOP;

    this.drawHeader(data);

    this.section('PROFILE');
    data.profile.forEach((para, i) => this.paragraph(para, i === data.profile.length - 1 ? 0 : 6));

    this.section('KEY ACHIEVEMENTS');
    data.keyAchievements.forEach(item => {
      const colon = item.indexOf(':');
      this.bullet(colon > 0
        ? [{ text: item.slice(0, colon + 1) + ' ', bold: true }, { text: item.slice(colon + 1).trim() }]
        : [{ text: item }]);
    });

    this.section('SKILLS');
    data.skills.forEach(tier => {
      this.richParagraph([{ text: `${tier.tier}: `, bold: true }, { text: tier.skills.join(', ') + (tier.note ? `. ${tier.note}` : '') }], 4);
    });

    this.section('PROFESSIONAL EXPERIENCE', this.jobNeeds(data.employment[0], data.employment, 0));
    data.employment.forEach((job, i) => this.drawJob(job, data.employment, i));

    this.section('EDUCATION');
    this.twoSided([{ text: data.education.degree, bold: true }], data.education.period);
    this.paragraph(`${data.education.institution} · ${data.education.grade}`, 0);

    this.section('CERTIFICATIONS');
    data.certifications.forEach(c => this.twoSided([{ text: c.title + ' ', bold: true }, { text: `· ${c.institution}` }], c.period, 2));

    this.section('LANGUAGES');
    this.paragraph(data.languages.map(l => `${l.name} ${l.level}/5${l.note ? ` (${l.note})` : ''}`).join(' · '), 0);

    this.section("TECH I'M WATCHING");
    this.paragraph(data.techWatching.join(' · '), 0);

    this.section('HOBBIES');
    this.paragraph(data.hobbies.join(' · '), 0);

    this.section('REFERENCES');
    this.paragraph(data.references.map(r => `${r.name} (${r.company})`).join(' · '), 4);
    this.paragraph('Contact details available on request.', 0, 'italic');

    this.drawPageNumbers(data.name);

    this.pdf.save(isDarkTheme ? 'AkhigbeIruobe-Resume-Dark-ATS.pdf' : 'AkhigbeIruobe-Resume-Light-ATS.pdf');
  }

  // ─── Layout primitives ───────────────────────────────────────────────────────

  private paintBackground(): void {
    if (!this.isDark) return; // white paper
    this.pdf.setFillColor(18, 18, 18);
    this.pdf.rect(0, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT, 'F');
  }

  /** Starts a new page unless `needed` points still fit on this one. */
  private ensureRoom(needed: number): void {
    if (this.y + needed <= this.PAGE_HEIGHT - this.MARGIN_BOTTOM) return;
    this.pdf.addPage();
    this.paintBackground();
    this.y = this.MARGIN_TOP;
  }

  private drawHeader(data: AtsResume): void {
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(24);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(data.name.toUpperCase(), this.MARGIN_X, this.y + 18);
    this.y += 36;

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.accent);
    this.pdf.text(this.clean(data.title), this.MARGIN_X, this.y);
    this.y += 16;

    this.richParagraph([{ text: data.location }], 1, 9, this.MARGIN_X, this.WIDTH, this.colors.textLight);
    const sep: Segment = { text: ' · ' };
    this.richParagraph([
      { text: data.phone, url: `tel:${data.phone.replace(/\s/g, '')}` }, sep,
      { text: data.email, url: `mailto:${data.email}` }, sep,
      { text: data.linkedin, url: `https://${data.linkedin}` }, sep,
      { text: data.portfolio, url: `https://${data.portfolio}` }, sep,
      { text: data.github, url: `https://${data.github}` }
    ], 0, 9);

    this.y += 2;
    this.rule(1.2, this.colors.accent);
  }

  /** A heading never ends a page: it needs room for itself plus `keepWith` points of what follows. */
  private section(title: string, keepWith = 2 * 13): void {
    this.ensureRoom(38 + keepWith);
    this.y += 20;
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10.5);
    this.pdf.setTextColor(this.colors.accent);
    this.pdf.text(title, this.MARGIN_X, this.y);
    this.y += 5;
    this.rule(0.6, this.colors.rule);
    this.y += 13;
  }

  private rule(width: number, color: string): void {
    this.pdf.setDrawColor(color);
    this.pdf.setLineWidth(width);
    this.pdf.line(this.MARGIN_X, this.y, this.MARGIN_X + this.WIDTH, this.y);
  }

  private paragraph(text: string, after = 6, style: 'normal' | 'italic' = 'normal'): void {
    this.pdf.setFont('helvetica', style);
    this.pdf.setFontSize(this.BODY);
    this.pdf.setTextColor(style === 'italic' ? this.colors.textLight : this.colors.textDark);
    const lines: string[] = this.pdf.splitTextToSize(this.clean(text), this.WIDTH);
    lines.forEach((line, i) => {
      this.ensureRoom(this.LINE);
      this.pdf.text(line, this.MARGIN_X, this.y);
      if (i < lines.length - 1) this.y += this.LINE;
    });
    this.y += this.LINE + after;
  }

  /**
   * Word-wraps runs of mixed weight (and links) inside `width` from `x`,
   * then advances this.y past the block.
   */
  private richParagraph(segments: Segment[], after = 6, size = this.BODY, x = this.MARGIN_X, width = this.WIDTH, color?: string): void {
    this.pdf.setFontSize(size);
    const lineHeight = Math.round(size * 1.37);
    type Word = { text: string; bold: boolean; url?: string; spaceAfter: boolean };
    const words: Word[] = [];
    for (const seg of segments) {
      const parts = this.clean(seg.text, false).split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          if (words.length) words[words.length - 1].spaceAfter = true;
          continue;
        }
        words.push({ text: part, bold: !!seg.bold, url: seg.url, spaceAfter: false });
      }
    }

    const widthOf = (w: Word) => {
      this.pdf.setFont('helvetica', w.bold ? 'bold' : 'normal');
      return this.textWidth(w.text);
    };
    this.pdf.setFont('helvetica', 'normal');
    const space = this.textWidth(' ');

    this.ensureRoom(lineHeight);
    let cx = x;
    words.forEach((w, i) => {
      const ww = widthOf(w);
      if (cx > x && cx + ww > x + width) {
        this.y += lineHeight;
        this.ensureRoom(lineHeight);
        cx = x;
      }
      this.pdf.setFont('helvetica', w.bold ? 'bold' : 'normal');
      this.pdf.setTextColor(color ?? (w.url ? this.colors.accent : (w.bold ? this.colors.primary : this.colors.textDark)));
      if (w.url) this.pdf.textWithLink(w.text, cx, this.y, { url: w.url });
      else this.pdf.text(w.text, cx, this.y);
      cx += ww + (w.spaceAfter && i < words.length - 1 ? space : 0);
    });
    this.y += lineHeight + after;
  }

  private bullet(segments: Segment[], after = 3): void {
    this.ensureRoom(this.LINE);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(this.BODY);
    this.pdf.setTextColor(this.colors.accent);
    this.pdf.text('•', this.MARGIN_X + 2, this.y);
    this.richParagraph(segments, after, this.BODY, this.MARGIN_X + 12, this.WIDTH - 12);
  }

  /** Left content and a right-aligned note (dates) on the same first line. */
  private twoSided(left: Segment[], right: string, after = 3, size = this.BODY): void {
    this.ensureRoom(this.LINE);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(size);
    const rightW = this.textWidth(right);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(right, this.MARGIN_X + this.WIDTH, this.y, { align: 'right' });
    this.richParagraph(left, after, size, this.MARGIN_X, this.WIDTH - rightW - 14);
  }

  /** Points a role needs to keep its header with its description and first bullet. */
  private jobNeeds(job: Job, jobs: Job[], index: number): number {
    const promotedFrom = index > 0 && jobs[index - 1].company === job.company;
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(this.BODY);
    const firstLines = this.pdf.splitTextToSize(this.clean(job.achievements?.[0] ?? ''), this.WIDTH - 12).length;
    const descLines = job.description ? this.pdf.splitTextToSize(this.clean(job.description), this.WIDTH).length : 0;
    return (promotedFrom ? 12 : 0) + 40 + descLines * this.LINE + 12 + firstLines * this.LINE;
  }

  private drawJob(job: Job, jobs: Job[], index: number): void {
    const promotedFrom = index > 0 && jobs[index - 1].company === job.company;
    const period = `${job.period.replace(' — ', ' – ')}  ·  ${this.tenure(job.period)}`;
    this.ensureRoom(this.jobNeeds(job, jobs, index));

    if (index > 0) this.y += 10;
    if (promotedFrom) {
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(this.colors.promoted);
      this.pdf.text('Promoted from this role', this.MARGIN_X, this.y);
      this.y += 12;
    }

    // Role (left) · dates and tenure (right); the role wraps inside what the dates leave.
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    const periodW = this.textWidth(period);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(period, this.MARGIN_X + this.WIDTH, this.y, { align: 'right' });
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(11);
    this.pdf.setTextColor(this.colors.accent);
    const roleLines: string[] = this.pdf.splitTextToSize(this.clean(job.role), this.WIDTH - periodW - 14);
    this.pdf.text(roleLines, this.MARGIN_X, this.y);
    this.y += roleLines.length * 13 + 1;

    // Company · location (left) · total tenure at the company (right)
    const companyTotal = this.companyTenure(jobs, index);
    if (companyTotal) {
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setFontSize(8.5);
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(`${companyTotal} at ${job.company}`, this.MARGIN_X + this.WIDTH, this.y, { align: 'right' });
    }
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(job.company, this.MARGIN_X, this.y);
    const companyW = this.textWidth(job.company);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9.5);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(`  ·  ${job.location}`, this.MARGIN_X + companyW, this.y);
    this.y += 15;

    if (job.description) this.paragraph(job.description, 3);

    const groups: Array<[string, string[] | undefined]> = [
      ['Highlights', job.achievements],
      ['Architecture & engineering', job.technicalAchievements],
      ['Leadership', job.technicalLeadership]
    ];
    groups.forEach(([label, items]) => {
      if (!items?.length) return;
      this.ensureRoom(12 + 2 * this.LINE);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(this.colors.secondary);
      this.pdf.text(label, this.MARGIN_X, this.y);
      this.y += 12;
      items.forEach(item => this.bullet([{ text: item }]));
      this.y += 2;
    });
  }

  private drawPageNumbers(name: string): void {
    const total = this.pdf.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      this.pdf.setPage(p);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(`${name} — Resume`, this.MARGIN_X, this.PAGE_HEIGHT - 26);
      this.pdf.text(`Page ${p} of ${total}`, this.MARGIN_X + this.WIDTH, this.PAGE_HEIGHT - 26, { align: 'right' });
    }
  }

  /**
   * Rendered width in points. jsPDF's getTextWidth applies AFM kerning pairs
   * (Te, AT, VA…) that the PDF never draws, so a word-by-word layout measured
   * with it sets the next word too close and the space disappears.
   */
  private textWidth(text: string): number {
    const pdf = this.pdf as unknown as { getStringUnitWidth(t: string, o: { doKerning: boolean }): number };
    return pdf.getStringUnitWidth(text, { doKerning: false }) * this.pdf.getFontSize() / this.pdf.internal.scaleFactor;
  }

  // ─── Tenure ──────────────────────────────────────────────────────────────────

  private tenure(period: string): string {
    const monthMap: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };
    const parse = (raw: string): Date | null => {
      const text = raw.trim();
      if (/present/i.test(text)) return new Date();
      const m = text.match(/([A-Za-z]+)\s+(\d{4})/);
      if (!m) return null;
      const mo = monthMap[m[1].toLowerCase()];
      return mo === undefined ? null : new Date(parseInt(m[2], 10), mo, 1);
    };
    const parts = period.split('—');
    if (parts.length < 2) return '';
    const start = parse(parts[0]);
    const end = parse(parts[1]);
    if (!start || !end) return '';
    const total = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
    const yrs = Math.floor(total / 12);
    const mos = total % 12;
    return [yrs ? `${yrs} yr${yrs > 1 ? 's' : ''}` : '', mos ? `${mos} mo${mos > 1 ? 's' : ''}` : ''].filter(Boolean).join(' ') || '1 mo';
  }

  /** Combined tenure, shown on the most recent role of a multi-role company. */
  private companyTenure(jobs: Job[], index: number): string {
    const job = jobs[index];
    if (index > 0 && jobs[index - 1].company === job.company) return '';
    const group = [job];
    for (let i = index + 1; i < jobs.length && jobs[i].company === job.company; i++) group.push(jobs[i]);
    if (group.length < 2) return '';
    return this.tenure(`${group[group.length - 1].period.split('—')[0]}—${group[0].period.split('—')[1]}`);
  }

  // ─── Text cleaning ───────────────────────────────────────────────────────────

  /** Standard PDF fonts speak Windows-1252: map ₦ and arrows, drop emoji. */
  private clean(text: string, collapse = true): string {
    let out = text
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}][\u{FE0F}\u{200D}]?/gu, '')
      .replace(/₦\s?/g, 'NGN ')
      .replace(/→/g, ' to ')
      .replace(/←/g, ' from ')
      .replace(/↑/g, '')
      .replace(/\*\*/g, '');
    if (collapse) out = out.replace(/\s+/g, ' ').trim();
    return out;
  }
}
