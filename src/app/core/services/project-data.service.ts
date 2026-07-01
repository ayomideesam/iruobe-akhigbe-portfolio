import { Injectable } from "@angular/core";

interface ProjectStat {
   value: string;
   label: string;
}

interface ProjectPipelineStep {
   name: string;
   meta: string;
}

interface Project {
   id: number;
   title: string;
   description: string;
   techStack: { name: string; color: string; }[];
   achievements: string[];
   isHovered?: boolean;
   images?: any;
   stats?: ProjectStat[];
   pipeline?: ProjectPipelineStep[];
   pipelineLabel?: string;
}

interface AssessmentProject {
   id: number;
   type: 'assessment';
   title: string;
   assessmentBy: string;
   assessmentBrief: string;
   description: string;
   techStack: { name: string; color: string; }[];
   achievements: string[];
   demoUrl: string;
   repoUrl: string;
   level: 'senior' | 'mid';
   accentColor: string;
   accentColorRgb: string;
   isHovered?: boolean;
   images?: string[];
}

@Injectable({
   providedIn: 'root'
})
export class ProjectDataService {
   getProjects(): Project[] {
      return [
         {
            id: 6,
            title: 'Credit Approval Process (CAP)',
            description: 'Built Globus Bank\'s Credit Approval Process Automation Solution — a CBN-compliant platform digitising end-to-end credit lifecycle management across four facility modules (Retail, Corporate, Staff Loan, Product Program) through a two-stage governance structure: Stage 1 routes applications through a 10+ role sequential chain culminating in MCC online committee voting with configurable MD/CEO veto power; Stage 2 escalates facilities above ₦100M to the Board Credit Committee (BCC) for majority vote, after which the platform enables disbursement or deferral workflows.',
            techStack: [
               { name: 'Angular 20', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Implemented four parallel facility module tracks on a shared signal-based architecture — Retail (individual customers), Corporate (SMEs and large corporates with mandatory E&S governance review), Staff Loan (streamlined RM → BM → MD path), and Product Program (government MDA/parastatal employee lending) — each with track-specific multi-step forms, document compliance gates, and governance review paths',
               'Encoded the full two-stage approval hierarchy as application routing and UI state: Stage 1 Business Approval Flow (RM → BM → BFGH → ZH → GH), Governance Review Flow (CRM Officer → CRM Approver → E&S → Head Risk Management → ED → ED Risk → MD/CEO), and MCC Committee deliberation (online/offline mode, individual vote capture per member, Yes/No vote count compilation, MD/CEO configurable veto power); Stage 2 BCC escalation for ₦100M+ facilities with board majority-vote resolution and automated re-vote trigger on tied result',
               'Automated pre-submission background checks at origination stage: real-time PEP and blacklisted BVN screening via local list and third-party API, CRC/Credit Registry API returning live credit score and report, director-related customer account flagging, and collateral management notification trigger — all system-initiated before the request enters the approval chain',
               'Designed a section-scoped real-time comment system operating across all three workflow stages (Facility, Disbursement, Deferral): CommentContextService tracks active section name, RequestEntityType, parent tab, inner section, disbursement ID, and disbursement index via RxJS BehaviorSubject; CommentManagementService exposes a single loadAndTransformCommentsBySection() Observable consumed by every child component — eliminating comment-loading boilerplate across 190+ components',
               'Built 190+ fully standalone Angular 20 components and 26 shared reusable components with signal-based contracts (input(), output(), linkedSignal(), resource()) and zero NgModules; led Angular 19 → 20 migration resolving Vite 6/7 API incompatibility that caused complete dev-server failure'
            ],
            images: [
               '/assets/img/cap-overview.jpeg',
               '/assets/img/cap-login.jpeg'
            ],
            isHovered: false,
            stats: [
               { value: '4', label: 'Facility Modules' },
               { value: '10+', label: 'Approval Roles' },
               { value: '2', label: 'Governance Stages' },
               { value: '190+', label: 'Components' }
            ],
            pipelineLabel: 'Approval Journey',
            pipeline: [
               { name: 'Origination', meta: 'Account Officer / RM · automated PEP, BVN & CRC checks' },
               { name: 'Business Approval', meta: 'BM → BFGH → ZH → GH' },
               { name: 'Governance Review', meta: 'CRM → E&S → Risk Mgt → ED' },
               { name: 'MCC Committee', meta: 'Online vote capture · MD/CEO veto' },
               { name: 'BCC Escalation', meta: 'Facilities > ₦100M · board majority vote' },
               { name: 'Disbursement / Deferral', meta: 'Post-approval workflows unlocked' }
            ]
         },
         {
            id: 1,
            title: 'COSTAFF AI Digital Worker Platform',
            description: 'Architected a full-stack AI productivity suite for enterprise clients, integrating Gmail, Google Calendar, and OpenAI APIs into a unified Angular 16 platform that automates email, scheduling, invoicing, and document workflows.',
            techStack: [
               { name: 'Angular 16', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'NGXS', color: '#BA2BD2' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'NestJS', color: '#E0234E' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Reduced calendar management time by 85% via AI-powered event creation, Google Calendar API integration, and timezone-aware scheduling across 8 Middle Eastern markets',
               'Delivered Gmail-integrated email module with ML-powered categorisation and AI reply generation, processing high-volume inboxes with sub-second load times through RxJS stream optimisation',
               'Automated invoice generation pipeline handling 10,000+ invoices monthly at 99.9% accuracy — replacing a fully manual finance workflow',
               'Reduced client operational costs by an average of 50% by automating task assignment, booking management, document handling, and inventory tracking across a single unified platform',
               'Achieved 99.9% uptime through NestJS rate-limiting (100 req/sec), JWT refresh interceptor, and centralised error handling — with zero auth-related production incidents',
               'Cut application load time by 65% via lazy-loaded feature modules across 8 domains, OnPush change detection, and production bundle optimisation enforcing a 2 MB size budget'
            ],
            images: [
               '/assets/img/costaff-home.jpeg',
               '/assets/img/costaff-calendar.avif'
            ],
            isHovered: false,
            stats: [
               { value: '85%', label: 'Time Saved on Workflows' },
               { value: '10K+', label: 'Invoices / Month' },
               { value: '8', label: 'Markets Supported' },
               { value: '99.9%', label: 'Accuracy Rate' }
            ],
            pipelineLabel: 'Platform Workflow',
            pipeline: [
               { name: 'Gmail Module', meta: 'Email ingestion · AI classification · auto-reply drafting' },
               { name: 'Calendar Sync', meta: 'Google Calendar integration · timezone-aware scheduling' },
               { name: 'Invoice Engine', meta: 'Auto-generation · client billing · PDF export' },
               { name: 'Document Processing', meta: 'OCR extraction · data validation · filing' },
               { name: 'AI Assistant', meta: 'OpenAI-powered queries across all workspace data' }
            ]
         },
         {
            id: 2,
            title: 'Globus Trade Application (GTA)',
            description: 'Architected and delivered Globus Bank\'s CBN-mandated trade finance platform — digitising Letter of Credit (LC), Bills for Collection (BC), and end-to-end trade workflow management across all bank trade operations personas.',
            techStack: [
               { name: 'Angular 17', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Achieved 100% adoption by the full trade operations team within 6 months — the first digital replacement of a fully paper-based CBN-regulated trade finance process at Globus Bank',
               'Reduced trade document processing time by 60% through multi-step workflow automation, inline regulatory compliance validation gates, and automated SWIFT message generation',
               'Designed role-based access control spanning all trade personas (Account Officer, Trade Ops, Trade Manager, Authorizer, Admin) with Angular route guards and a server-driven permission matrix',
               'Integrated RESTful trade finance APIs handling LC issuance, Bills for Collection processing, live FX rate fetching, and regulatory reporting — with full error-state and retry handling',
               'Successfully completed UAT and deployed to production ahead of CBN-mandated regulatory deadline — zero post-launch critical defects'
            ],
            images: [
               '/assets/img/trade-dashboard.png',
               '/assets/img/trade-settings.png'
            ],
            isHovered: false,
            stats: [
               { value: '5', label: 'Trade Personas' },
               { value: '3', label: 'Products (LC / BC / TF)' },
               { value: '100%', label: 'Adoption at Launch' },
               { value: '60%', label: 'Faster Processing' }
            ],
            pipelineLabel: 'Trade Finance Flow',
            pipeline: [
               { name: 'Form Initiation', meta: 'Account Officer · facility type selection' },
               { name: 'Document Upload', meta: 'Trade docs · regulatory compliance checks' },
               { name: 'Compliance Gates', meta: 'Inline CBN validation · ECOWAS review' },
               { name: 'SWIFT Generation', meta: 'Automated SWIFT message creation · FX rate fetch' },
               { name: 'Authorisation', meta: 'Trade Ops → Trade Manager → Authorizer sign-off' }
            ]
         },
         {
            id: 3,
            title: 'Fraud Management System',
            description: 'Architected Globus Bank\'s real-time Fraud Management System — a 14-engine rule-based detection platform monitoring every bank transaction for behavioral anomalies, velocity breaches, and blacklist matches with zero-delay alerting.',
            techStack: [
               { name: 'Angular 16', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'WebSockets', color: '#4CAF50' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Achieved 100% transaction coverage within the first week of production deployment — all inbound and outbound bank transactions monitored through 14 configurable rule engines covering velocity limits, behavioral patterns, and blacklist screening',
               'Reduced fraudulent transaction incidents by 45% in the first 90 days post-deployment through automated real-time alerting and structured case management workflows',
               'Designed advanced analytics dashboard with real-time fraud pattern visualisations, per-customer risk scoring, and alert triage queue — enabling fraud ops to action flagged transactions in minutes vs. hours',
               'Built a hybrid security architecture separating sensitive fraud rule configuration into in-memory storage while managing auth tokens in sessionStorage — eliminating 11 vulnerability findings to zero production vulnerabilities',
               'Integrated with multiple Globus Bank core systems via REST APIs and WebSocket streams for real-time transaction event ingestion and instant risk score updates without page refresh'
            ],
            images: [
               '/assets/img/fraud-dashboard-dark.png',
               '/assets/img/fraud-details-dark.png'
            ],
            isHovered: false,
            stats: [
               { value: '14', label: 'Rule Engines' },
               { value: '100%', label: 'Transaction Coverage' },
               { value: '45%', label: 'Fraud Reduction' },
               { value: '₦250M+', label: 'Daily Monitored' }
            ],
            pipelineLabel: 'Detection Pipeline',
            pipeline: [
               { name: 'Transaction Ingestion', meta: 'REST API + WebSocket · real-time event stream' },
               { name: 'Rule Engine', meta: '14 configurable engines · velocity, pattern, behavior' },
               { name: 'Velocity Check', meta: 'Per-account transaction rate & amount thresholds' },
               { name: 'Blacklist Match', meta: 'BVN blacklist · known fraud patterns · PEP screen' },
               { name: 'Alert Generation', meta: 'Zero-delay push · fraud ops triage queue' },
               { name: 'Case Review', meta: 'Structured case management · resolution workflow' }
            ]
         },
         {
            id: 4,
            title: 'ProjectTiger — Domestic Transfer Platform',
            description: 'Led frontend delivery of Zenith Bank\'s ProjectTiger — a mission-critical payment system handling NIP, NEFT, and NAPS transfers across 350+ branches, replacing a legacy payment infrastructure serving 100,000+ daily banking customers.',
            techStack: [
               { name: 'Angular', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'Jenkins CI/CD', color: '#D33833' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Processed hundreds of billions in transactions within the first week of ProjectTiger deployment — zero downtime during live cutover from the legacy transfer system serving 350 branches',
               'Reduced transaction processing time by 70% through streamlined multi-role transfer workflows, real-time beneficiary validation, and automated debit confirmation with instant receipt generation',
               'Built reusable component library covering all three transfer types (NIP, NEFT, NAPS) with shared validation services, configurable limit-check logic, and beneficiary management — reducing parallel feature development time by 60%',
               'Achieved 90%+ positive user feedback score from teller and operations staff in the post-launch satisfaction survey',
               'Architected role-gated transfer flows (Teller, Supervisor, Authorizer) with Angular route guards and configurable per-role transaction limit policies enforced at both UI and API intercept layers'
            ],
            images: [
               '/assets/img/domestic-login.png',
               '/assets/img/domestic-dashboard.png'
            ],
            isHovered: false,
            stats: [
               { value: '₦100B+', label: 'Processed Week 1' },
               { value: '70%', label: 'Faster Processing' },
               { value: '99.9%', label: 'Uptime' },
               { value: '90%+', label: 'User Satisfaction' }
            ],
            pipelineLabel: 'Transfer Flow',
            pipeline: [
               { name: 'Initiation', meta: 'Teller · transfer type selection (NIP / NEFT / NAPS)' },
               { name: 'Account Validation', meta: 'Real-time beneficiary lookup · bank code resolution' },
               { name: 'Limit Check', meta: 'Per-role transaction caps · balance verification' },
               { name: 'Processing', meta: 'NIP / NEFT / NAPS routing · debit confirmation' },
               { name: 'Notification', meta: 'Instant receipt generation · customer SMS trigger' }
            ]
         },
         {
            id: 5,
            title: 'X-Path — Merchant Collection Platform',
            description: 'Architected XPath, Zenith Bank\'s merchant collection platform — a three-application micro-frontend suite (Admin, Teller, Data-Store) serving 350 branches with direct ERP integration for fully automated payment reconciliation.',
            techStack: [
               { name: 'Angular', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'Angular Universal', color: '#B7178C' },
               { name: 'Jenkins CI/CD', color: '#D33833' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Reduced merchant onboarding time by 70% through a dynamic integration platform with self-service ERP configuration and automated connectivity — eliminating manual setup that previously took days',
               'Connected with client Enterprise Resource Planning (ERP) systems at 350 branches — payment events automatically updated client records at point-of-sale with zero manual reconciliation required',
               'Improved sprint completion rate from 19% to 85% and team velocity from 8 to 28 story points per sprint — achieved through process restructuring, CI/CD pipeline improvements, and systematic technical debt elimination',
               'Architected three independently deployable Angular micro-frontend applications (Admin portal, Teller interface, Data-Store reporting) with separate build pipelines and isolated routing domains via Jenkins CI/CD',
               'Implemented Angular Universal SSR improving initial page load by 40% and SEO performance by 60% — critical for the publicly-accessible merchant-facing portal'
            ],
            images: [
               '/assets/img/xpath-charges.png',
               '/assets/img/xpath-config.png'
            ],
            isHovered: false,
            stats: [
               { value: '19→85%', label: 'Sprint Completion' },
               { value: '180+', label: 'Merchants Onboarded' },
               { value: '15+', label: 'API Integrations' },
               { value: '70%', label: 'Faster Onboarding' }
            ],
            pipelineLabel: 'Collection Workflow',
            pipeline: [
               { name: 'Merchant Onboarding', meta: 'Self-service ERP config · automated connectivity' },
               { name: 'Collection Setup', meta: 'Branch assignment · product mapping · fee config' },
               { name: 'Transaction Routing', meta: 'Multi-bank switching · split-payment logic' },
               { name: 'Reconciliation', meta: 'Auto-match payment events to ERP records' },
               { name: 'ERP Export', meta: 'Real-time data sync · zero manual reconciliation' }
            ]
         },
         // Add more projects...
      ];
   }

   getAssessmentProjects(): AssessmentProject[] {
      return [
         {
            id: 10,
            type: 'assessment',
            title: 'LogicBank',
            assessmentBy: 'First Bank Nigeria',
            level: 'senior',
            accentColor: '#818cf8',
            accentColorRgb: '129, 140, 248',
            assessmentBrief: 'Engaged as Senior Analyst, Frontend Development to build a pixel-perfect multi-step ID Document Update portal for LogicBank Account Maintenance Services from a Figma specification — evaluated on design fidelity, error handling, responsiveness, code quality (state management, scalability), performance, and documentation.',
            description: 'A production-grade, 7-route Angular 19 portal guiding LogicBank customers through a self-service Identity Document Update flow — NDPR consent, OTP-verified account lookup, identity document upload with drag-and-drop, and a sequential 4-modal submission process — without requiring a branch visit.',
            techStack: [
               { name: 'Angular 19', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'CSS Grid', color: '#264DE4' },
               { name: 'CSS3', color: '#339933' },
            ],
            achievements: [
               'Implemented a 7-step IDU flow (NDPR consent → OTP verification → document upload → terms → 4-modal submit sequence) with a 5-minute countdown timer and auto-disabling OTP input on expiry',
               'Applied Angular 19 signal-based patterns throughout: signal() / computed() / effect(), new @if / @for control flow, inject() DI, and @defer to gate modals out of the initial bundle',
               'Route-level lazy loading with loadComponent() and canActivate guards; initial bundle held to 81 kB gzipped with background pre-fetch via withPreloading(PreloadAllModules)',
               'Built a 3-slide upload-guide carousel modal with SVG illustrations and a drag-and-drop upload system with event-bubbling conflict resolution between upload zone and hidden file input',
               'Fully responsive across 6 breakpoints (1400 px → 360 px): 3-column card grid collapses to single-column; all forms, upload zones, and modals adapt to 300 px minimum viewport width',
            ],
            demoUrl: 'https://logicbank.netlify.app',
            repoUrl: 'https://github.com/ayomideesam/logicbank',
            images: [
               'assets/img/assessment/logic-bank/logic1.jpeg',
               'assets/img/assessment/logic-bank/logic2.jpeg',
               'assets/img/assessment/logic-bank/logic3.jpeg',
               'assets/img/assessment/logic-bank/logic4.jpeg',
               'assets/img/assessment/logic-bank/logic5.jpeg',
            ],
         },
         {
            id: 11,
            type: 'assessment',
            title: 'Work Order Schedule Timeline',
            assessmentBy: 'Naologic',
            level: 'senior',
            accentColor: '#2dd4bf',
            accentColorRgb: '45, 212, 191',
            assessmentBrief: 'Build a pixel-perfect Work Order Schedule Timeline from a Sketch design specification for a manufacturing ERP — Gantt-style grid across multiple work centers with Day / Week / Month zoom levels, a Reactive Forms CRUD slide-out panel using ng-select and ngb-datepicker, and real-time work order overlap detection.',
            description: 'An Angular 19 SPA that fully satisfies every required deliverable of the Naologic brief and implements all 11 listed bonus features — including localStorage persistence, inactivity detection, keyboard navigation, a "Today" jump button, and a Webpack → esbuild migration that achieved a 10.6× cold build improvement.',
            techStack: [
               { name: 'Angular 19', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'SCSS', color: '#CC6699' },
               { name: 'ng-select', color: '#339933' },
               { name: 'ng-bootstrap', color: '#7952B3' },
            ],
            achievements: [
               'Delivered every required feature from the Sketch spec: horizontally-scrollable Gantt grid with a fixed work-center left panel, Day / Week / Month timescale switching that updates column granularity and header in sync, color-coded status bars (Open / In Progress / Complete / Blocked) with name label, status badge, and a three-dot Edit / Delete action menu, and a vertical current-day indicator spanning the full grid height',
               'Built create / edit slide-out panels backed by Angular Reactive Forms (FormGroup + Validators), ng-select status dropdowns defaulting to "Open", and ngb-datepicker date pickers — with click-position date pre-fill on create, end-date defaulting to start + 7 days, and real-time overlap detection that blocks save and surfaces inline error messaging when conflicting orders exist on the same work center',
               'Delivered all 11 optional bonus features: localStorage persistence across refreshes, smooth panel slide-in / slide-out CSS transitions, full keyboard navigation (arrow keys / Enter / Escape), a "Today" button that scrolls the timeline horizontally to the current date, ngb-tooltip detail cards on bar hover, auto-dismissing toast notifications for all CRUD actions, an inactivity detector that auto-saves state and warns the user, a splash landing page, zoom state reset on route re-entry, and responsive device detection via Angular CDK BreakpointObserver with contextual warning banners',
               'Managed all reactive state with Angular 19 Signals across 12 single-responsibility services (WorkOrderService, WorkCenterService, TimelineZoomService, OverlapDetectionService, TimelineStateService, ToastService, InactivityService, DeviceDetectionService, and more) — zero NgRx, OnPush change detection on all 8 timeline components, reducing change-detection cycles from 100+ per second to fewer than 5 during rapid horizontal scroll'
            ],
            demoUrl: 'https://naologicerp.netlify.app/',
            repoUrl: 'https://github.com/ayomideesam/iruobe-work-order-timeline',
            images: [
               'assets/img/assessment/naologic/naologic1.jpeg',
               'assets/img/assessment/naologic/naologic2.jpeg',
            ],
         },
         {
            id: 12,
            type: 'assessment',
            title: 'Featured Books',
            assessmentBy: 'FAT BEEHIVE',
            level: 'mid',
            accentColor: '#fbbf24',
            accentColorRgb: '251, 191, 36',
            assessmentBrief: 'Recreate a Figma design specification for a featured books UI showcase component using semantic HTML, SCSS, and BEM methodology — no JavaScript frameworks allowed.',
            description: 'A pixel-perfect, zero-JavaScript books UI component built from a Figma spec, demonstrating a custom SCSS token system, strict BEM naming, and a mobile-first responsive architecture spanning eight breakpoints.',
            techStack: [
               { name: 'HTML5', color: '#339933' },
               { name: 'SCSS', color: '#CC6699' },
               { name: 'BEM', color: '#1572B6' },
               { name: 'CSS Grid', color: '#264DE4' },
               { name: 'Flexbox', color: '#264DE4' },
            ],
            achievements: [
               'Architected a SCSS system with 40+ design tokens — color, spacing, typography, dimension, breakpoint, shadow, and animation variables — compiled to production CSS with no build tooling',
               'Applied strict BEM naming throughout (.books, .card, .card__image-container, .card--tv-only) for a collision-resistant, scalable component architecture with zero global style bleed',
               'Combined CSS Grid (1-col → 2-col → 3-col) for the outer layout with Flexbox for each card\'s internal horizontal structure, using grid-auto-rows: 1fr to enforce equal card heights',
               'Built a mobile-first responsive system across eight breakpoints (20rem to 125rem+), including TV-exclusive cards that activate only at 115rem+ with a 3×2 grid layout',
               'Delivered WCAG AA-compliant accessibility via semantic HTML5, descriptive aria-label attributes, full keyboard navigation with tabindex, and a prefers-reduced-motion query disabling all shimmer animations',
            ],
            demoUrl: 'https://featured-books.netlify.app/',
            repoUrl: 'https://github.com/ayomideesam/featured-books',
            images: [
               'assets/img/assessment/fat-beehive/fat-beehive1.jpeg',
            ],
         },
      ];
   }

}