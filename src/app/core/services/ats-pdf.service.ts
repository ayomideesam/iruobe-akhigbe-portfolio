// core/services/ats-pdf.service.ts
import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import type { Language, Reference, SkillTier } from './resume-data.service';

interface ResumeData {
  name: string;
  title: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
  profile: string[];
  keyAchievements: string[];
  skills: SkillTier[];
  employment: Array<{
    company: string;
    role: string;
    period: string;
    location: string;
    description?: string;
    achievements?: string[];
    technicalAchievements?: string[];
    technicalLeadership?: string[];
  }>;
  education: {
    degree: string;
    institution: string;
    period: string;
    grade: string;
  };
  certifications: Array<{
    title: string;
    institution: string;
    period: string;
  }>;
  techWatching: string[];
  hobbies: string[];
  languages: Language[];
  references: Reference[];
}

interface PDFColors {
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  textDark: string;
  textLight: string;
  border: string;
}

@Injectable({
  providedIn: 'root'
})
export class AtsPdfService {
  private readonly PAGE_WIDTH = 595.28;
  private readonly PAGE_HEIGHT = 841.89;
  /** Top and bottom page margin, and the right column's outer margin. */
  private readonly MARGIN = 40;
  /** Sidebar geometry: inner padding, content width, and the tinted band that holds both. */
  private readonly SIDEBAR_PAD = 26;
  private readonly LEFT_COLUMN_WIDTH = 146;
  private readonly SIDEBAR_WIDTH = this.SIDEBAR_PAD + this.LEFT_COLUMN_WIDTH + 14;
  /** The main column starts a gutter clear of the band (it used to start flush against it). */
  private readonly RIGHT_COLUMN_X = this.SIDEBAR_WIDTH + 18;
  private readonly RIGHT_COLUMN_WIDTH = this.PAGE_WIDTH - this.RIGHT_COLUMN_X - 34;

  private pdf!: jsPDF;
  private currentY = 0;
  private colors!: PDFColors;
  private isDark = false;
  private leftTotalPages = 0;
  private rightCurrentPage = 1;

  async generateATSFriendlyPDF(resumeData: ResumeData, isDarkTheme: boolean): Promise<void> {
    const { jsPDF } = await import('jspdf');

    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true
    });

    this.isDark = isDarkTheme;

    this.colors = isDarkTheme ? {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      background: '#1E1E1E',
      accent: '#3B82F6',
      textDark: '#F1F5F9',
      textLight: '#94A3B8',
      border: '#334155'
    } : {
      primary: '#0F172A',
      secondary: '#475569',
      background: '#F4F4F4',
      accent: '#2563EB',
      textDark: '#0F172A',
      textLight: '#64748B',
      border: '#E2E8F0'
    };

    // Document metadata: what an ATS or a recruiter's file browser shows first.
    this.pdf.setProperties({
      title: `${resumeData.name} — ${resumeData.title} — Resume`,
      author: 'Akhigbe Iruobe',
      subject: 'Resume',
      keywords: 'Akhigbe Iruobe, Senior Frontend Engineer, Angular, TypeScript, RxJS, React, Next.js, fintech, banking'
    });

    this.drawBackground(isDarkTheme);
    this.drawHeader(resumeData);

    // Left column runs first and may add pages — track how many it creates
    this.drawLeftColumn(resumeData);
    this.leftTotalPages = this.pdf.getNumberOfPages();

    // Right column navigates existing pages then adds more if needed
    this.pdf.setPage(1);
    this.rightCurrentPage = 1;
    this.drawRightColumn(resumeData);

    const fileName = isDarkTheme
      ? 'AkhigbeIruobe-Resume-Dark-ATS.pdf'
      : 'AkhigbeIruobe-Resume-Light-ATS.pdf';

    this.pdf.save(fileName);
  }

  // ─── Page helpers ────────────────────────────────────────────────────────────

  /** Add a new left-column page and return the reset Y position. */
  private newLeftPage(): number {
    this.pdf.addPage();
    this.drawBackground(this.isDark);
    return this.MARGIN + 20;
  }

  /**
   * Advance the right column to the next page.
   * Navigates to an existing page (created by the left column) when available,
   * otherwise creates a fresh page with backgrounds drawn.
   * Returns the reset Y position.
   */
  private advanceRightPage(): number {
    this.rightCurrentPage++;
    if (this.rightCurrentPage <= this.leftTotalPages) {
      this.pdf.setPage(this.rightCurrentPage);
    } else {
      this.pdf.addPage();
      this.drawBackground(this.isDark);
    }
    return this.MARGIN + 20;
  }

  // ─── Backgrounds & Header ────────────────────────────────────────────────────

  private drawBackground(isDarkTheme: boolean): void {
    if (isDarkTheme) {
      this.pdf.setFillColor(30, 30, 30);
    } else {
      this.pdf.setFillColor(244, 244, 244);
    }
    this.pdf.rect(0, 0, this.SIDEBAR_WIDTH, this.PAGE_HEIGHT, 'F');

    if (isDarkTheme) {
      this.pdf.setFillColor(18, 18, 18);
    } else {
      this.pdf.setFillColor(255, 255, 255);
    }
    this.pdf.rect(this.SIDEBAR_WIDTH, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT, 'F');
  }

  private drawHeader(data: ResumeData): void {
    const headerHeight = 85;
    const headerY = this.MARGIN;
    const boxX = this.SIDEBAR_PAD;
    const boxWidth = this.PAGE_WIDTH - this.SIDEBAR_PAD - 34;

    if (this.colors.background === '#1E1E1E') {
      this.pdf.setDrawColor(255, 255, 255);
    } else {
      this.pdf.setDrawColor(0, 0, 0);
    }
    this.pdf.setLineWidth(2);
    this.pdf.rect(boxX, headerY, boxWidth, headerHeight);

    this.pdf.setFontSize(26);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(data.name.toUpperCase(), this.PAGE_WIDTH / 2, headerY + 38, { align: 'center' });

    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.secondary);
    this.pdf.text(data.title, this.PAGE_WIDTH / 2, headerY + 58, { align: 'center' });

    this.currentY = headerY + headerHeight + 25;
  }

  // ─── Left Column ─────────────────────────────────────────────────────────────

  /** The sidebar mirrors the resume page's left column, in the same order:
   *  details, links, skills, tech I'm watching, languages, hobbies. */
  private drawLeftColumn(data: ResumeData): void {
    let leftY = this.currentY;
    const leftX = this.SIDEBAR_PAD;
    const w = this.LEFT_COLUMN_WIDTH;

    leftY = this.drawSectionTitle('DETAILS', leftX, leftY, w);
    leftY = this.drawDetail('PHONE', data.phone, leftX, leftY, w, `tel:${data.phone.replace(/\s/g, '')}`);
    leftY = this.drawDetail('EMAIL', data.email, leftX, leftY, w, `mailto:${data.email}`);
    leftY = this.drawDetail('LOCATION', data.location, leftX, leftY, w);
    leftY += 16;

    leftY = this.drawSectionTitle('LINKS', leftX, leftY, w);
    leftY = this.drawDetail('LinkedIn', data.linkedin, leftX, leftY, w, `https://${data.linkedin}`);
    leftY = this.drawDetail('Portfolio', data.portfolio, leftX, leftY, w, `https://${data.portfolio}`);
    leftY = this.drawDetail('GitHub', data.github, leftX, leftY, w, `https://${data.github}`);
    leftY += 16;

    if (leftY > this.PAGE_HEIGHT - 80) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('SKILLS', leftX, leftY, w);
    leftY = this.drawSkills(data.skills, leftX, leftY, w);
    leftY += 8;

    if (leftY > this.PAGE_HEIGHT - 110) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle("TECH I'M WATCHING", leftX, leftY, w);
    leftY = this.drawTechWatching(data.techWatching, leftX, leftY, w);
    leftY += 16;

    if (leftY > this.PAGE_HEIGHT - 90) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('LANGUAGES', leftX, leftY, w);
    leftY = this.drawLanguages(data.languages, leftX, leftY, w);
    leftY += 16;

    if (leftY > this.PAGE_HEIGHT - 120) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('HOBBIES', leftX, leftY, w);
    this.drawTechWatching(data.hobbies, leftX, leftY, w);
  }

  // ─── Right Column ─────────────────────────────────────────────────────────────

  private drawRightColumn(data: ResumeData): void {
    let rightY = this.currentY;
    const rightX = this.RIGHT_COLUMN_X;
    const w = this.RIGHT_COLUMN_WIDTH;

    rightY = this.drawSectionTitle('PROFILE', rightX, rightY, w);
    rightY = this.drawParagraphs(data.profile, rightX, rightY, w);
    rightY += 10;

    rightY = this.ensureRightRoom(rightY, 70);
    rightY = this.drawSectionTitle('KEY TECHNICAL ACHIEVEMENTS', rightX, rightY, w);
    rightY = this.drawBulletList(data.keyAchievements, rightX, rightY, w, true);
    rightY += 12;

    rightY = this.ensureRightRoom(rightY, 90);
    rightY = this.drawSectionTitle('EMPLOYMENT HISTORY', rightX, rightY, w);
    rightY = this.drawEmploymentHistory(data.employment, rightX, rightY, w);

    rightY = this.ensureRightRoom(rightY, 75);
    rightY = this.drawSectionTitle('EDUCATION', rightX, rightY, w);
    rightY = this.drawEducation(data.education, rightX, rightY, w);
    rightY += 14;

    rightY = this.ensureRightRoom(rightY, 80);
    rightY = this.drawSectionTitle('COURSES / CERTIFICATIONS', rightX, rightY, w);
    rightY = this.drawCertifications(data.certifications, rightX, rightY, w);
    rightY += 12;

    rightY = this.ensureRightRoom(rightY, 120);
    rightY = this.drawSectionTitle('REFERENCES', rightX, rightY, w);
    this.drawReferences(data.references, rightX, rightY, w);
  }

  /** Moves the right column to the next page unless `needed` points fit, so a
   *  section title never sits alone at the foot of a page. */
  private ensureRightRoom(y: number, needed: number): number {
    return y + needed > this.PAGE_HEIGHT - this.MARGIN ? this.advanceRightPage() : y;
  }

  // ─── Shared Section Title & Detail ───────────────────────────────────────────

  private drawSectionTitle(title: string, x: number, y: number, width: number): number {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(title, x, y);

    if (this.colors.background === '#1E1E1E') {
      this.pdf.setDrawColor(96, 165, 250);
    } else {
      this.pdf.setDrawColor(37, 99, 235);
    }
    this.pdf.setLineWidth(1.5);
    this.pdf.line(x, y + 3, x + width, y + 3);

    return y + 18;
  }

  /** Label, then the value; a `url` makes the value a clickable link in the PDF. */
  private drawDetail(label: string, value: string, x: number, y: number, width: number, url?: string): number {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(label, x, y);

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(url ? this.colors.accent : this.colors.textLight);

    const lines: string[] = this.pdf.splitTextToSize(value, width);
    if (url && lines.length === 1) {
      this.pdf.textWithLink(value, x, y + 12, { url });
    } else {
      this.pdf.text(lines, x, y + 12);
    }

    return y + 12 + (lines.length * 10) + 8;
  }

  // ─── Left Column Content ─────────────────────────────────────────────────────

  /** Tier heading, then the tier's skills as one wrapped, comma-separated
   *  line — plain text an ATS parses cleanly, unlike bars or percentages. */
  private drawSkills(tiers: SkillTier[], x: number, y: number, width: number): number {
    let currentY = y;

    tiers.forEach(group => {
      const body = this.cleanTextForATS(group.skills.join(', '));
      const lines = this.pdf.splitTextToSize(body, width);
      const noteLines = group.note ? this.pdf.splitTextToSize(group.note, width) : [];
      const blockHeight = 12 + lines.length * 10 + noteLines.length * 9 + 12;

      if (currentY + blockHeight > this.PAGE_HEIGHT - this.MARGIN) {
        currentY = this.newLeftPage();
      }

      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.accent);
      this.pdf.text(group.tier.toUpperCase(), x, currentY);
      currentY += 12;

      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);
      this.pdf.text(lines, x, currentY);
      currentY += lines.length * 10;

      if (noteLines.length) {
        this.pdf.setFontSize(7.5);
        this.pdf.setFont('helvetica', 'italic');
        this.pdf.setTextColor(this.colors.textLight);
        this.pdf.text(noteLines, x, currentY + 2);
        currentY += noteLines.length * 9 + 2;
      }

      currentY += 12;
    });

    return currentY;
  }

  private drawTechWatching(items: string[], x: number, y: number, _width: number): number {
    let currentY = y;
    items.forEach(item => {
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);
      this.pdf.text(`• ${item}`, x, currentY);
      currentY += 15;
    });
    return currentY;
  }

  /** Name (and note) left, five proficiency dots right; a half level fills half a dot. */
  private drawLanguages(languages: Language[], x: number, y: number, width: number): number {
    let currentY = y;
    const r = 2.6;
    const step = 7.5;
    const filled = this.isDark ? '#60A5FA' : '#2563EB';
    const empty = this.isDark ? '#334155' : '#E2E8F0';

    languages.forEach(lang => {
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);
      this.pdf.text(lang.name, x, currentY);

      for (let i = 0; i < 5; i++) {
        const cx = x + width - r - (4 - i) * step;
        const cy = currentY - 3;
        const level = lang.level - i;
        this.pdf.setFillColor(level >= 1 ? filled : empty);
        this.pdf.circle(cx, cy, r, 'F');
        if (level > 0 && level < 1) {
          // Left half only: clip to a rectangle over the left of the dot.
          this.pdf.saveGraphicsState();
          this.pdf.rect(cx - r, cy - r, r, r * 2, null);
          this.pdf.clip();
          this.pdf.discardPath();
          this.pdf.setFillColor(filled);
          this.pdf.circle(cx, cy, r, 'F');
          this.pdf.restoreGraphicsState();
        }
      }

      if (lang.note) {
        this.pdf.setFontSize(7.5);
        this.pdf.setTextColor(this.colors.textLight);
        this.pdf.text(lang.note, x, currentY + 10);
        currentY += 10;
      }
      currentY += 16;
    });
    return currentY;
  }

  // ─── Right Column Content ─────────────────────────────────────────────────────

  private drawParagraphs(paragraphs: string[], x: number, y: number, width: number): number {
    let currentY = y;
    paragraphs.forEach(para => {
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);
      const lines = this.pdf.splitTextToSize(para, width);
      this.pdf.text(lines, x, currentY);
      currentY += lines.length * 12 + 8;
    });
    return currentY;
  }

  private drawBulletList(items: string[], x: number, y: number, width: number, removeBold: boolean = false): number {
    let currentY = y;
    const bulletIndent = 8;
    const textWidth = width - bulletIndent - 5;

    items.forEach(item => {
      const cleanText = this.cleanTextForATS(item, removeBold);

      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');

      const lines = this.pdf.splitTextToSize(cleanText, textWidth);
      const neededHeight = lines.length * 11 + 4;

      if (currentY + neededHeight > this.PAGE_HEIGHT - this.MARGIN) {
        currentY = this.advanceRightPage();
      }

      this.pdf.setTextColor(this.colors.textDark);
      this.pdf.text('•', x, currentY);

      lines.forEach((line: string, lineIndex: number) => {
        this.pdf.text(line, x + bulletIndent, currentY + (lineIndex * 11));
      });

      currentY += neededHeight;
    });

    return currentY;
  }

  private drawEmploymentHistory(
    jobs: Array<{
      company: string;
      role: string;
      period: string;
      location: string;
      description?: string;
      achievements?: string[];
      technicalAchievements?: string[];
      technicalLeadership?: string[];
    }>,
    x: number,
    y: number,
    width: number
  ): number {
    let currentY = y;

    jobs.forEach((job, index) => {
      // Never strand a job's header at the foot of a page: it needs room for
      // itself, the description and the first highlight.
      this.pdf.setFontSize(9);
      const firstBullet = job.achievements?.[0] ? this.pdf.splitTextToSize(this.cleanTextForATS(job.achievements[0]), width - 13).length : 0;
      const descLinesEstimate = job.description ? this.pdf.splitTextToSize(job.description, width).length : 0;
      const promotedFrom = index > 0 && jobs[index - 1].company === job.company;
      const keepTogether = (promotedFrom ? 14 : 0) + 30 + (descLinesEstimate ? descLinesEstimate * 11 + 6 : 0) + 12 + firstBullet * 11 + 4;
      if (currentY + keepTogether > this.PAGE_HEIGHT - this.MARGIN) {
        currentY = this.advanceRightPage();
      }
      job = { ...job, role: this.cleanTextForATS(job.role), description: job.description && this.cleanTextForATS(job.description) };

      // The earlier role of a promotion pair, as on the resume page.
      if (promotedFrom) {
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.isDark ? '#34D399' : '#059669');
        this.pdf.text('Promoted from this role', x, currentY - 2);
        currentY += 12;
      }

      // Role left, "period · tenure" right: the role wraps inside whatever
      // width the measured period leaves, so the two never collide.
      const tenure = this.calculateTenure(job.period);
      const periodText = tenure ? `${job.period}  ·  ${tenure}` : job.period;
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      const periodWidth = this.pdf.getTextWidth(periodText);
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(periodText, x + width, currentY, { align: 'right' });

      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.accent);
      const roleLines = this.pdf.splitTextToSize(job.role, width - periodWidth - 12);
      this.pdf.text(roleLines, x, currentY);

      currentY += Math.max(roleLines.length * 13, 13);

      // Company + location on same line
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(job.company, x, currentY);

      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(job.location, x + width, currentY, { align: 'right' });

      currentY += 14;

      // Company tenure badge — only on the first (most recent) role of a multi-role company
      const companyTenure = this.calculateCompanyTenure(jobs, index);
      if (companyTenure) {
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'italic');
        this.pdf.setTextColor(this.colors.accent);
        this.pdf.text(`Total at ${job.company}: ${companyTenure}`, x + width, currentY, { align: 'right' });
        currentY += 12;
      }

      // Description
      if (job.description) {
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textDark);
        const descLines = this.pdf.splitTextToSize(job.description, width);
        this.pdf.text(descLines, x, currentY);
        currentY += descLines.length * 11 + 6;
      }

      const groups: Array<[string, string[] | undefined]> = [
        ['Highlights', job.achievements],
        ['Architecture & engineering', job.technicalAchievements],
        ['Leadership', job.technicalLeadership]
      ];
      groups.forEach(([label, items]) => {
        if (!items?.length) return;
        this.pdf.setFontSize(9);
        const firstLines = this.pdf.splitTextToSize(this.cleanTextForATS(items[0]), width - 13).length;
        currentY = this.ensureRightRoom(currentY, 13 + firstLines * 11 + 4);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.accent);
        this.pdf.text(label, x, currentY);
        currentY += 12;
        currentY = this.drawBulletList(items, x, currentY, width);
        currentY += 4;
      });

      currentY += 12;
    });

    return currentY;
  }

  private drawEducation(
    education: { degree: string; institution: string; period: string; grade: string },
    x: number,
    y: number,
    width: number
  ): number {
    let currentY = y;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(education.degree, x, currentY);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(education.period, x + width, currentY, { align: 'right' });
    currentY += 13;

    this.pdf.setTextColor(this.colors.accent);
    const institution = this.pdf.splitTextToSize(education.institution, width);
    this.pdf.text(institution, x, currentY);
    currentY += institution.length * 11;

    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(education.grade, x, currentY);
    return currentY + 12;
  }

  /** Title left and "institution · date" right, or stacked when both won't fit. */
  private drawCertifications(
    certifications: Array<{ title: string; institution: string; period: string }>,
    x: number,
    y: number,
    width: number
  ): number {
    let currentY = y;

    certifications.forEach(cert => {
      const meta = `${cert.institution} · ${cert.period}`;
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(cert.title, x, currentY);
      const titleWidth = this.pdf.getTextWidth(cert.title);

      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textLight);
      if (titleWidth + this.pdf.getTextWidth(meta) + 12 > width) {
        currentY += 11;
        this.pdf.text(meta, x, currentY);
      } else {
        this.pdf.text(meta, x + width, currentY, { align: 'right' });
      }
      currentY += 15;
    });

    return currentY;
  }

  /** Names and companies only, two to a row: referees' contact details are
   *  shared on request, never printed. */
  private drawReferences(references: Reference[], x: number, y: number, width: number): number {
    let currentY = y;
    const colWidth = (width - 12) / 2;

    references.forEach((ref, index) => {
      const colX = index % 2 === 0 ? x : x + colWidth + 12;
      if (index > 0 && index % 2 === 0) currentY += 26;

      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(ref.name, colX, currentY);

      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.accent);
      this.pdf.text(ref.company, colX, currentY + 11);
    });

    currentY += 30;
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text('Contact details available on request.', x, currentY);
    return currentY + 12;
  }

  // ─── Tenure Calculation ───────────────────────────────────────────────────────

  private calculateTenure(period: string): string {
    const monthMap: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
    };

    const parseDate = (raw: string): Date | null => {
      const text = raw.trim();
      if (/present/i.test(text)) return new Date();
      const m = text.match(/([A-Za-z]+)\s+(\d{4})/);
      if (!m) return null;
      const mo = monthMap[m[1].toLowerCase()];
      if (mo === undefined) return null;
      return new Date(parseInt(m[2], 10), mo, 1);
    };

    const parts = period.split('—');
    if (parts.length < 2) return '';
    const start = parseDate(parts[0]);
    const end = parseDate(parts[1]);
    if (!start || !end) return '';

    let total = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    if (total < 1) total = 1;

    const yrs = Math.floor(total / 12);
    const mos = total % 12;
    const yLabel = yrs > 0 ? `${yrs} yr${yrs > 1 ? 's' : ''}` : '';
    const mLabel = mos > 0 ? `${mos} mo${mos > 1 ? 's' : ''}` : '';
    return [yLabel, mLabel].filter(Boolean).join(' ') || '1 mo';
  }

  private calculateCompanyTenure(jobs: Array<{ company: string; period: string }>, index: number): string {
    const job = jobs[index];
    const prev = jobs[index - 1];
    // Only annotate the most-recent (head) role of a company group
    if (prev && prev.company === job.company) return '';

    const group = [job];
    for (let i = index + 1; i < jobs.length; i++) {
      if (jobs[i].company === job.company) group.push(jobs[i]);
      else break;
    }
    if (group.length < 2) return '';

    const earliest = group[group.length - 1].period.split('—')[0];
    const latest = group[0].period.split('—')[1];
    return this.calculateTenure(`${earliest}—${latest}`);
  }

  // ─── ATS Text Cleaning ────────────────────────────────────────────────────────

  private cleanTextForATS(text: string, removeBold: boolean = false): string {
    let clean = text;

    clean = clean.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F910}-\u{1F96B}]|[\u{1F980}-\u{1F9E0}]/gu, '');
    clean = clean.replace(/[\u{FE00}-\u{FE0F}]|[\u{200D}]/gu, '');
    clean = clean.replace(/₦\s?/g, 'NGN ');  // the standard PDF fonts have no ₦ glyph
    clean = clean.replace(/→/g, ' to ');
    clean = clean.replace(/←/g, ' from ');
    clean = clean.replace(/↳/g, '');
    clean = clean.replace(/⬆️/g, '');

    if (removeBold) {
      clean = clean.replace(/\*\*/g, '');
    }

    return clean.replace(/\s+/g, ' ').trim();
  }
}
