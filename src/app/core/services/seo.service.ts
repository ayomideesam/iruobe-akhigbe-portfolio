// core/services/seo.service.ts
import { Injectable, inject } from '@angular/core';
import { Meta, MetaDefinition, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

interface SeoConfig {
   title: string;
   description: string;
   keywords?: string[];
   type?: string;
   image?: string;
   author?: string;
   published?: string;
   modified?: string;
   section?: string;
   canonical?: string;
   noindex?: boolean;
   locale?: string;
   twitterHandle?: string;
   linkedInHandle?: string;
   structuredData?: any;
}

interface Project {
   id: number;
   title: string;
   description: string;
   images?: string[];
   techStack: { name: string; color: string; }[];
   achievements: string[];
   isHovered?: boolean;
}

@Injectable({
   providedIn: 'root'
})
export class SeoService {
   private readonly baseUrl = 'https://iruobeakhigbe.netlify.app';
   private readonly defaultImage = 'https://iruobeakhigbe.netlify.app/assets/img/fraud-dashboard-dark.png';
   private readonly defaultDescription = 'Senior Frontend Engineer with 9+ years of expertise in Angular, TypeScript, and enterprise applications';
   private readonly twitterHandle = '@akhigbe_dev';
   private readonly linkedInHandle = '@akhigbe-iruobe';

   private meta = inject(Meta);
   private title = inject(Title);
   private router = inject(Router);

   updateSeo(config: Partial<SeoConfig>) {
      const fullConfig = this.getFullConfig(config);

      // Basic SEO
      this.title.setTitle(fullConfig.title);
      this.updateMetaTag({ name: 'description', content: fullConfig.description });
      this.updateMetaTag({ name: 'keywords', content: fullConfig.keywords?.join(', ') || '' });

      // Open Graph
      this.updateMetaTag({ property: 'og:title', content: fullConfig.title });
      this.updateMetaTag({ property: 'og:description', content: fullConfig.description });
      this.updateMetaTag({ property: 'og:url', content: this.getFullUrl() });
      this.updateMetaTag({ property: 'og:type', content: fullConfig.type || 'website' });
      this.updateMetaTag({ property: 'og:image', content: fullConfig.image || this.defaultImage });
      this.updateMetaTag({ property: 'og:locale', content: fullConfig.locale || 'en_US' });

      // Twitter
      this.updateMetaTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.updateMetaTag({ name: 'twitter:title', content: fullConfig.title });
      this.updateMetaTag({ name: 'twitter:description', content: fullConfig.description });
      this.updateMetaTag({ name: 'twitter:image', content: fullConfig.image || this.defaultImage });
      this.updateMetaTag({ name: 'twitter:creator', content: this.twitterHandle });
      this.updateMetaTag({ name: 'twitter:site', content: this.twitterHandle });

      // Article specific
      if (fullConfig.type === 'article') {
         this.updateMetaTag({ property: 'article:author', content: fullConfig.author || '' });
         this.updateMetaTag({ property: 'article:published_time', content: fullConfig.published || '' });
         this.updateMetaTag({ property: 'article:modified_time', content: fullConfig.modified || '' });
         this.updateMetaTag({ property: 'article:section', content: fullConfig.section || '' });
      }

      // Indexing control
      this.updateMetaTag({ name: 'robots', content: fullConfig.noindex ? 'noindex, nofollow' : 'index, follow' });

      // Canonical URL
      if (fullConfig.canonical) {
         this.setCanonicalUrl(fullConfig.canonical);
      }

      // Structured Data
      if (fullConfig.structuredData) {
         this.addStructuredData(fullConfig.structuredData);
      }
   }

   private updateMetaTag(tag: MetaDefinition): void {
      // Ensure content is always a string
      const safeTag: MetaDefinition = {
         ...tag,
         content: tag.content || ''
      };
      this.meta.updateTag(safeTag);
   }

   private getFullConfig(config: Partial<SeoConfig>): SeoConfig {
      return {
         title: `${config.title || 'Senior Frontend Engineer'} | Akhigbe Iruobe`,
         description: config.description || this.defaultDescription,
         keywords: config.keywords || [
            'Angular',
            'Angular 20',
            'Angular Developer',
            'Angular Engineer',
            'Angular Signals',
            'Signal Store',
            'Frontend',
            'Frontend Engineer',
            'Frontend Developer',
            'Frontend Development',
            'TypeScript',
            'TypeScript Expert',
            'Enterprise Applications',
            'Enterprise Banking',
            'Banking Software',
            'Fintech',
            'Fintech Engineer',
            'CBN Compliance',
            'RxJS',
            'NgRx',
            'NGXS',
            'Micro-frontend',
            'CSS',
            'CSS Engineer',
            'Web Development',
            'UI/UX',
            'JavaScript',
            'HTML5',
            'CSS3',
            'Senior Angular Engineer',
            'Technical Lead',
            'Frontend Tech Lead'
         ],
         ...config
      };
   }

   private getFullUrl(): string {
      return `${this.baseUrl}${this.router.url}`;
   }

   private setCanonicalUrl(url: string) {
      const canURL = url.startsWith('http') ? url : this.baseUrl + url;
      const canonical = document.querySelector('link[rel="canonical"]');

      if (canonical) {
         canonical.setAttribute('href', canURL);
      } else {
         const link = document.createElement('link');
         link.setAttribute('rel', 'canonical');
         link.setAttribute('href', canURL);
         document.head.appendChild(link);
      }
   }

   private addStructuredData(data: any) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
   }

   setHomeSeo() {
      this.updateSeo({
         title: 'Senior Angular Engineer & Frontend Technical Lead',
         description: 'Akhigbe Iruobe — Senior Angular Engineer with 9+ years delivering enterprise banking applications at Globus Bank and Zenith Bank. Specialising in Angular 20, TypeScript, micro-frontends, and CBN-compliant financial platforms serving 100,000+ daily users.',
         canonical: this.baseUrl,
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Akhigbe Iruobe',
            jobTitle: 'Senior Frontend Engineer',
            description: 'Senior Angular Engineer with 9+ years of experience building enterprise-grade banking and fintech applications.',
            email: 'iruobeakhigbe@gmail.com',
            telephone: '+2347038772342',
            url: this.baseUrl,
            sameAs: [
               'https://www.linkedin.com/in/akhigbe-iruobe/',
               'https://github.com/ayomideesam',
               'https://twitter.com/akhigbe_dev'
            ]
         }
      });
   }

   setContactSeo() {
      this.updateSeo({
         title: 'Contact - Hire a Senior Angular Engineer',
         description: 'Get in touch with Akhigbe Iruobe — Senior Angular Engineer available for senior frontend, technical lead, and contract roles. Quick response guaranteed.',
         canonical: `${this.baseUrl}/contact`,
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact Akhigbe Iruobe',
            url: `${this.baseUrl}/contact`,
            mainEntity: {
               '@type': 'Person',
               name: 'Akhigbe Iruobe',
               email: 'iruobeakhigbe@gmail.com',
               url: this.baseUrl
            }
         }
      });
   }

   setProjectSeo(project: Project) {
      this.updateSeo({
         title: project.title,
         description: project.description,
         image: project.images?.[0] || undefined,
         type: 'article',
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: project.title,
            description: project.description,
            image: project.images?.[0] || undefined,
            author: {
               '@type': 'Person',
               name: 'Akhigbe Iruobe',
               url: this.baseUrl
            }
         }
      });
   }

   setResumeSeo() {
      this.updateSeo({
         title: 'Resume - Senior Angular Engineer & Technical Lead',
         description: '9+ years of enterprise Angular engineering — Globus Bank Credit Approval Platform, Zenith Bank micro-frontends, fraud detection systems, and team leadership across CBN-regulated financial applications. Download ATS-friendly PDF.',
         type: 'profile',
         canonical: `${this.baseUrl}/resume`,
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: 'Akhigbe Iruobe',
            jobTitle: 'Senior Frontend Engineer',
            email: 'iruobeakhigbe@gmail.com',
            telephone: '+2347038772342',
            url: this.baseUrl,
            sameAs: [
               'https://www.linkedin.com/in/akhigbe-iruobe/',
               'https://iruobeakhigbe.netlify.app/',
               'https://github.com/ayomideesam',
               'https://twitter.com/akhigbe_dev'
            ]
         }
      });
   }
}