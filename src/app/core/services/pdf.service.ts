import { Injectable } from '@angular/core';
import type { jsPDF } from 'jspdf'; // For types only

interface PdfOptions {
  content: HTMLElement;
  isDarkTheme: boolean;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly A4_WIDTH = 595.28;
  private readonly A4_HEIGHT = 841.89;

  private async prepareContent(content: HTMLElement): Promise<void> {
    // Force a repaint of the header text
    const headerBox = content.querySelector('.header-box');
    if (headerBox) {
      const h1 = headerBox.querySelector('h1');
      const h2 = headerBox.querySelector('h2');

      if (h1) {
        h1.style.display = 'none';
        void h1.offsetHeight;
        h1.style.display = 'block';
      }

      if (h2) {
        h2.style.display = 'none';
        void h2.offsetHeight;
        h2.style.display = 'block';
      }
    }

    // Ensure all sections are properly rendered
    const sections = content.querySelectorAll('section');
    sections.forEach(section => {
      section.style.display = 'none';
      void section.offsetHeight;
      section.style.display = 'block';
    });

    // Ensure all images are loaded
    const images = content.querySelectorAll('img');
    await Promise.all(Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve; // Proceed even if some images fail
      });
    }));

    // Remove any height constraints
    content.style.maxHeight = 'none';
    content.style.overflow = 'visible';

    // Wait for fonts and images to load
    await Promise.all([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 500)) // Increased delay for better rendering
    ]);

    // Force layout recalculation
    void content.offsetHeight;
  }

  async generatePDF({ content, isDarkTheme, fileName }: PdfOptions) {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    // Get the viewport width to determine if we're in mobile view
    const isMobileView = window.innerWidth <= 768;

    // Prepare content before generating PDF
    await this.prepareContent(content);

    const canvas = await html2canvas(content, {
      scale: 1.5,  // Reduced from 2 to 1.5 for better file size
      useCORS: true,
      logging: false,  // Disabled logging
      backgroundColor: isDarkTheme ? '#121212' : '#ffffff',
      windowWidth: content.scrollWidth,
      windowHeight: content.scrollHeight,
      width: content.scrollWidth,
      height: content.scrollHeight,
      onclone: (doc) => this.injectPdfStyles(doc, isDarkTheme, isMobileView)
    });

    const imgWidth = this.A4_WIDTH;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF('p', 'pt', [imgWidth, Math.max(this.A4_HEIGHT, imgHeight)], true); // Enable compression

    // Convert to JPEG with quality optimization for better file size
    const imgData = canvas.toDataURL('image/jpeg', 0.85); // 85% quality JPEG instead of PNG

    pdf.addImage({
      imageData: imgData,
      format: 'JPEG',
      x: 0,
      y: 0,
      width: imgWidth,
      height: imgHeight,
      compression: 'FAST'
    });

    pdf.save(fileName);
  }

  private injectPdfStyles(doc: Document, isDarkTheme: boolean, isMobileView: boolean): void {
    const style = doc.createElement('style');

    // Define colors explicitly instead of using CSS variables
    const colors = {
      textPrimary: isDarkTheme ? '#F1F5F9' : '#0F172A',
      textSecondary: isDarkTheme ? '#94A3B8' : '#475569',
      leftBg: isDarkTheme ? '#1E1E1E' : '#F4F4F4',
      rightBg: isDarkTheme ? '#121212' : '#FFFFFF',
      // Add border colors for better contrast
      headerBorder: isDarkTheme ? '#FFFFFF' : '#000000'
    };


    // Ensure fonts are loaded
    const fontStyle = doc.createElement('style');
    fontStyle.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Sora:wght@400;700&display=swap');
    `;
    doc.head.appendChild(fontStyle);

    style.textContent = `
      .resume-container {
        padding: 0 !important;
        margin: 0 auto !important;
      }
      .resume-main-content {
        position: relative;
        background: ${isDarkTheme ?
        'linear-gradient(to right, #1E1E1E 0%, #1E1E1E 300px, #121212 300px, #121212 100%)' :
        'linear-gradient(to right, #F4F4F4 0%, #F4F4F4 300px, #FFFFFF 300px, #FFFFFF 100%)'}
        !important;
        margin-top: -1px !important;
      }
      .resume-header-wrapper {
        position: relative;
        padding: 3.5rem 2rem 0 !important;
        z-index: 2;
      }
      .header-box {
        ${isMobileView ? `
          transform: none !important;
          width: 100% !important;
          text-align: center !important;
          padding: 2rem !important;
          border: 2px solid ${colors.headerBorder} !important;
          background-color: ${colors.rightBg} !important;
          z-index: 10 !important;
          position: relative !important;
        ` : 'transform: none !important'}
        background-color: ${colors.rightBg} !important;
      }

      /* Force color inheritance in mobile view */
      ${isMobileView ? `
        .resume-header-wrapper {
          background-color: ${colors.leftBg} !important;
        }
        
        .header-box * {
          color: inherit !important;
        }
      ` : ''}

      /* Enforce header text styles with maximum specificity */
      body .resume-container .resume-main-content .resume-content .resume-header-wrapper .resume-header .header-box h1 {
        color: ${colors.textPrimary} !important;
        -webkit-text-fill-color: ${colors.textPrimary} !important;
        font-size: ${isMobileView ? '1.75rem' : '3rem'} !important;
        font-family: 'Outfit', 'Sora', system-ui, -apple-system, sans-serif !important;
        font-weight: 700 !important;
        letter-spacing: 0.1em !important;
        margin: 0 !important;
        line-height: 1.2 !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        text-align: ${isMobileView ? 'center' : 'left'} !important;
        background-color: transparent !important;
        position: relative !important;
        z-index: 2 !important;
      }

      body .resume-container .resume-main-content .resume-content .resume-header-wrapper .resume-header .header-box h2 {
        color: ${colors.textSecondary} !important;
        -webkit-text-fill-color: ${colors.textSecondary} !important;
        font-size: ${isMobileView ? '1rem' : '1.125rem'} !important;
        font-family: 'Sora', system-ui, -apple-system, sans-serif !important;
        font-weight: 400 !important;
        letter-spacing: 0.1em !important;
        margin: 0.5rem 0 0 !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: block !important;
        text-align: ${isMobileView ? 'center' : 'left'} !important;
        background-color: transparent !important;
        position: relative !important;
        z-index: 2 !important;
      }

      /* Additional text rendering fixes for Webkit browsers */
      .header-box h1,
      .header-box h2 {
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
        text-rendering: optimizeLegibility !important;
      }
      .resume-header {
        position: relative;
        z-index: 2;
      }
      .resume-left>*:first-child,
      .resume-right>*:first-child {
        margin-top: 4rem;
      }
      .resume-left {
        background-color: ${isDarkTheme ? '#1E1E1E' : '#F4F4F4'} !important;
        padding: 1.75rem;
      }
      .resume-right {
        background-color: ${isDarkTheme ? '#121212' : '#FFFFFF'} !important;
        padding: 2rem 3rem;
      }
      .download-pdf {
        display: none !important;
      }
      #resume-content {
        height: auto !important;
        overflow: visible !important;
      }
      .resume-container, .resume-main-content {
        height: auto !important;
        max-height: none !important;
      }
      #resume-content, #resume-content * {
        overflow: visible !important;
        max-height: none !important;
        height: auto !important;
      }

      ${isMobileView ?
        `
          .resume-grid {
            grid-template-columns: 1fr !important;
          }

          .job-header {
            flex-direction: column !important;
            gap: 1rem !important;
          }

          .job-meta {
            text-align: left !important;
          }

          .references-list {
            grid-template-columns: 1fr !important;
          }
        ` : ''
      }
    `;
    doc.head.appendChild(style);
  }
}