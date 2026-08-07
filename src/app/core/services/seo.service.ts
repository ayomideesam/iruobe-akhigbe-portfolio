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
   private readonly defaultImage = 'https://iruobeakhigbe.netlify.app/assets/img/og-default.jpg';
   private readonly defaultDescription = 'Akhigbe Iruobe — Senior Frontend Engineer with 9+ years of expertise in Angular, TypeScript, and enterprise banking applications';
   private readonly twitterHandle = '@akhigbe_dev';
   // Stable entity URI — Google uses this to reconcile the same person across LinkedIn, GitHub, portfolio
   private readonly personId = `${this.baseUrl}/#person`;

   private meta = inject(Meta);
   private title = inject(Title);
   private router = inject(Router);

   // ─── Core reusable Person entity ───────────────────────────────────────────
   // Every schema block that references "Akhigbe Iruobe" pulls from this single
   // source. Changing the entity here propagates to all page schemas automatically.
   private get personEntity() {
      return {
         '@type': 'Person',
         '@id': this.personId,
         name: 'Akhigbe Iruobe',
         // givenName/familyName/additionalName/alternateName are the exact fields
         // Google uses for name disambiguation in the Knowledge Graph.
         givenName: 'Ayomide',
         familyName: 'Iruobe',
         additionalName: 'Akhigbe',
         // Every form of the full name must appear here so crawler reconciles them
         alternateName: [
            'Iruobe Akhigbe Ayomide',
            'Akhigbe Ayomide Iruobe',
            'Akhigbe Iruobe Ayomide'
         ],
         jobTitle: 'Senior Frontend Engineer',
         description: 'Senior Angular Engineer with 9+ years of experience building enterprise-grade banking and fintech applications at Globus Bank and Zenith Bank.',
         email: 'iruobeakhigbe@gmail.com',
         telephone: '+2347038772342',
         url: this.baseUrl,
         nationality: { '@type': 'Country', name: 'Nigeria' },
         address: {
            '@type': 'PostalAddress',
            addressLocality: 'Lagos',
            addressCountry: 'NG'
         },
         worksFor: {
            '@type': 'Organization',
            name: 'Globus Bank PLC'
         },
         // knowsAbout enriches the entity semantically — signals to Google what
         // this Person is an authority on without relying on keyword meta tags
         knowsAbout: [
            'Angular',
            'TypeScript',
            'RxJS',
            'NgRx',
            'Micro-frontends',
            'Fintech Engineering',
            'Banking Software',
            'CBN Compliance',
            'Enterprise Application Development',
            'Frontend Architecture'
         ],
         hasOccupation: {
            '@type': 'Occupation',
            name: 'Senior Frontend Engineer',
            occupationLocation: { '@type': 'City', name: 'Lagos' },
            skills: 'Angular, TypeScript, RxJS, NgRx, Micro-frontends, CSS, HTML5'
         },
         // sameAs must list every authoritative profile consistently
         sameAs: [
            'https://www.linkedin.com/in/akhigbe-iruobe/',
            'https://github.com/ayomideesam',
            'https://twitter.com/akhigbe_dev',
            'https://www.youtube.com/@AyomideIruobe'
         ]
      };
   }

   updateSeo(config: Partial<SeoConfig>) {
      const fullConfig = this.getFullConfig(config);
      const ogImage = fullConfig.image || this.defaultImage;

      // ── Basic SEO ────────────────────────────────────────────────────────────
      this.title.setTitle(fullConfig.title);
      this.updateMetaTag({ name: 'description', content: fullConfig.description });
      // Note: Google ignores keywords meta since 2009. Kept for legacy crawlers only.
      this.updateMetaTag({ name: 'keywords', content: fullConfig.keywords?.join(', ') || '' });
      this.updateMetaTag({ name: 'author', content: 'Akhigbe Iruobe' });

      // max-snippet:-1 allows Google to show full snippets (not capped at 160 chars).
      // max-image-preview:large allows rich image previews in search results.
      this.updateMetaTag({
         name: 'robots',
         content: fullConfig.noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
      });

      // Geo tags — help local/regional SEO signals for Nigerian market visibility
      this.updateMetaTag({ name: 'geo.region', content: 'NG-LA' });
      this.updateMetaTag({ name: 'geo.placename', content: 'Lagos, Nigeria' });

      // ── Open Graph ───────────────────────────────────────────────────────────
      this.updateMetaTag({ property: 'og:title', content: fullConfig.title });
      this.updateMetaTag({ property: 'og:description', content: fullConfig.description });
      this.updateMetaTag({ property: 'og:url', content: this.getFullUrl() });
      this.updateMetaTag({ property: 'og:type', content: fullConfig.type || 'website' });
      this.updateMetaTag({ property: 'og:site_name', content: 'Akhigbe Iruobe' });
      this.updateMetaTag({ property: 'og:image', content: ogImage });
      // FIX: og:image:width + og:image:height were missing. LinkedIn and Facebook
      // crawlers silently reject the image card without explicit dimensions.
      this.updateMetaTag({ property: 'og:image:width', content: '1200' });
      this.updateMetaTag({ property: 'og:image:height', content: '630' });
      this.updateMetaTag({ property: 'og:image:alt', content: fullConfig.title });
      this.updateMetaTag({ property: 'og:image:type', content: this.getImageMimeType(ogImage) });
      this.updateMetaTag({ property: 'og:locale', content: fullConfig.locale || 'en_GB' });

      // ── Twitter / X ──────────────────────────────────────────────────────────
      this.updateMetaTag({ name: 'twitter:card', content: 'summary_large_image' });
      this.updateMetaTag({ name: 'twitter:title', content: fullConfig.title });
      this.updateMetaTag({ name: 'twitter:description', content: fullConfig.description });
      this.updateMetaTag({ name: 'twitter:image', content: ogImage });
      this.updateMetaTag({ name: 'twitter:image:alt', content: fullConfig.title });
      this.updateMetaTag({ name: 'twitter:creator', content: this.twitterHandle });
      this.updateMetaTag({ name: 'twitter:site', content: this.twitterHandle });

      // ── Article-specific ─────────────────────────────────────────────────────
      if (fullConfig.type === 'article') {
         this.updateMetaTag({ property: 'article:author', content: fullConfig.author || 'Akhigbe Iruobe' });
         this.updateMetaTag({ property: 'article:published_time', content: fullConfig.published || '' });
         this.updateMetaTag({ property: 'article:modified_time', content: fullConfig.modified || '' });
         this.updateMetaTag({ property: 'article:section', content: fullConfig.section || '' });
      }

      // ── Canonical ────────────────────────────────────────────────────────────
      if (fullConfig.canonical) {
         this.setCanonicalUrl(fullConfig.canonical);
      }

      // ── Structured Data ──────────────────────────────────────────────────────
      if (fullConfig.structuredData) {
         this.addStructuredData(fullConfig.structuredData);
      }
   }

   // ─── Page-specific SEO setters ──────────────────────────────────────────────

   setHomeSeo() {
      this.updateSeo({
         title: 'Senior Angular Engineer & Frontend Technical Lead',
         // Trimmed to the ~150-160 char SEO target — name in the first 60 chars.
         description: 'Akhigbe Iruobe — Senior Angular Engineer, 9+ years building banking apps for Globus Bank & Zenith Bank. Angular 20, TypeScript, CBN-compliant fintech platforms.',
         canonical: this.baseUrl,
         // FIX: was bare Person schema. Google introduced ProfilePage in 2023
         // specifically for personal portfolio/bio pages. Person entity is now
         // nested inside ProfilePage as mainEntity, which is the correct pattern.
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            name: 'Akhigbe Iruobe — Senior Angular Engineer',
            url: this.baseUrl,
            dateModified: new Date().toISOString(),
            mainEntity: this.personEntity
         }
      });
   }

   setContactSeo() {
      this.updateSeo({
         title: 'Contact - Hire a Senior Angular Engineer',
         // Trimmed to the ~150-160 char SEO target — name in the first 60 chars.
         description: 'Get in touch with Akhigbe Iruobe — Senior Angular Engineer open to senior frontend, tech lead & contract roles. Remote-friendly worldwide. Fast response.',
         canonical: `${this.baseUrl}/contact`,
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact Akhigbe Iruobe',
            url: `${this.baseUrl}/contact`,
            mainEntity: {
               ...this.personEntity,
               // ContactPage mainEntity can be slimmer — just the identity + contact fields
               knowsAbout: undefined,
               hasOccupation: undefined
            }
         }
      });
   }

   setProjectsListSeo(projects: Project[]) {
      this.updateSeo({
         title: 'Projects - Enterprise Angular Case Studies',
         // FIX: previous copy never mentioned the name and ran to 191 chars.
         description: `Akhigbe Iruobe — ${projects.length} enterprise Angular case studies: fraud detection, trade finance, credit approval & AI platforms for CBN-regulated banks.`,
         canonical: `${this.baseUrl}/projects`,
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Akhigbe Iruobe — Projects',
            url: `${this.baseUrl}/projects`,
            author: { '@id': this.personId },
            mainEntity: {
               '@type': 'ItemList',
               itemListElement: projects.map((project, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                     '@type': 'SoftwareApplication',
                     name: project.title,
                     description: project.description,
                     image: project.images?.[0] || undefined,
                     url: `${this.baseUrl}/projects#project-${project.id}`,
                     author: { '@id': this.personId }
                  }
               }))
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
         canonical: `${this.baseUrl}/projects#project-${project.id}`,
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: project.title,
            description: project.description,
            image: project.images?.[0] || undefined,
            author: { '@id': this.personId }
         }
      });
   }

   // The services route needs three schema types at once (WebPage, the Service
   // catalogue, FAQPage) but the one-JSON-LD-block rule still holds — so they are
   // emitted as a single @graph array rather than three sibling <script> tags.
   // Every Service references the Person entity as its provider via @id, which is
   // what keeps the offering catalogue attached to the same Knowledge Graph node
   // as the rest of the site.
   setServicesSeo(
      services: { key: string; title: string; promise: string }[],
      faqs: { question: string; answer: string }[]
   ) {
      const servicesUrl = `${this.baseUrl}/services`;

      this.updateSeo({
         title: 'Services - Custom Software for Business',
         description: 'Akhigbe Iruobe builds bank-grade software for schools, retail, fuel stations & companies — web apps, POS, payments, backend APIs and AI-augmented development.',
         canonical: servicesUrl,
         structuredData: {
            '@context': 'https://schema.org',
            '@graph': [
               {
                  '@type': 'WebPage',
                  '@id': `${servicesUrl}#webpage`,
                  name: 'Services — Akhigbe Iruobe',
                  url: servicesUrl,
                  about: { '@id': this.personId },
                  dateModified: new Date().toISOString(),
                  mainEntity: { '@id': `${servicesUrl}#catalogue` }
               },
               {
                  '@type': 'OfferCatalog',
                  '@id': `${servicesUrl}#catalogue`,
                  name: 'Software Engineering Services',
                  url: servicesUrl,
                  itemListElement: services.map((service, index) => ({
                     '@type': 'Offer',
                     position: index + 1,
                     itemOffered: {
                        '@type': 'Service',
                        '@id': `${servicesUrl}#${service.key}`,
                        name: service.title,
                        description: service.promise,
                        serviceType: service.title,
                        provider: { '@id': this.personId },
                        areaServed: [
                           { '@type': 'Country', name: 'Nigeria' },
                           { '@type': 'Place', name: 'Worldwide (remote)' }
                        ]
                     }
                  }))
               },
               {
                  '@type': 'FAQPage',
                  '@id': `${servicesUrl}#faq`,
                  url: servicesUrl,
                  mainEntity: faqs.map(faq => ({
                     '@type': 'Question',
                     name: faq.question,
                     acceptedAnswer: { '@type': 'Answer', text: faq.answer }
                  }))
               }
            ]
         }
      });
   }

   setResumeSeo() {
      this.updateSeo({
         title: 'Resume - Senior Angular Engineer & Technical Lead',
         // FIX: previous copy never mentioned the name at all — violates the
         // "name in the first 60 chars of every description" rule. Also trimmed
         // to the ~150-160 char SEO target.
         description: 'Akhigbe Iruobe\'s resume — 9+ years of enterprise Angular engineering across Globus Bank, Zenith Bank, fraud detection & CBN-regulated fintech. Download ATS PDF.',
         // FIX: was type: 'profile'. og:type='profile' requires profile:first_name,
         // profile:last_name, profile:username meta tags — none of which were set.
         // 'website' is the correct fallback for a resume/CV page.
         type: 'website',
         canonical: `${this.baseUrl}/resume`,
         structuredData: {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Akhigbe Iruobe — Resume',
            url: `${this.baseUrl}/resume`,
            about: { '@id': this.personId },
            mainEntity: this.personEntity
         }
      });
   }

   // ─── Private helpers ────────────────────────────────────────────────────────

   private updateMetaTag(tag: MetaDefinition): void {
      const safeTag: MetaDefinition = { ...tag, content: tag.content || '' };
      this.meta.updateTag(safeTag);
   }

   private getFullConfig(config: Partial<SeoConfig>): SeoConfig {
      return {
         title: `${config.title || 'Senior Angular Engineer'} | Akhigbe Iruobe`,
         description: config.description || this.defaultDescription,
         // Note: Google has ignored <meta name="keywords"> since 2009.
         // This list is retained for legacy/other crawlers only.
         keywords: config.keywords || [
            'Akhigbe Iruobe',
            'Iruobe Akhigbe',
            'Akhigbe Iruobe Angular',
            'Akhigbe Iruobe engineer',
            'Akhigbe Iruobe portfolio',
            'Angular Developer Nigeria',
            'Angular 20',
            'Senior Angular Engineer',
            'Angular Signals',
            'Frontend Technical Lead',
            'Fintech Engineer Nigeria',
            'Enterprise Banking Frontend',
            'CBN Compliance',
            'TypeScript Expert',
            'RxJS',
            'NgRx',
            'Micro-frontend',
            'Globus Bank Angular',
            'Zenith Bank Frontend',
            'Remote Angular Developer',
            'Angular Developer Worldwide'
         ],
         ...config
      };
   }

   private getFullUrl(): string {
      return `${this.baseUrl}${this.router.url}`;
   }

   private setCanonicalUrl(url: string): void {
      const canURL = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
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

   private addStructuredData(data: any): void {
      // Remove the static pre-hydration fallback (index.html) and any structured
      // data injected by a previous route — only one JSON-LD block lives in <head>
      // at any time. Without this, every navigation stacks a duplicate entity.
      document.getElementById('ld-json-static')?.remove();
      document.getElementById('ld-json-dynamic')?.remove();

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'ld-json-dynamic';
      script.text = JSON.stringify(data);
      document.head.appendChild(script);
   }

   private getImageMimeType(url: string): string {
      const ext = url.split('.').pop()?.toLowerCase().split('?')[0];
      switch (ext) {
         case 'jpg':
         case 'jpeg': return 'image/jpeg';
         case 'webp': return 'image/webp';
         case 'avif': return 'image/avif';
         case 'svg': return 'image/svg+xml';
         default: return 'image/png';
      }
   }
}