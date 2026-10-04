// core/services/ats-pdf.service.ts
import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';
import type { Reference, SkillTier } from './resume-data.service';

interface ResumeData {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio: string;
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
  hobbies: string[];
  techWatching: string[];
  languages: string[];
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
  private readonly MARGIN = 40;
  private readonly LEFT_COLUMN_WIDTH = 180;
  private readonly RIGHT_COLUMN_X = this.MARGIN + this.LEFT_COLUMN_WIDTH + 15;
  private readonly RIGHT_COLUMN_WIDTH = this.PAGE_WIDTH - this.RIGHT_COLUMN_X - this.MARGIN;

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
    this.pdf.rect(0, 0, this.LEFT_COLUMN_WIDTH + this.MARGIN + 15, this.PAGE_HEIGHT, 'F');

    if (isDarkTheme) {
      this.pdf.setFillColor(18, 18, 18);
    } else {
      this.pdf.setFillColor(255, 255, 255);
    }
    this.pdf.rect(this.LEFT_COLUMN_WIDTH + this.MARGIN + 15, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT, 'F');
  }

  private drawHeader(data: ResumeData): void {
    const headerHeight = 85;
    const headerY = this.MARGIN;
    const boxX = this.MARGIN + 15;
    const boxWidth = this.PAGE_WIDTH - (2 * this.MARGIN) - 30;

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

  private drawLeftColumn(data: ResumeData): void {
    let leftY = this.currentY;
    const leftX = this.MARGIN;
    const w = this.LEFT_COLUMN_WIDTH;

    // DETAILS
    leftY = this.drawSectionTitle('DETAILS', leftX, leftY, w);
    leftY = this.drawDetail('PHONE', data.phone, leftX, leftY, w);
    leftY = this.drawDetail('EMAIL', data.email, leftX, leftY, w);
    leftY += 20;

    // LINKS
    if (leftY > this.PAGE_HEIGHT - 80) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('LINKS', leftX, leftY, w);
    leftY = this.drawDetail('LinkedIn', data.linkedin, leftX, leftY, w, true);
    leftY = this.drawDetail('Portfolio', data.portfolio, leftX, leftY, w, true);
    leftY += 20;

    // SKILLS — handles its own page breaks
    if (leftY > this.PAGE_HEIGHT - 80) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('SKILLS', leftX, leftY, w);
    leftY = this.drawSkills(data.skills, leftX, leftY, w);
    leftY += 20;

    // HOBBIES
    if (leftY > this.PAGE_HEIGHT - 80) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('HOBBIES', leftX, leftY, w);
    leftY = this.drawHobbies(data.hobbies, leftX, leftY, w);
    leftY += 20;

    // TECH I'M WATCHING
    if (leftY > this.PAGE_HEIGHT - 80) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle("TECH I'M WATCHING", leftX, leftY, w);
    leftY = this.drawTechWatching(data.techWatching, leftX, leftY, w);
    leftY += 20;

    // LANGUAGES
    if (leftY > this.PAGE_HEIGHT - 60) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('LANGUAGES', leftX, leftY, w);
    leftY = this.drawLanguages(data.languages, leftX, leftY, w);
    leftY += 20;

    // Education, courses and references live in the sidebar: the right column
    // then ends with employment and the CV holds to two pages.
    if (leftY > this.PAGE_HEIGHT - 110) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('EDUCATION', leftX, leftY, w);
    leftY = this.drawEducation(data.education, leftX, leftY, w);
    leftY += 14;

    if (leftY > this.PAGE_HEIGHT - 130) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('COURSES', leftX, leftY, w);
    leftY = this.drawCertifications(data.certifications, leftX, leftY, w);
    leftY += 14;

    if (leftY > this.PAGE_HEIGHT - 150) leftY = this.newLeftPage();
    leftY = this.drawSectionTitle('REFERENCES', leftX, leftY, w);
    this.drawReferences(data.references, leftX, leftY, w);
  }

  // ─── Right Column ─────────────────────────────────────────────────────────────

  private drawRightColumn(data: ResumeData): void {
    let rightY = this.currentY;
    const rightX = this.RIGHT_COLUMN_X;
    const w = this.RIGHT_COLUMN_WIDTH;

    // PROFILE
    rightY = this.drawSectionTitle('PROFILE', rightX, rightY, w);
    rightY = this.drawParagraphs(data.profile, rightX, rightY, w);
    rightY += 15;

    // KEY TECHNICAL ACHIEVEMENTS
    rightY = this.drawSectionTitle('KEY TECHNICAL ACHIEVEMENTS', rightX, rightY, w);
    rightY = this.drawBulletList(data.keyAchievements, rightX, rightY, w, true);
    rightY += 15;

    // EMPLOYMENT HISTORY
    rightY = this.drawSectionTitle('EMPLOYMENT HISTORY', rightX, rightY, w);
    this.drawEmploymentHistory(data.employment, rightX, rightY, w);
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

  private drawDetail(label: string, value: string, x: number, y: number, width: number, isLink: boolean = false): number {
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(label, x, y);

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(isLink ? this.colors.accent : this.colors.textLight);

    const lines = this.pdf.splitTextToSize(value, width);
    this.pdf.text(lines, x, y + 12);

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

  private drawHobbies(hobbies: string[], x: number, y: number, width: number): number {
    let currentY = y;
    hobbies.forEach(hobby => {
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);
      this.pdf.text(`• ${hobby}`, x, currentY);
      currentY += 15;
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

  private drawLanguages(languages: string[], x: number, y: number, _width: number): number {
    let currentY = y;
    languages.forEach(language => {
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);
      this.pdf.text(language, x, currentY);
      currentY += 15;
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
      const keepTogether = 30 + (descLinesEstimate ? descLinesEstimate * 11 + 6 : 0) + firstBullet * 11 + 4;
      if (currentY + keepTogether > this.PAGE_HEIGHT - this.MARGIN) {
        currentY = this.advanceRightPage();
      }
      job = { ...job, role: this.cleanTextForATS(job.role), description: job.description && this.cleanTextForATS(job.description) };

      // Role + period on same line
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.accent);

      const periodWidth = 120;
      const roleLines = this.pdf.splitTextToSize(job.role, width - periodWidth - 10);
      this.pdf.text(roleLines, x, currentY);

      // Period · tenure aligned right
      const tenure = this.calculateTenure(job.period);
      const periodText = tenure ? `${job.period}  ·  ${tenure}` : job.period;
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(periodText, x + width, currentY, { align: 'right' });

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

      // Technical Leadership
      if (job.technicalLeadership && job.technicalLeadership.length > 0) {
        if (currentY > this.PAGE_HEIGHT - 80) {
          currentY = this.advanceRightPage();
        }
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.accent);
        this.pdf.text('Technical Leadership:', x, currentY);
        currentY += 13;
        currentY = this.drawBulletList(job.technicalLeadership, x, currentY, width);
        currentY += 8;
      }

      // Key Achievements & Business Impact
      if (job.achievements && job.achievements.length > 0) {
        if (currentY > this.PAGE_HEIGHT - 80) {
          currentY = this.advanceRightPage();
        }
        currentY = this.drawBulletList(job.achievements, x, currentY, width);
        currentY += 4;
      }

      // Technical Architecture & Implementation
      if (job.technicalAchievements && job.technicalAchievements.length > 0) {
        if (currentY > this.PAGE_HEIGHT - 80) {
          currentY = this.advanceRightPage();
        }
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.accent);
        this.pdf.text('Technical Architecture & Implementation:', x, currentY);
        currentY += 13;
        currentY = this.drawBulletList(job.technicalAchievements, x, currentY, width);
        currentY += 8;
      }

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

    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(education.degree, x, currentY);
    currentY += 11;

    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.accent);
    const institution = this.pdf.splitTextToSize(education.institution, width);
    this.pdf.text(institution, x, currentY);
    currentY += institution.length * 10;

    this.pdf.setTextColor(this.colors.textLight);
    const meta = this.pdf.splitTextToSize(`${education.period} · ${education.grade}`, width);
    this.pdf.text(meta, x, currentY);
    return currentY + meta.length * 10;
  }

  /** Title, then institution and date in the muted colour, sized for the sidebar. */
  private drawCertifications(
    certifications: Array<{ title: string; institution: string; period: string }>,
    x: number,
    y: number,
    width: number
  ): number {
    let currentY = y;

    certifications.forEach(cert => {
      this.pdf.setFontSize(8.5);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      const title = this.pdf.splitTextToSize(cert.title, width);
      this.pdf.text(title, x, currentY);
      currentY += title.length * 10;

      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(`${cert.institution} · ${cert.period}`, x, currentY);
      currentY += 15;
    });

    return currentY;
  }

  /** Names and companies only: referees' contact details are shared on
   *  request, never printed. */
  private drawReferences(references: Reference[], x: number, y: number, width: number): number {
    let currentY = y;

    references.forEach(ref => {
      this.pdf.setFontSize(8.5);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(ref.name, x, currentY);

      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.accent);
      this.pdf.text(this.pdf.splitTextToSize(ref.company, width), x, currentY + 10);
      currentY += 24;
    });

    this.pdf.setFontSize(7.5);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text('Contact details available on request.', x, currentY);
    return currentY + 10;
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
