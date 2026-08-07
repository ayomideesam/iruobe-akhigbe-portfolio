// core/services/services-data.service.ts
//
// Single source of truth for every piece of copy on the /services route.
// Nothing on the services page is hardcoded in the template — same contract as
// ProjectDataService. Editing an offering, a proof line or an FAQ answer is a
// change here, never a template change.
//
// Proof placement note: each ServiceOffering carries its own `proof` string.
// That is deliberate — conversion research is consistent that trust signals work
// where the credibility doubt actually fires (inside the offering the buyer is
// reading), not consolidated into a testimonial block at the bottom of the page.

import { Injectable } from '@angular/core';

export interface ServiceOffering {
   key: string;
   title: string;
   promise: string;
   deliverables: string[];
   /** Verifiable evidence shown inside the card itself. Must map to real work. */
   proof: string;
   icon: string;
   accent: string;
   accentRgb: string;
   featured?: boolean;
}

export interface IndustryTile {
   key: string;
   sector: string;
   /** The pains the buyer already recognises in their own business. */
   pains: string[];
   builds: string;
   icon: string;
   accent: string;
   accentRgb: string;
}

export interface ProcessStep {
   step: string;
   title: string;
   description: string;
}

export interface EngagementModel {
   title: string;
   bestFor: string;
   points: string[];
   icon: string;
   accent: string;
   accentRgb: string;
}

export interface AiArtifact {
   path: string;
   depth: number;
   purpose: string;
   /** Directory rows are structural only — no purpose column rendered. */
   dir?: boolean;
}

export interface McpCapability {
   name: string;
   description: string;
   accent: string;
}

export interface FaqItem {
   question: string;
   answer: string;
}

@Injectable({ providedIn: 'root' })
export class ServicesDataService {

   // ── Hero trust counters ───────────────────────────────────────────────────
   getTrustStats(): { value: string; label: string }[] {
      return [
         { value: '9+', label: 'Years Engineering' },
         { value: '₦100 Billion+', label: 'Transactions Processed' },
         { value: '100K+', label: 'Daily Users Served' },
         { value: '0', label: 'Production Vulnerabilities' }
      ];
   }

   // ── Why me — the three differentiators ────────────────────────────────────
   getDifferentiators(): { title: string; body: string; icon: string; accent: string; accentRgb: string }[] {
      return [
         {
            title: 'Built for regulators, not just users',
            body: 'The platforms I build daily answer to the Central Bank of Nigeria. That means dual authorisation, full audit trails, PCI DSS discipline and OWASP secure-coding practice as the default — not an upgrade you pay extra for. Your business inherits the same standard.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>`,
            accent: '#818cf8', accentRgb: '129, 140, 248'
         },
         {
            title: 'Approval workflows are my specialty',
            body: 'I encoded a 10+ role sequential approval chain with committee voting and MD veto power into a live bank platform. Your purchase orders, fee waivers, shift reconciliations and staff requisitions are the same problem — smaller, and already solved.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h6v6H4z"></path><path d="M14 13h6v6h-6z"></path><path d="M10 8h4a2 2 0 0 1 2 2v3"></path><path d="M14 16H8a2 2 0 0 1-2-2v-3"></path></svg>`,
            accent: '#22d3ee', accentRgb: '34, 211, 238'
         },
         {
            title: 'Built for how Nigeria actually works',
            body: 'Offline-first progressive web apps, low-bandwidth budgets, and interfaces that stay usable on the cheap Android devices your staff really carry. Support in your timezone, from Lagos. Software that keeps working when the network does not.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9z"></path></svg>`,
            accent: '#34d399', accentRgb: '52, 211, 153'
         }
      ];
   }

   // ── The core offering grid ────────────────────────────────────────────────
   getServices(): ServiceOffering[] {
      return [
         {
            key: 'ai-enablement',
            title: 'AI-Augmented Development Enablement',
            promise: 'Make your existing developers ship at multiples of their current speed — without shipping multiples of the mess.',
            deliverables: [
               'A written operating constitution that routes every AI question to the right internal standard before it answers',
               'A full engineering documentation suite: architecture, code standards, design rules, security, merge protocol',
               'Custom project skills — repeatable recipes that let AI drive, verify and screenshot your real app',
               'MCP integrations wired in: Figma, Playwright, Higgsfield and custom servers for your internal APIs',
               'Team onboarding so every engineer gets identical output quality from the same tooling'
            ],
            proof: 'The exact system currently governing two parallel development teams on a CBN-regulated trade finance platform.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3z"></path><path d="M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9L18 15z"></path><path d="M5.5 14.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4L3.5 16.5l1.4-.6.6-1.4z"></path></svg>`,
            accent: '#a78bfa', accentRgb: '167, 139, 250',
            featured: true
         },
         {
            key: 'web-apps',
            title: 'Custom Web Applications',
            promise: 'The system your business actually runs on — built to fit your process, not the other way round.',
            deliverables: [
               'Dashboards, admin consoles, internal tools and customer portals',
               'Role-based access control with granular permissions per user type',
               'Real-time reporting and exportable records',
               'Responsive from phone to desktop, tested across the full device range'
            ],
            proof: 'A 190+ component credit approval platform delivered end-to-end for Globus Bank.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"></rect><path d="M3 9h18"></path><path d="M8 6.5h.01M11 6.5h.01"></path></svg>`,
            accent: '#818cf8', accentRgb: '129, 140, 248'
         },
         {
            key: 'business-systems',
            title: 'Business Management Systems',
            promise: 'One platform replacing the notebooks, spreadsheets and WhatsApp threads your operation currently depends on.',
            deliverables: [
               'Inventory, sales, staff, procurement and reporting in a single console',
               'Multi-step approval chains — requisition to line manager to finance to MD',
               'Full audit logging: who changed what, when, and what it was before',
               'Multi-branch support with a consolidated owner dashboard'
            ],
            proof: 'Multi-role approval engines and audit architecture built for banking-grade compliance.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l7-4 7 4v14"></path><path d="M9 21v-5h6v5"></path><path d="M9 11h.01M15 11h.01"></path></svg>`,
            accent: '#22d3ee', accentRgb: '34, 211, 238'
         },
         {
            key: 'pos-inventory',
            title: 'Point of Sale & Inventory',
            promise: 'Know exactly what you have, what sold, and what walked out the door — in real time, across every branch.',
            deliverables: [
               'Barcode scanning, fast checkout and receipt printing',
               'Live stock sync with low-stock and expiry alerts',
               'Offline-capable — keeps selling when the network drops, syncs when it returns',
               'Daily Z-reports, shift close-out and supervisor-approved voids and refunds'
            ],
            proof: '180+ merchants onboarded onto a live collections platform, with integration time cut from 2 weeks to 3 days.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18l-1.5 12.5A2 2 0 0 1 17.5 20h-11a2 2 0 0 1-2-1.5z"></path><path d="M8 10V6a4 4 0 0 1 8 0v4"></path></svg>`,
            accent: '#34d399', accentRgb: '52, 211, 153'
         },
         {
            key: 'payments',
            title: 'Payments & Collections',
            promise: 'Take money reliably, reconcile it automatically, and know at a glance what has actually cleared.',
            deliverables: [
               'Paystack, Flutterwave and Monnify integration',
               'Bank transfer verification and automated reconciliation',
               'Payment links, invoicing and recurring collections',
               'Settlement reporting that matches your bank statement line for line'
            ],
            proof: 'NIBSS GSI, EbillsPay and RemitOne UK integrations across 15+ banking APIs at PCI DSS compliance.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20"></path><path d="M6 15h4"></path></svg>`,
            accent: '#f59e0b', accentRgb: '245, 158, 11'
         },
         {
            key: 'education',
            title: 'School & Campus Platforms',
            promise: 'Admissions to results to fees — one system parents trust and your bursar can actually reconcile.',
            deliverables: [
               'Student records, admissions and class management',
               'Fee collection with a payment gateway and automatic receipting',
               'Results entry, approval workflow, and generated report cards',
               'Parent portal, staff payroll and timetable management'
            ],
            proof: 'Document compliance gates and multi-stage records approval, built to banking standards.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9L12 4 2 9l10 5 10-5z"></path><path d="M6 11.5V17c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5"></path></svg>`,
            accent: '#60a5fa', accentRgb: '96, 165, 250'
         },
         {
            key: 'backend',
            title: 'Backend, APIs & Cloud',
            promise: 'The engine behind the screen — secure, documented, and built to carry load you have not reached yet.',
            deliverables: [
               'REST and GraphQL APIs in NestJS / Node with full documentation',
               'PostgreSQL and MySQL schema design, migrations and backup strategy',
               'Authentication, rate limiting, refresh-token handling and centralised error handling',
               'AWS deployment with CI/CD pipelines so releases stop being an event'
            ],
            proof: 'A NestJS platform serving 100,000+ concurrent users at 99.9% uptime with zero auth-related incidents.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5.5" rx="8" ry="3"></ellipse><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13"></path><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"></path></svg>`,
            accent: '#f472b6', accentRgb: '244, 114, 182'
         },
         {
            key: 'websites',
            title: 'Corporate Websites & SEO',
            promise: 'A site that loads instantly, ranks for your name, and makes your business look the size it deserves.',
            deliverables: [
               'Fast, accessible builds hitting Lighthouse 90+ across the board',
               'Structured data and schema markup so Google understands who you are',
               'Core Web Vitals tuned — LCP, INP and CLS inside Google thresholds',
               'Content management so your team can update copy without calling a developer'
            ],
            proof: 'This portfolio. Open DevTools and run Lighthouse on it — that is the standard you get.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path><path d="M8 11h6M11 8v6"></path></svg>`,
            accent: '#2dd4bf', accentRgb: '45, 212, 191'
         },
         {
            key: 'rescue',
            title: 'Rescue, Audit & Modernisation',
            promise: 'Inherited something broken, slow, or abandoned by the last developer? That is a fixable position.',
            deliverables: [
               'Full codebase audit with a written, prioritised findings report',
               'Framework version migrations without a rewrite from scratch',
               'Security vulnerability elimination and dependency remediation',
               'Performance rescue — bundle analysis, lazy loading and load-time reduction'
            ],
            proof: 'Led Angular v16→v19 and v19→v20 migrations taking 11 known vulnerabilities to zero, with 40% performance gains.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 1 5 5L9 22l-5-5z"></path><path d="M16 8l-9 9"></path><path d="M4.5 9.5L2 7l3-3 2.5 2.5"></path></svg>`,
            accent: '#fb923c', accentRgb: '251, 146, 60'
         },
         {
            key: 'fractional',
            title: 'Fractional Tech Lead',
            promise: 'Senior engineering direction for teams that have developers but no one setting the bar.',
            deliverables: [
               'Architecture review and technical decision-making',
               'Code review discipline and quality gates on every merge',
               'Mentoring your developers up to a standard that outlasts the engagement',
               'Technical hiring support — screening, assessment design and interviews'
            ],
            proof: 'Mentored 6–8 engineers across Globus Bank, Zenith Bank and a UK contract, with 3 team promotions and +45% velocity.',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 20v-2a4 4 0 0 0-3-3.9"></path><path d="M16 3.1a4 4 0 0 1 0 7.8"></path></svg>`,
            accent: '#f43f5e', accentRgb: '244, 63, 94'
         }
      ];
   }

   // ── AI enablement spotlight ───────────────────────────────────────────────
   // The artifact tree mirrors what actually ships on a live engagement. Keep the
   // depth values consistent — the template indents purely from `depth`.
   getAiArtifacts(): AiArtifact[] {
      return [
         { path: 'CLAUDE.md', depth: 0, purpose: 'Operating constitution — identity, standards routing, non-negotiables' },
         { path: 'SECURITY.md', depth: 0, purpose: 'Security discipline, dependency vetting, running incident log' },
         { path: '.claude/', depth: 0, purpose: '', dir: true },
         { path: 'settings.json', depth: 1, purpose: 'Tool permissions, hooks and command allowlists' },
         { path: 'skills/verify/SKILL.md', depth: 1, purpose: 'Repeatable recipe to drive, verify and screenshot the real app' },
         { path: 'docs/', depth: 0, purpose: '', dir: true },
         { path: 'ARCHITECTURE.md', depth: 1, purpose: 'Where code goes — folder discipline and state-management rules' },
         { path: 'CODE-STANDARDS.md', depth: 1, purpose: 'How code is written, plus a running log of language footguns' },
         { path: 'DESIGN.md', depth: 1, purpose: 'Responsive scope, breakpoints and design-system rules' },
         { path: 'SHARED-COMPONENTS.md', depth: 1, purpose: 'Reusable UI contracts and placement rules' },
         { path: 'BRANCH-MERGE-PROTOCOL.md', depth: 1, purpose: 'Step-by-step merge discipline for parallel teams' },
         { path: 'DEPENDENCY-AUDIT.md', depth: 1, purpose: 'Living audit record — updated on every run, never a stale snapshot' }
      ];
   }

   getMcpCapabilities(): McpCapability[] {
      return [
         { name: 'Figma', description: 'Design tokens, variables and screenshots pulled straight into the build — no more pixel guesswork', accent: '#f472b6' },
         { name: 'Playwright', description: 'Drives the real running app, seeds sessions and screenshots the result to verify work actually landed', accent: '#34d399' },
         { name: 'Higgsfield', description: 'Generates imagery, video and media assets in-pipeline instead of blocking on a designer', accent: '#a78bfa' },
         { name: 'Custom servers', description: 'Your internal APIs, ticketing and databases exposed safely to the tooling your team already uses', accent: '#22d3ee' }
      ];
   }

   getAiOutcomes(): { value: string; label: string }[] {
      return [
         { value: '0→100', label: 'Project bootstrapped in days, not quarters' },
         { value: '2', label: 'Parallel teams governed by one standard' },
         { value: '1', label: 'Source of truth per concern — no contradictions' },
         { value: '100%', label: 'Of merges held to the same written gate' }
      ];
   }

   // ── Industries ────────────────────────────────────────────────────────────
   getIndustries(): IndustryTile[] {
      return [
         {
            key: 'education',
            sector: 'Schools & Universities',
            pains: ['Fee collection chaos every term', 'Results compiled by hand across spreadsheets', 'Parents with no visibility until report day'],
            builds: 'Student information system, fees portal with automatic receipting, results approval engine and a parent app.',
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9L12 4 2 9l10 5 10-5z"></path><path d="M6 11.5V17c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5.5"></path></svg>`,
            accent: '#60a5fa', accentRgb: '96, 165, 250'
         },
         {
            key: 'fuel',
            sector: 'Fuel Stations',
            pains: ['Pump readings that never match cash taken', 'Shift theft nobody can prove', 'No real wet stock control'],
            builds: 'Shift reconciliation, tank and pump reading capture, attendant accountability trail and a daily sales dashboard.',
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"></path><path d="M2 21h12"></path><path d="M6 8h4"></path><path d="M16 21V9l3 2v7a2 2 0 0 0 2 2"></path><path d="M16 9V6l-2-2"></path></svg>`,
            accent: '#fb923c', accentRgb: '251, 146, 60'
         },
         {
            key: 'retail',
            sector: 'Supermarkets & Retail',
            pains: ['Stock shrinkage you only discover at stocktake', 'No consolidated view across branches', 'Checkout queues at peak hours'],
            builds: 'POS with barcode scanning, live inventory sync, multi-branch console and supplier purchase-order approvals.',
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"></circle><circle cx="18" cy="20" r="1.5"></circle><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"></path></svg>`,
            accent: '#34d399', accentRgb: '52, 211, 153'
         },
         {
            key: 'small-business',
            sector: 'Small Businesses',
            pains: ['The business runs on WhatsApp and a notebook', 'No record of who owes what', 'Orders lost between messages'],
            builds: 'Simple ordering, invoicing, customer records and payment links — the smallest system that ends the chaos.',
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1.5-5h15L21 9"></path><path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9"></path><path d="M3 9h18"></path><path d="M9 13h6"></path></svg>`,
            accent: '#22d3ee', accentRgb: '34, 211, 238'
         },
         {
            key: 'enterprise',
            sector: 'Large Businesses & Corporates',
            pains: ['Legacy systems nobody wants to touch', 'Data siloed across departments', 'Approvals that live in email threads'],
            builds: 'Custom internal platforms, multi-role approval workflows, system integrations and executive dashboards.',
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v17"></path><path d="M14 9h4a1 1 0 0 1 1 1v11"></path><path d="M8 7h2M8 11h2M8 15h2"></path></svg>`,
            accent: '#818cf8', accentRgb: '129, 140, 248'
         },
         {
            key: 'fintech',
            sector: 'Banks, Fintech & Lending',
            pains: ['Regulatory exposure on every release', 'Fraud detected after the money has moved', 'Credit decisions stuck in paper chains'],
            builds: 'Credit approval platforms, real-time fraud rules engines, trade finance and transfer systems. This is home turf.',
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10l9-6 9 6"></path><path d="M5 10v9M19 10v9M9 10v9M15 10v9"></path><path d="M2 21h20"></path></svg>`,
            accent: '#f59e0b', accentRgb: '245, 158, 11'
         },
         {
            key: 'other',
            sector: 'Not on this list?',
            pains: ['NGOs, churches, clinics, logistics, agencies', 'Every business has a workflow worth automating', 'If it runs on paper, it can run better'],
            builds: 'Tell me what your business does and where it slows down. The pattern is almost always one I have built before.',
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M9.2 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4"></path><path d="M12 17h.01"></path></svg>`,
            accent: '#a78bfa', accentRgb: '167, 139, 250'
         }
      ];
   }

   // ── Process ───────────────────────────────────────────────────────────────
   getProcess(): ProcessStep[] {
      return [
         { step: '01', title: 'Free scoping call', description: 'Thirty minutes. You describe the business and where it hurts, I map the workflow and tell you honestly whether software is even the right fix. No charge, no obligation.' },
         { step: '02', title: 'Written proposal', description: 'Scope, milestones, timeline and cost in writing, within three working days of the call. You know exactly what you are buying before you commit to anything.' },
         { step: '03', title: 'Design & prototype', description: 'You see and click a working prototype before a single line of production code is written. Changing your mind here is free — changing it after build is not.' },
         { step: '04', title: 'Build in two-week sprints', description: 'A working demo every two weeks, without exception. No six-month black box, no "it is nearly ready" for a quarter. You watch it get built.' },
         { step: '05', title: 'Launch, train & support', description: 'Deployment to your own infrastructure, hands-on staff training, written documentation, and three months of included support after go-live.' }
      ];
   }

   // ── Engagement models — deliberately no figures. Scoped on the call. ───────
   getEngagementModels(): EngagementModel[] {
      return [
         {
            title: 'Fixed-Scope Project',
            bestFor: 'A specific system with clear requirements',
            points: ['Defined scope agreed in writing upfront', 'Milestone-based payments tied to delivery', 'Fixed delivery date you can plan around'],
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l2 2 4-4"></path><rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 2v4M16 2v4"></path></svg>`,
            accent: '#818cf8', accentRgb: '129, 140, 248'
         },
         {
            title: 'Ongoing Partnership',
            bestFor: 'A live product that keeps evolving',
            points: ['Continuous development and new features', 'Maintenance, monitoring and priority support', 'A predictable monthly commitment, cancellable'],
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"></path><path d="M21 3v5h-5"></path></svg>`,
            accent: '#22d3ee', accentRgb: '34, 211, 238'
         },
         {
            title: 'Fractional Tech Lead',
            bestFor: 'Companies whose developers need senior direction',
            points: ['Architecture ownership and technical decisions', 'Code review discipline and quality gates', 'Mentoring that outlasts the engagement'],
            icon: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.6 6.5L21 9.8l-4.8 4.3L17.6 21 12 17.6 6.4 21l1.4-6.9L3 9.8l6.4-1.3z"></path></svg>`,
            accent: '#f59e0b', accentRgb: '245, 158, 11'
         }
      ];
   }

   // ── Risk reversal ─────────────────────────────────────────────────────────
   getGuarantees(): { title: string; body: string }[] {
      return [
         { title: 'You own the source code', body: 'Every line, in your own repository, from day one. Not licensed to you — yours.' },
         { title: 'Deployed on your accounts', body: 'Your hosting, your domain, your database. Nothing is held hostage on my infrastructure.' },
         { title: 'Documentation & training included', body: 'Written docs plus hands-on sessions so your team can actually run what you paid for.' },
         { title: 'Security is not an add-on', body: 'OWASP practice, no plaintext credentials, audit logging and dependency auditing as standard.' },
         { title: 'Automated tests, not assumptions', body: 'Real test coverage on the logic that matters, so changes later do not silently break things.' },
         { title: 'Three months support after launch', body: 'Included, not upsold. Bugs found in that window are fixed at no additional cost.' },
         { title: 'Reviewed against bank standards', body: 'Whoever writes the code — me or an engineer I trained — it clears the same written gate.' }
      ];
   }

   // ── FAQ ───────────────────────────────────────────────────────────────────
   getFaqs(): FaqItem[] {
      return [
         {
            question: 'How much will my project cost?',
            answer: 'There is no price list here, because there is no standard project. A single-branch inventory system and a multi-campus school platform are not the same purchase. Tell me what you need on a 30-minute call and I will scope to your budget rather than the other way round. No budget is too small to start a conversation.'
         },
         {
            question: 'Is my business too small for you?',
            answer: 'No. Larger builds I lead directly. Smaller ones are delivered by engineers I have personally trained and code-review, against the same written standards I authored for a CBN-regulated bank. The standard does not drop with the invoice size.'
         },
         {
            question: 'How long does a typical project take?',
            answer: 'A focused tool is usually 4–8 weeks. A full business management platform is typically 3–6 months. You get a working demo every two weeks throughout, so you are never waiting in the dark to find out how it is going.'
         },
         {
            question: 'Do you work with businesses outside Lagos or outside Nigeria?',
            answer: 'Yes. I am based in Lagos and work with clients across Nigeria and internationally — including previous engagements in the United Kingdom and across Middle Eastern markets. Calls, demos and delivery all work remotely.'
         },
         {
            question: 'I already have a developer or an existing system. Can you work with that?',
            answer: 'Yes, and this is common. I audit what exists, tell you plainly what is worth keeping, and either improve it or plan a migration that does not throw away work you already paid for. I also work alongside in-house teams as a fractional lead rather than replacing them.'
         },
         {
            question: 'What if I do not know exactly what I want yet?',
            answer: 'That is the normal starting point and it is what the scoping call is for. You describe how the business runs today and where it breaks. Mapping that into a system is my job, not yours.'
         },
         {
            question: 'Do you build mobile apps?',
            answer: 'I build progressive web apps that install to the home screen and work offline — which for most business use cases is faster to ship, cheaper to maintain, and avoids app-store approval entirely. Where a native app is genuinely the right answer, I will tell you that instead of selling you the thing I prefer.'
         },
         {
            question: 'What happens after launch?',
            answer: 'Three months of support is included: bug fixes, adjustments and questions from your team. After that you can move to an ongoing partnership for continuous development, or simply take the code and run it yourself. Both are fine.'
         },
         {
            question: 'Do you handle hosting and domains?',
            answer: 'I set everything up under accounts registered in your name, so you own them permanently. I will handle the technical configuration and hand you the keys — you are never locked in to me for access to your own product.'
         }
      ];
   }
}
