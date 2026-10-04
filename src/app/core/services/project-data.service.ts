import { Injectable } from "@angular/core";

interface ProjectStat {
   value: string;
   label: string;
}

interface ProjectPipelineStep {
   name: string;
   meta: string;
}

/** A group of engineering detail for the "Under the hood" panel. */
interface EngineeringNote {
   area: string;
   points: string[];
}

interface Project {
   id: number;
   title: string;
   description: string;
   techStack: { name: string; color: string; }[];
   achievements: string[];
   /** Codebase facts counted from the repository (components, services, tests). */
   codebase?: string[];
   /** The depth the CV no longer carries: architecture, engineering, delivery. */
   engineering?: EngineeringNote[];
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
            id: 7,
            title: 'Globus Trade Export — NXP Platform',
            description: 'Akhigbe Iruobe led the frontend of Globus Bank\'s new export trade finance platform — a from-scratch Angular 21 build on the bank\'s own globuswebcomponents design system that digitises the CBN export chain: NXP applications, the NESS levy, repatriation of export proceeds, and cancellation & closure, with every step a maker-checker flow that moves real money. A seven-person team — two frontend engineers, two senior backend engineers, a project manager, a product owner and a QA tester — took it from kickoff on 10 July 2026 to final UAT on 1 October; it passed business CAB and rolls out to production in October 2026.',
            techStack: [
               { name: 'Angular 21', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'NgRx Signals', color: '#BA2BD2' },
               { name: 'Vitest', color: '#6E9F18' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Led the Export frontend as the senior frontend engineer — 13 routed pages, 3 data services & 40+ backend endpoints covering NXP applications, the NESS levy, repatriation, cancellation & closure — working the API contract with two senior backend engineers (live integration from 18 August) and every flow with QA through two stakeholder walkthroughs in September and final UAT on 1 October',
               'Engineered the NESS levy payment, which debits a customer account, so the dangerous paths are structurally impossible: submit is gated on a resolved NXP lookup, an unpaid levy & the SHIPMENT stage; the debit account is derived from the application rather than picked; a response only counts as success when the API\'s own result flag says so; & retrying a failed debit is Authorizer-only',
               'Built repatriation of export proceeds in three variants (full, partial, advanced) with a ±10% tolerance stepper that sets the repatriable ceiling, a live position card, document uploads, & unapply as its own maker-checker pair — the UI always re-reads the server\'s position instead of adjusting figures locally',
               'Modelled every step as a maker-checker chain (Initiator → Authorizer, Viewer read-only): Approve / Return / Decline through one shared decision modal, approval logs read back from the API, & role- and stage-aware row menus that only offer the actions the workflow allows',
               'Architected a signals-first Angular 21 codebase — standalone components with zero NgModules, an NgRx Signal Store for session & roles, httpResource for reads, OnPush everywhere, server-driven paging, search & filters, & Excel/PDF exports in three scopes — 87 components across 38 routes',
               'Ran security & quality as a standing practice: npm audit at 0 vulnerabilities across dev & production trees, a full application security audit with an OWASP Top 10 self-review, strict CSP & HSTS headers, session-scoped tokens attached only to the API origin, & 776 passing Vitest tests after migrating the suite off Karma',
               'Ran the frontend\'s delivery discipline with the second frontend engineer: a written merge protocol with file-by-file reviews for every integration, a 40+ entry footgun log, & 42 documented patches to the bank\'s design-system package — the build refuses to start against an unpatched tree'
            ],
            codebase: ['Angular 21', '87 components', '776 Vitest tests', '4,100+ lines of written standards'],
            engineering: [
               {
                  area: 'Architecture',
                  points: [
                     'Feature folders per export domain (NXP, NESS, repatriation, cancellation and closure) on a core / shared / layout split, with a written rule for when state stays as plain signals and when it earns an NgRx Signal Store.',
                     'One modal system — a ModalShellComponent and its variants — so every decision, upload and confirmation dialog shares focus handling, layout and keyboard behaviour.'
                  ]
               },
               {
                  area: 'Quality & security',
                  points: [
                     'Tests run in jsdom through @angular/build with v8 coverage; a verify skill boots a fake authenticated session and mocks the backend with Playwright route interception, so any screen can be driven and screenshotted without a live API.',
                     'Dependency hygiene is policy, not a one-off: a living NPM-AUDIT.md, narrow in-major overrides, and npm audit held at 0 across dev and production trees.'
                  ]
               },
               {
                  area: 'AI-augmented delivery',
                  points: [
                     'CLAUDE.md routes Claude Code (Opus 5.5 and Fable 5.1) to the standard that governs each question before it writes a line: ANGULAR-STANDARDS.md (1,914 lines), ARCHITECTURE.md, SECURITY.md, BRANCH-MERGE-PROTOCOL.md (604 lines) and NPM-AUDIT.md.',
                     'Every non-obvious Angular or design-system trap goes into a Known Footguns log the day it bites (40+ entries), so neither the team nor the agent relearns it.'
                  ]
               }
            ],
            images: [
               '/assets/img/nxp-overview.png',
               '/assets/img/nxp-applications.png',
               '/assets/img/nxp-ness.png',
               '/assets/img/nxp-repatriation.png',
               '/assets/img/nxp-cancelation.png'
            ],
            isHovered: false,
            stats: [
               { value: '4', label: 'Export Workflows' },
               { value: '40+', label: 'API Endpoints' },
               { value: '770+', label: 'Unit Tests' },
               { value: '0', label: 'npm Vulnerabilities' }
            ],
            pipelineLabel: 'Export Proceeds Chain',
            pipeline: [
               { name: 'NXP Application', meta: 'Exporter applies · ADB & PIA review' },
               { name: 'NESS Levy', meta: 'Statutory fee · account debit + receipt' },
               { name: 'Shipment', meta: 'Goods ship · levy-paid gate' },
               { name: 'Repatriation', meta: 'Proceeds return · full, partial or advanced · ±10% tolerance' },
               { name: 'Closure', meta: 'Application closed out · approve / reject' }
            ]
         },
         {
            id: 6,
            title: 'Credit Approval Process (CAP)',
            description: 'Akhigbe Iruobe is the senior frontend engineer on Globus Bank\'s Credit Approval Process Automation Solution, built by a seven-person team (two frontend engineers, two senior backend engineers, a project manager, a product owner and a QA tester) — a CBN-compliant platform designed to digitise the full credit lifecycle across 4 facility modules (Retail, Corporate, Staff Loan, Product). Every request climbs a 15-desk sequential approval chain — from the Account Officer through branch and zonal management, Legal, Credit Risk, the Executive Directors and the MD to the MCC and BCC committees, with Approve, Return-to-any-lower-desk or Reject at each — after which the platform opens the disbursement and deferral workflows. The Retail module passed business CAB and rolls out to production in October 2026; the Corporate module is paused at ~10% build after the team was redeployed to Trade Export in July 2026.',
            techStack: [
               { name: 'Angular 20', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Designed 4 facility module tracks on a shared signal-based architecture — Retail (individual customers), Corporate (SMEs & large corporates with mandatory E&S governance review), Staff Loan (streamlined RM → BM → MD path), & Product Program (government MDA/parastatal employee lending) — each with track-specific multi-step forms, document compliance gates, & governance review paths. Retail ships first with origination, disbursement & deferral complete; Corporate is ~10% built, and Staff Loan & Product Program are on the roadmap',
               'Encoded the 15-desk approval chain as application routing & UI state — Account Officer → Branch Manager → BFG Head → Zonal Head → Group Head → Legal Officer → Head of Legal → Credit Analyst → Head Credit → CRO → ED Business → ED Risk → MD → MCC → BCC — with role-based landing routes, Approve / Return-to-any-lower-desk / Reject at every desk, the MD offer-letter decision & a 48-hour SLA flag on every queue; plus the 17-desk disbursement chain (through CPO, CPA, COO & COA) & the 8-desk deferral chain',
               'Led the frontend of the Disbursement workflow: multiple drawdowns per facility until fully disbursed with every amount validated against the undrawn balance, a four-view By Facility / By Request queue, COO & CPO approval with live loan-booking status, currency-aware screens with SOFR base-rate resolution for foreign-currency facilities, VAT-rate & fee calculations, vendor bank account name verification, NIN capture & moratorium handling — plus the matching Deferral create & update flows',
               'Built the origination background-check screens: AML screening against the PEP, Sanction & AMC lists with per-field fuzzy-match scores (name, date of birth, BVN, email, country), credit-bureau reports from FirstCentral, CreditRegistry & CBN CRMS (Performing → Lost, reports older than 3 months dropped), director- & group-related flags, & the single-obligor-limit impact on proposed exposure — all before the request enters the approval chain',
               'Designed a section-scoped comment system operating across all three workflow stages (Facility, Disbursement, Deferral): CommentContextService tracks active section name, RequestEntityType, parent tab, inner section, disbursement ID, & disbursement index via RxJS BehaviorSubject; CommentManagementService exposes a single loadAndTransformCommentsBySection() Observable consumed by every child component — eliminating comment-loading boilerplate across 230+ components',
               'Built, with the second frontend engineer, 230+ fully standalone Angular 20 comps & 26 shared reusable comps with signal-based contracts (input(), output(), linkedSignal(), resource()) & zero NgModules; led Angular 19 → 20 migration resolving Vite 6/7 API incompatibility that caused complete dev-server failure, & cleared all 40 npm audit findings (2 high) ahead of CAB'
            ],
            codebase: ['Angular 20', '239 components', '50 services', '275 spec files'],
            engineering: [
               {
                  area: 'Architecture',
                  points: [
                     'Each desk gets its own lazy-loaded layout shell behind a role-normalising auth guard, so 15 personas share one codebase without seeing each other\'s screens.',
                     'Comment loading is a single RxJS composition: CommentManagementService normalises the API envelope, branches on response codes 00 and 01, maps to the design system\'s comment format and derives display names from emails — for every section of all three workflow stages.'
                  ]
               },
               {
                  area: 'Migration & tooling',
                  points: [
                     'Angular 19 → 20 onto fully signal-based contracts; fixed the Vite 7 API break that had stopped the team\'s dev server, cleared 83 compiler warnings, and wrote a Python script that added the -webkit-backdrop-filter prefix across 202 CSS and HTML files.',
                     'Security-sensitive transitive dependencies (esbuild, ws, postcss, serialize-javascript) pinned with narrow npm overrides, each backed by a written InfoSec risk assessment.'
                  ]
               },
               {
                  area: 'Delivery',
                  points: [
                     'A two-branch workflow (AIBranch and EIBranch) with written Angular standards and a merge protocol that every integration follows; every merge into the working branch reviewed.'
                  ]
               }
            ],
            images: [
               '/assets/img/cap-dashboard.png',
               '/assets/img/cap-facility-requests.png',
               '/assets/img/cap-disbursements.png',
               '/assets/img/cap-login.jpeg'
            ],
            isHovered: false,
            stats: [
               { value: '4', label: 'Modules Designed' },
               { value: '15', label: 'Approval Desks' },
               { value: '3', label: 'Workflows' },
               { value: '230+', label: 'Components' }
            ],
            pipelineLabel: 'Approval Journey',
            pipeline: [
               { name: 'Origination', meta: 'Account Officer · AML/PEP screening & credit-bureau checks' },
               { name: 'Business Line', meta: 'BM → BFG Head → Zonal Head → Group Head' },
               { name: 'Legal & Credit Risk', meta: 'Legal → Head of Legal → Credit Analyst → Head Credit → CRO' },
               { name: 'Executive', meta: 'ED Business → ED Risk → MD · offer letter' },
               { name: 'Committees', meta: 'MCC → BCC · approve, return or reject' },
               { name: 'Disbursement / Deferral', meta: 'Post-approval workflows unlocked' }
            ]
         },
         {
            id: 3,
            title: 'Fraud Management System',
            description: 'Akhigbe Iruobe architected Globus Bank\'s Fraud Management System — monitoring every inflow and outflow transaction against 14 weighted rules (SIM swap, PIN and device changes, account age, velocity, unusual amounts, hours and days, failed attempts, high-risk IPs and watch-listed BVNs), placing a PND or lien on flagged accounts and routing each case through a customer call-back and maker-checker review.',
            techStack: [
               { name: 'Angular 16', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'AG Charts', color: '#2563EB' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Achieved 100% transaction coverage within the first week of production deployment — all inbound and outbound bank transactions monitored against 14 weighted rules covering customer-behaviour signals (SIM swap, PIN & device changes, account age) and transaction attributes (velocity, amount, time, location, failed attempts, high-risk IPs, watch-listed BVNs)',
               'Reduced fraudulent transaction incidents by 45% in the first 90 days post-deployment through automatic PND/lien restrictions on flagged accounts and a structured maker-checker case review',
               'Designed the analytics dashboard — inflow vs outflow trends, channel analysis, monthly totals by status, per-transaction risk scores with the rules that fired, and a triage queue for fraud operations',
               'Built a hybrid security architecture separating sensitive fraud rule configuration into in-memory storage while managing auth tokens in sessionStorage, with zero vulnerabilities in the production build',
               'Built the maker-checker review: the initiator calls the customer back and grades each answer Pass or Fail, then waives the transaction or confirms fraud; the authorizer approves or returns in bulk, lifting or sustaining the restriction; and every rule-matrix change goes through the same initiate, authorize or recall review with a before-and-after diff'
            ],
            codebase: ['30 components', '24 services', 'NGXS', 'AG Charts'],
            engineering: [
               {
                  area: 'Ownership',
                  points: [
                     'Sole frontend engineer from the first commit to production: every one of the repository\'s 112 commits.'
                  ]
               },
               {
                  area: 'Architecture',
                  points: [
                     'NGXS store with the storage plugin for session state; sensitive rule configuration is kept in memory and only auth tokens live in sessionStorage.',
                     'Changes to the rule matrix go through the same maker-checker approval as flagged transactions, so no single officer can quietly weaken detection.'
                  ]
               },
               {
                  area: 'Analytics',
                  points: [
                     'AG Charts dashboards for inflow vs outflow trends, channel analysis and monthly totals by status, and per-transaction risk scores that list exactly which weighted rules fired.'
                  ]
               }
            ],
            images: [
               '/assets/img/fraud-live-dashboard.png',
               '/assets/img/fraud-flagged-transactions.png',
               '/assets/img/fraud-rule-engines.png',
               '/assets/img/fraud-details-dark.png',
               '/assets/img/fraud-dashboard-dark.png'
            ],
            isHovered: false,
            stats: [
               { value: '14', label: 'Weighted Rules' },
               { value: '100%', label: 'Transaction Coverage' },
               { value: '45%', label: 'Fraud Reduction' },
               { value: '₦250M+', label: 'Daily Monitored' }
            ],
            pipelineLabel: 'Detection Pipeline',
            pipeline: [
               { name: 'Transaction Ingestion', meta: 'REST · inflow & outflow monitoring' },
               { name: 'Rule Matrix', meta: '14 weighted rules · behaviour & transaction attributes' },
               { name: 'Risk Score', meta: 'Triggered rules & weights per transaction' },
               { name: 'Restriction', meta: 'PND or lien placed on the account' },
               { name: 'Call-back Review', meta: 'Initiator grades the customer · waive or confirm fraud' },
               { name: 'Authorisation', meta: 'Authorizer approves or returns · PND lifted or sustained' }
            ]
         },
         {
            id: 2,
            title: 'Globus Trade Application — Import (GTA)',
            description: 'Akhigbe Iruobe architected and delivered Globus Bank\'s CBN-mandated import trade finance platform — digitising Form M processing: the FX-validity gate (with an override against a signed letter), shipping-document review by Bill of Lading across Advanced and Negotiating sets, Exchange Control Documents and PAARs, amendments, extensions and cancellations with their fees, and the maker-checker release of documents to a verified recipient.',
            techStack: [
               { name: 'Angular 19', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Achieved 100% adoption by the full trade operations team within 6 months — the first digital replacement of a fully paper-based CBN-regulated trade finance process at Globus Bank',
               'Replaced paper-based document handling with multi-step workflow automation and inline compliance gates — an FX-validity check before any document is added, and a 13-document LC-requirements checklist (originals and copies) for every shipment',
               'Designed role-based access control for the maker-checker model — Initiator, Approver/Authorizer and Viewer — gating every action (adding documents, amendments, release requests, charge setup, concessions) on the signed-in role',
               'Integrated the Form M, document, amendment-fee, concession and file-storage APIs — 5 MB-capped uploads of shipping documents, ECDs and PAARs, Excel report export, and full error-state and retry handling',
               'Took the platform through UAT and into production as its sole frontend engineer — 161 of the repository\'s 162 commits — and later upgraded it from Angular 16 to 19 one major at a time'
            ],
            codebase: ['Angular 19', '35 components', '33 services', 'NGXS'],
            engineering: [
               {
                  area: 'Ownership',
                  points: [
                     'Sole frontend engineer: 161 of the repository\'s 162 commits.'
                  ]
               },
               {
                  area: 'Engineering',
                  points: [
                     'Centralised every upload in a DocumentUploadService with Observable progress streams, removing about 450 lines of duplicated upload code from the import workflow.',
                     'ECD documents are tracked and filtered by bill-of-lading reference and cleared automatically after a successful submission, so each partial shipment only ever shows its own declarations.'
                  ]
               },
               {
                  area: 'Upgrades & security',
                  points: [
                     'Upgraded Angular 16 → 17 → 18 → 19 one major at a time, with every step documented and a production security report showing zero vulnerabilities in the production bundle.',
                     'Session hardening: sensitive data kept in memory, only auth tokens in sessionStorage.'
                  ]
               }
            ],
            images: [
               '/assets/img/gta-home.png',
               '/assets/img/gta-documents.png',
               '/assets/img/gta-import.png',
               '/assets/img/gta-details.png',
               '/assets/img/gta-settings.png'
            ],
            isHovered: false,
            stats: [
               { value: '4', label: 'Document Types' },
               { value: '13', label: 'LC Checklist Docs' },
               { value: '100%', label: 'Adoption at Launch' },
               { value: '16→19', label: 'Angular Upgrade' }
            ],
            pipelineLabel: 'Form M Journey',
            pipeline: [
               { name: 'Form M', meta: 'Registered Form M · FX validity checked' },
               { name: 'Document Upload', meta: 'Shipping docs by B/L · ECD · PAAR' },
               { name: 'Requirements Check', meta: '13 documents · originals & copies vs LC terms' },
               { name: 'Approval', meta: 'Initiator → Approver · approve, return or reject' },
               { name: 'Document Release', meta: 'Approver releases to a verified recipient' }
            ]
         },
         {
            id: 1,
            title: 'COSTAFF AI Digital Worker Platform',
            description: 'Akhigbe Iruobe led the Angular frontend of COSTAFF, an AI productivity suite for enterprise clients across the Middle East — integrating Gmail, Google Calendar and OpenAI into one Angular 16 platform that automates email, scheduling, invoicing and document workflows, with a team of 6 frontend developers.',
            techStack: [
               { name: 'Angular 16', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'NGXS', color: '#BA2BD2' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'OpenAI', color: '#10A37F' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Cut calendar-management time by 85% for client teams with AI-powered event creation, Google Calendar integration and time-zone-aware scheduling',
               'Delivered the Gmail-integrated email module: email categories, thread summaries and AI-drafted replies, kept responsive on large inboxes through RxJS stream composition',
               'Built invoice generation into the financials module, replacing a fully manual billing workflow',
               'Brought tasks, bookings, documents, invoicing and analytics into one platform per client team',
               'Hardened the client with a JWT refresh interceptor and centralised error handling',
               'Lazy-loaded feature modules across 8 product areas, OnPush change detection, and a 2 MB production bundle budget enforced by the build'
            ],
            codebase: ['Angular 16', '59 components', '8 lazy product areas', 'NGXS'],
            engineering: [
               {
                  area: 'Product surface',
                  points: [
                     'Eight lazy-loaded product areas — home, email, calendar, tasks, bookings, documents, financials and analytics — plus onboarding, account recovery and transactional email templates (welcome, verification, profile completion, re-engagement).'
                  ]
               },
               {
                  area: 'AI features',
                  points: [
                     'The email assistant summarises a thread and drafts a suggested reply in a chosen tone; replies render as rich text through ngx-markdown and ngx-quill.',
                     'The scheduling agent works through wait → upsert → insert actions against Google Calendar: it protects focus time and moves flexible meetings before booking a new one.'
                  ]
               },
               {
                  area: 'Team',
                  points: [
                     'Coordinated 6 frontend developers on shared coding standards and a component library used across every product area.'
                  ]
               }
            ],
            images: [
               '/assets/img/costaff-calendar.avif',
               '/assets/img/costaff-inbox.png',
               '/assets/img/costaff-week.png',
               '/assets/img/costaff-assistant.png',
               '/assets/img/costaff-home.jpeg'
            ],
            isHovered: false,
            stats: [
               { value: '85%', label: 'Calendar Time Saved' },
               { value: '8', label: 'Product Areas' },
               { value: '3', label: 'AI Integrations' },
               { value: '6', label: 'Frontend Devs Led' }
            ],
            pipelineLabel: 'Platform Workflow',
            pipeline: [
               { name: 'Gmail Module', meta: 'Email ingestion · AI classification · auto-reply drafting' },
               { name: 'Calendar Sync', meta: 'Google Calendar integration · timezone-aware scheduling' },
               { name: 'Invoice Engine', meta: 'Invoice generation · client billing' },
               { name: 'Documents', meta: 'Upload · organise · share across the team' },
               { name: 'AI Assistant', meta: 'OpenAI-powered queries across all workspace data' }
            ]
         },
         {
            id: 4,
            title: 'ProjectTiger — Domestic Transfer Platform',
            description: 'Akhigbe Iruobe led frontend delivery of Zenith Bank\'s ProjectTiger — a mission-critical payment system handling NIP, NEFT, and NAPS transfers across 350+ branches, replacing a legacy payment infrastructure serving 100,000+ daily banking customers.',
            techStack: [
               { name: 'Angular', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'RxJS', color: '#B7178C' },
               { name: 'Jenkins CI/CD', color: '#D33833' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Processed ₦100B+ in its first week live, with zero downtime during the cutover from the legacy transfer system across 350 branches',
               'Built the teller payment flow: sender balance and overdraft checks, name enquiry with the beneficiary\'s KYC level, teller limits, and a HOP approval queue that escalates to the zonal head when a transfer exceeds the limit',
               'Shared building blocks across the original three rails (NIP, NEFT, NAPS) — validation services, configurable limit checks and beneficiary management — reused by every transfer type',
               'Role-gated flows for Teller, HOP and Zonal Head with Angular route guards and per-role transaction limits',
               'Later extended the platform across every rail, inward and outward — NIP, NEFT, NAPS and PAPSS — with NAPS direct credits, clearing sessions and a Transaction 360 global search (see Under the hood)'
            ],
            codebase: ['135 components', '41 services', '36 routed modules', 'NIP · NEFT · NAPS · PAPSS'],
            engineering: [
               {
                  area: 'Teller flow',
                  points: [
                     'Sender balance and overdraft checks, name enquiry with the beneficiary\'s KYC level, teller limits, and a HOP approval queue that escalates to the zonal head ("Awaiting ZH Approval") when a transfer exceeds the limit.'
                  ]
               },
               {
                  area: 'Every rail, inward and outward',
                  points: [
                     'NIP: fraud checks, settlement, returns with bulk upload, reconciliation, receipt generation and data restore.',
                     'NEFT: credit and debit batches, processed and unprocessed queues, bulk uploads and dividend warrants, with clearing sessions, their history and reversal.',
                     'NAPS: direct credits with pend, unpend and amount blocks, paid and unpaid reports, and reconciliation.',
                     'PAPSS cross-border (Africa) inward and outward with dashboards, reconciliation and reporting — and a Transaction 360 global search across every rail.'
                  ]
               },
               {
                  area: 'Engineering',
                  points: [
                     'NGXS state, light and dark themes, and Azure Pipelines CI.'
                  ]
               }
            ],
            images: [
               '/assets/img/tiger-teller.png',
               '/assets/img/tiger-queue.png',
               '/assets/img/tiger-naps-direct.png',
               '/assets/img/tiger-search.png',
               '/assets/img/tiger-nip-dashboard.png'
            ],
            isHovered: false,
            stats: [
               { value: '₦100B+', label: 'Processed Week 1' },
               { value: '4', label: 'Payment Rails' },
               { value: '350', label: 'Branches' },
               { value: 'Zero', label: 'Downtime at Cutover' }
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
            description: 'Akhigbe Iruobe architected XPath, Zenith Bank\'s merchant collection platform — a three-application micro-frontend suite (Admin, Teller, Data-Store) serving 350 branches with direct ERP integration for fully automated payment reconciliation.',
            techStack: [
               { name: 'Angular', color: '#DD0031' },
               { name: 'TypeScript', color: '#3178C6' },
               { name: 'SignalR', color: '#512BD4' },
               { name: 'Jenkins CI/CD', color: '#D33833' },
               { name: 'HTML5 | CSS3', color: '#339933' }
            ],
            achievements: [
               'Reduced merchant onboarding time by 70% through a dynamic integration platform with self-service ERP configuration and automated connectivity, replacing manual merchant setup',
               'Connected with client Enterprise Resource Planning (ERP) systems at 350 branches — payment events update the merchant\'s records at the point of collection, without manual re-keying',
               'Akhigbe Iruobe was named Sprint Champion — the Zenith PMO\'s highest achiever — in back-to-back sprints in March 2023; in Sprint 4 the team\'s velocity rose from 8 to 28 story points and its completion rate from 19% to 69%',
               'Three independently deployable Angular apps (Admin portal, Teller interface, Data-Store reporting) with separate build pipelines in Jenkins CI/CD and live transaction status over SignalR'
            ],
            codebase: ['Angular 14', '55 components', 'NGXS', 'SignalR'],
            engineering: [
               {
                  area: 'Teller collections',
                  points: [
                     'Merchant-defined custom fields render as a dynamic form with dropdowns that cascade from the merchant\'s own API, memo pop-ups before payment, payment methods (cash, cheque, transfer, POS), an amount-match check, a preview step and a PDF receipt.',
                     'Cash and cheque withdrawals, PTA/BTA travel-allowance payments and inbound IMTO transfers, each with its own HOP approval path.'
                  ]
               },
               {
                  area: 'Live operations',
                  points: [
                     'Request status streams over SignalR (pending → payment → processing → completed), with reprocessing for failures and reversals that need HOP approval.',
                     'Reports for transactions, payments, receipts and further processing, and a branch dashboard.'
                  ]
               },
               {
                  area: 'Delivery',
                  points: [
                     'Named Sprint Champion by Zenith\'s PMO in back-to-back sprints (March 2023) as the Data-Store app joined the Admin and Teller apps.'
                  ]
               }
            ],
            images: [
               '/assets/img/xpath-payments.png',
               '/assets/img/xpath-deposits.png',
               '/assets/img/xpath-payments-memo.png',
               '/assets/img/xpath-merchants.png',
               '/assets/img/xpath-dashboard.png'
            ],
            isHovered: false,
            stats: [
               { value: '19→69%', label: 'Sprint Completion' },
               { value: '350', label: 'Branches' },
               { value: '3', label: 'Apps' },
               { value: '70%', label: 'Faster Onboarding' }
            ],
            pipelineLabel: 'Collection Workflow',
            pipeline: [
               { name: 'Merchant Onboarding', meta: 'Self-service ERP config · automated connectivity' },
               { name: 'Collection Setup', meta: 'Branch assignment · product mapping · fee config' },
               { name: 'Payment Capture', meta: 'Cash · cheque · transfer · POS · amount match' },
               { name: 'Reconciliation', meta: 'Auto-match payment events to ERP records' },
               { name: 'ERP Sync', meta: 'Payment events posted to the merchant\'s records' }
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
            description: 'Akhigbe Iruobe built a production-grade, 7-route Angular 19 portal guiding LogicBank customers through a self-service Identity Document Update flow — NDPR consent, OTP-verified account lookup, identity document upload with drag-and-drop, and a sequential 4-modal submission process — without requiring a branch visit.',
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
            description: 'Akhigbe Iruobe built an Angular 19 SPA that fully satisfies every required deliverable of the Naologic brief and implements all 11 listed bonus features — including localStorage persistence, inactivity detection, keyboard navigation, a "Today" jump button, and a Webpack → esbuild migration that achieved a 10.6× cold build improvement.',
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
            description: 'Akhigbe Iruobe built a pixel-perfect, zero-JavaScript books UI component from a Figma spec, demonstrating a custom SCSS token system, strict BEM naming, and a mobile-first responsive architecture spanning eight breakpoints.',
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