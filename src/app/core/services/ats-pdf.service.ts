import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf';

interface ResumeData {
  name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  portfolio: string;
  profile: string[];
  keyAchievements: string[];
  skills: Array<{ name: string; level: number }>;
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
  languages: string[];
  references: Array<{
    name: string;
    company: string;
    email: string;
    phone: string;
  }>;
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
  private readonly PAGE_WIDTH = 595.28; // A4 width in points
  private readonly PAGE_HEIGHT = 841.89; // A4 height in points
  private readonly MARGIN = 40;
  private readonly LEFT_COLUMN_WIDTH = 180;
  private readonly RIGHT_COLUMN_X = this.MARGIN + this.LEFT_COLUMN_WIDTH + 15;
  private readonly RIGHT_COLUMN_WIDTH = this.PAGE_WIDTH - this.RIGHT_COLUMN_X - this.MARGIN;

  private pdf!: jsPDF;
  private currentY = 0;
  private colors!: PDFColors;

  async generateATSFriendlyPDF(resumeData: ResumeData, isDarkTheme: boolean): Promise<void> {
    const { jsPDF } = await import('jspdf');

    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true
    });

    // Set colors based on theme
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

    // Draw background
    this.drawBackground(isDarkTheme);

    // Header
    this.drawHeader(resumeData);

    // Main content - Two column layout
    this.drawLeftColumn(resumeData);
    this.drawRightColumn(resumeData);

    // Save the PDF
    const fileName = isDarkTheme
      ? 'AkhigbeIruobe-Resume-Dark-ATS.pdf'
      : 'AkhigbeIruobe-Resume-Light-ATS.pdf';

    this.pdf.save(fileName);
  }

  private drawBackground(isDarkTheme: boolean): void {
    // Left column background
    if (isDarkTheme) {
      this.pdf.setFillColor(30, 30, 30); // #1E1E1E
    } else {
      this.pdf.setFillColor(244, 244, 244); // #F4F4F4
    }
    this.pdf.rect(0, 0, this.LEFT_COLUMN_WIDTH + this.MARGIN + 15, this.PAGE_HEIGHT, 'F');

    // Right column background
    if (isDarkTheme) {
      this.pdf.setFillColor(18, 18, 18); // #121212
    } else {
      this.pdf.setFillColor(255, 255, 255); // #FFFFFF
    }
    this.pdf.rect(this.LEFT_COLUMN_WIDTH + this.MARGIN + 15, 0, this.PAGE_WIDTH, this.PAGE_HEIGHT, 'F');
  }

  private drawHeader(data: ResumeData): void {
    // Header box with border
    const headerHeight = 85;
    const headerY = this.MARGIN;
    const boxX = this.MARGIN + 15;
    const boxWidth = this.PAGE_WIDTH - (2 * this.MARGIN) - 30;

    // Draw border using RGB
    if (this.colors.background === '#1E1E1E') {
      this.pdf.setDrawColor(255, 255, 255); // White border for dark theme
    } else {
      this.pdf.setDrawColor(0, 0, 0); // Black border for light theme
    }
    this.pdf.setLineWidth(2);
    this.pdf.rect(boxX, headerY, boxWidth, headerHeight);

    // Name
    this.pdf.setFontSize(26);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(data.name.toUpperCase(), this.PAGE_WIDTH / 2, headerY + 38, { align: 'center' });

    // Title
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.secondary);
    this.pdf.text(data.title, this.PAGE_WIDTH / 2, headerY + 58, { align: 'center' });

    this.currentY = headerY + headerHeight + 25;
  }

  private drawLeftColumn(data: ResumeData): void {
    let leftY = this.currentY;
    const leftX = this.MARGIN;
    const columnWidth = this.LEFT_COLUMN_WIDTH;

    // Details Section
    leftY = this.drawSectionTitle('DETAILS', leftX, leftY, columnWidth);
    leftY = this.drawDetail('PHONE', data.phone, leftX, leftY, columnWidth);
    leftY = this.drawDetail('EMAIL', data.email, leftX, leftY, columnWidth);
    leftY += 20;

    // Links Section
    leftY = this.drawSectionTitle('LINKS', leftX, leftY, columnWidth);
    leftY = this.drawDetail('LinkedIn', data.linkedin, leftX, leftY, columnWidth, true);
    leftY = this.drawDetail('Portfolio', data.portfolio, leftX, leftY, columnWidth, true);
    leftY += 20;

    // Skills Section
    leftY = this.drawSectionTitle('SKILLS', leftX, leftY, columnWidth);
    leftY = this.drawSkills(data.skills, leftX, leftY, columnWidth);
    leftY += 20;

    // Hobbies Section
    leftY = this.drawSectionTitle('HOBBIES', leftX, leftY, columnWidth);
    leftY = this.drawHobbies(data.hobbies, leftX, leftY, columnWidth);
    leftY += 20;

    // Languages Section
    leftY = this.drawSectionTitle('LANGUAGES', leftX, leftY, columnWidth);
    leftY = this.drawLanguages(data.languages, leftX, leftY, columnWidth);
  }

  private drawRightColumn(data: ResumeData): void {
    let rightY = this.currentY;
    const rightX = this.RIGHT_COLUMN_X;
    const columnWidth = this.RIGHT_COLUMN_WIDTH;

    // Profile Section
    rightY = this.drawSectionTitle('PROFILE', rightX, rightY, columnWidth);
    rightY = this.drawParagraphs(data.profile, rightX, rightY, columnWidth);
    rightY += 15;

    // Key Achievements Section - Remove emoji for ATS compatibility
    rightY = this.drawSectionTitle('KEY TECHNICAL ACHIEVEMENTS', rightX, rightY, columnWidth);
    rightY = this.drawBulletList(data.keyAchievements, rightX, rightY, columnWidth, true);
    rightY += 15;

    // Employment History
    rightY = this.drawSectionTitle('EMPLOYMENT HISTORY', rightX, rightY, columnWidth);
    rightY = this.drawEmploymentHistory(data.employment, rightX, rightY, columnWidth);

    // Check if we have enough space for Education, Certifications, and References
    // If not enough space on current page, add new page
    const estimatedRemainingContent = 250; // Approximate height needed for remaining sections
    if (rightY > this.PAGE_HEIGHT - estimatedRemainingContent) {
      this.pdf.addPage();
      this.drawBackground(this.colors.background === '#1E1E1E');
      rightY = this.MARGIN;
    } else {
      rightY += 10; // Just add some spacing
    }

    // Education Section
    rightY = this.drawSectionTitle('EDUCATION', rightX, rightY, columnWidth);
    rightY = this.drawEducation(data.education, rightX, rightY, columnWidth);
    rightY += 15;

    // Check if we need a new page for Certifications
    if (rightY > this.PAGE_HEIGHT - 200) {
      this.pdf.addPage();
      this.drawBackground(this.colors.background === '#1E1E1E');
      rightY = this.MARGIN;
    }

    // Certifications Section
    rightY = this.drawSectionTitle('COURSES / CERTIFICATIONS', rightX, rightY, columnWidth);
    rightY = this.drawCertifications(data.certifications, rightX, rightY, columnWidth);
    rightY += 15;

    // Check if we need a new page for References
    if (rightY > this.PAGE_HEIGHT - 180) {
      this.pdf.addPage();
      this.drawBackground(this.colors.background === '#1E1E1E');
      rightY = this.MARGIN;
    }

    // References Section
    rightY = this.drawSectionTitle('REFERENCES', rightX, rightY, columnWidth);
    rightY = this.drawReferences(data.references, rightX, rightY, columnWidth);
  }

  private drawSectionTitle(title: string, x: number, y: number, width: number): number {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);

    this.pdf.text(title, x, y);

    // Draw underline using RGB for accent color
    if (this.colors.background === '#1E1E1E') {
      this.pdf.setDrawColor(96, 165, 250); // Dark theme #60A5FA
    } else {
      this.pdf.setDrawColor(37, 99, 235); // Light theme #2563EB
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

  private drawSkills(skills: Array<{ name: string; level: number }>, x: number, y: number, width: number): number {
    let currentY = y;

    skills.forEach(skill => {
      // Skill name
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);

      const lines = this.pdf.splitTextToSize(skill.name, width - 35);
      this.pdf.text(lines, x, currentY);

      const skillTextHeight = lines.length * 10;

      // Draw percentage aligned to the right
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(`${skill.level}%`, x + width, currentY + (skillTextHeight / 2), { align: 'right' });

      currentY += skillTextHeight + 2;

      // Draw progress bar background
      const barHeight = 3;
      const barY = currentY;

      // Background bar (gray) - use RGB values
      if (this.colors.background === '#1E1E1E') {
        this.pdf.setFillColor(51, 65, 85); // Dark theme border #334155
      } else {
        this.pdf.setFillColor(226, 232, 240); // Light theme border #E2E8F0
      }
      this.pdf.rect(x, barY, width, barHeight, 'F');

      // Progress bar (accent color) - use RGB values
      const progressWidth = (skill.level / 100) * width;
      if (this.colors.background === '#1E1E1E') {
        this.pdf.setFillColor(96, 165, 250); // Dark theme accent #60A5FA
      } else {
        this.pdf.setFillColor(37, 99, 235); // Light theme accent #2563EB
      }
      this.pdf.rect(x, barY, progressWidth, barHeight, 'F');

      currentY += barHeight + 12;
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

  private drawLanguages(languages: string[], x: number, y: number, width: number): number {
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

    items.forEach((item, index) => {
      // Check if we need a new page before drawing this bullet
      if (currentY > this.PAGE_HEIGHT - 60) {
        this.pdf.addPage();
        this.drawBackground(this.colors.background === '#1E1E1E');
        currentY = this.MARGIN + 20;
      }

      // Clean text for ATS compatibility
      let cleanText = this.cleanTextForATS(item, removeBold);

      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textDark);

      // Use proper text wrapping with bullet indent
      const bulletWidth = 8;
      const textWidth = width - bulletWidth - 5;
      const lines = this.pdf.splitTextToSize(cleanText, textWidth);

      // Draw bullet
      this.pdf.text('•', x, currentY);

      // Draw text with proper indent for wrapped lines
      lines.forEach((line: string, lineIndex: number) => {
        this.pdf.text(line, x + bulletWidth, currentY + (lineIndex * 11));
      });

      currentY += lines.length * 11 + 4;
    });

    return currentY;
  }

  /**
   * Clean text for ATS compatibility - removes emojis, special characters, and formatting
   */
  private cleanTextForATS(text: string, removeBold: boolean = false): string {
    let cleanText = text;

    // Remove all emojis and special unicode characters
    cleanText = cleanText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F910}-\u{1F96B}]|[\u{1F980}-\u{1F9E0}]/gu, '');

    // Remove variation selectors and zero-width joiners
    cleanText = cleanText.replace(/[\u{FE00}-\u{FE0F}]|[\u{200D}]/gu, '');

    // Replace arrow characters with text equivalents
    cleanText = cleanText.replace(/→/g, ' to ');
    cleanText = cleanText.replace(/←/g, ' from ');
    cleanText = cleanText.replace(/↳/g, '');
    cleanText = cleanText.replace(/⬆️/g, '');

    if (removeBold) {
      // Remove bold markers
      cleanText = cleanText.replace(/\*\*/g, '');
    }

    // Clean up multiple spaces
    cleanText = cleanText.replace(/\s+/g, ' ').trim();

    return cleanText;
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
      // Check if we need a new page
      if (currentY > this.PAGE_HEIGHT - 100) {
        this.pdf.addPage();
        this.drawBackground(this.colors.background === '#1E1E1E');
        currentY = this.MARGIN + 20;
      }

      // Job role and period on same line
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.accent);

      // Split role if too long, accounting for period width
      const periodWidth = 100;
      const roleLines = this.pdf.splitTextToSize(job.role, width - periodWidth - 10);
      this.pdf.text(roleLines, x, currentY);

      // Period aligned to the right
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(job.period, x + width, currentY, { align: 'right' });

      currentY += Math.max(roleLines.length * 13, 13);

      // Company name and location on same line
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(job.company, x, currentY);

      // Location aligned to the right
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(job.location, x + width, currentY, { align: 'right' });

      currentY += 18;

      // Description
      if (job.description) {
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(this.colors.textDark);
        const descLines = this.pdf.splitTextToSize(job.description, width);
        this.pdf.text(descLines, x, currentY);
        currentY += descLines.length * 11 + 12;
      }

      // Technical Leadership
      if (job.technicalLeadership && job.technicalLeadership.length > 0) {
        // Check if section header + first bullet will fit
        if (currentY > this.PAGE_HEIGHT - 80) {
          this.pdf.addPage();
          this.drawBackground(this.colors.background === '#1E1E1E');
          currentY = this.MARGIN + 20;
        }

        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.accent);
        this.pdf.text('Technical Leadership:', x, currentY);
        currentY += 13;
        currentY = this.drawBulletList(job.technicalLeadership, x, currentY, width);
        currentY += 8;
      }

      // Key Achievements
      if (job.achievements && job.achievements.length > 0) {
        // Check if section header + first bullet will fit
        if (currentY > this.PAGE_HEIGHT - 80) {
          this.pdf.addPage();
          this.drawBackground(this.colors.background === '#1E1E1E');
          currentY = this.MARGIN + 20;
        }

        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.accent);
        this.pdf.text('Key Achievements & Business Impact:', x, currentY);
        currentY += 13;
        currentY = this.drawBulletList(job.achievements, x, currentY, width);
        currentY += 8;
      }

      // Technical Achievements
      if (job.technicalAchievements && job.technicalAchievements.length > 0) {
        // Check if section header + first bullet will fit
        if (currentY > this.PAGE_HEIGHT - 80) {
          this.pdf.addPage();
          this.drawBackground(this.colors.background === '#1E1E1E');
          currentY = this.MARGIN + 20;
        }

        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(this.colors.accent);
        this.pdf.text('Technical Architecture & Implementation:', x, currentY);
        currentY += 13;
        currentY = this.drawBulletList(job.technicalAchievements, x, currentY, width);
        currentY += 8;
      }

      currentY += 18;
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

    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(this.colors.primary);
    this.pdf.text(education.degree, x, currentY);

    currentY += 15;

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.colors.accent);
    this.pdf.text(education.institution, x, currentY);

    currentY += 12;

    this.pdf.setFontSize(9);
    this.pdf.setTextColor(this.colors.textLight);
    this.pdf.text(`${education.period} | ${education.grade}`, x, currentY);

    return currentY + 20;
  }

  private drawCertifications(
    certifications: Array<{ title: string; institution: string; period: string }>,
    x: number,
    y: number,
    width: number
  ): number {
    let currentY = y;

    certifications.forEach(cert => {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(cert.title, x, currentY);

      currentY += 12;

      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(cert.institution, x, currentY);

      this.pdf.text(cert.period, x + width - 80, currentY, { align: 'right' });

      currentY += 18;
    });

    return currentY;
  }

  private drawReferences(
    references: Array<{ name: string; company: string; email: string; phone: string }>,
    x: number,
    y: number,
    width: number
  ): number {
    let currentY = y;
    const cardWidth = (width - 10) / 2;

    references.forEach((ref, index) => {
      const isLeft = index % 2 === 0;
      const cardX = isLeft ? x : x + cardWidth + 10;

      if (!isLeft && index > 0) {
        // Don't increment Y for right column
      } else if (index >= 2) {
        currentY += 65;
      }

      // Draw card border
      this.pdf.setDrawColor(this.colors.border);
      this.pdf.setLineWidth(0.5);
      this.pdf.rect(cardX, currentY - 10, cardWidth, 60);

      // Name
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.colors.primary);
      this.pdf.text(ref.name, cardX + 5, currentY);

      // Company
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.colors.accent);
      this.pdf.text(ref.company, cardX + 5, currentY + 12);

      // Email
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(this.colors.textLight);
      this.pdf.text(ref.email, cardX + 5, currentY + 28);

      // Phone
      this.pdf.text(ref.phone, cardX + 5, currentY + 40);
    });

    return currentY + 75;
  }
}
