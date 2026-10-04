import { Injectable } from "@angular/core";

/**
 * One rung of the skills ladder. Tiers replace the old 0–100% bars: a
 * percentage invites "what does 95% of Angular mean?", a tier is a claim an
 * interviewer can test and the CV can defend.
 */
export interface SkillTier {
   tier: 'Expert' | 'Proficient' | 'Working' | 'AI-augmented delivery';
   skills: string[];
   /** One line of evidence or context shown under the tier. */
   note?: string;
}

export interface Job {
   company: string;
   role: string;
   period: string;
   location: string;
   description?: string;
   achievements?: string[];
   technicalAchievements?: string[];
   technicalLeadership?: string[];
}

export interface Course {
   title: string;
   institution: string;
   period: string;
}

/** Referees are named, never contacted through the CV: their emails and
 *  phone numbers are theirs to share, so they are not stored here at all. */
export interface Reference {
   name: string;
   company: string;
}

export interface Profile {
   paragraphs: string[];
   availability: string;
}

// Content rules for this file (agreed with Akhigbe, 2026-10-04):
// - Every figure must be one he can defend in an interview: verified in the
//   repos (776 tests, 83 days, 15 desks, 14 rules), shown on the portfolio's
//   project cards, or backed by his own public proof (the Zenith PMO sprint
//   slides on LinkedIn: velocity 8 → 28, completion 19% → 69%, never 85%).
// - 2026 work was team work (seven-person team); never "solo" or "end to end".
// - CAP: Retail module only in production; no committee voting. Fraud: no
//   real-time streaming. Import: no SWIFT/LC/BC/FX-rate features.
// - Promotions are shown as separate roles under one company: they matter.
// - Zenith-period bullets only describe work dated inside Dec 2022 – Feb 2024
//   in the repos' history.
@Injectable({
   providedIn: 'root'
})
export class ResumeDataService {

   getProfile(): Profile {
      return {
         paragraphs: [
            "Senior frontend engineer with 9+ years building the systems Nigerian banks run on: credit approval, fraud monitoring, trade finance and NIP/NEFT/NAPS payments. Angular specialist (v4 to v22) who leads the frontend inside cross-functional delivery teams — architecture, written standards, code review and mentoring, from kickoff to CAB approval.",
            "I build with an AI-augmented workflow: Claude Opus 5.5 and Fable 5.1 through Claude Code and MCP, held to written standards (CLAUDE.md constitutions plus architecture, security and audit docs) so speed never costs quality. On Globus Trade Export it helped our seven-person team go from an empty repository to final UAT in 83 days, with 776 Vitest tests and npm audit at 0 — and it lets me ship production features in React, Next.js and Vue at pace."
         ],
         availability: "Based in Lagos, Nigeria — open to Senior Frontend Engineer and Tech Lead roles in the UK, US, Canada and worldwide. Remote-ready and willing to relocate."
      };
   }

   getSkills(): SkillTier[] {
      return [
         {
            tier: 'Expert',
            skills: [
               'Angular v4–v22 (Signals, standalone, control flow, SSR)',
               'TypeScript',
               'RxJS',
               'NgRx Signal Store · NgRx · NGXS',
               'Frontend architecture & design systems',
               'Vitest · Jasmine/Karma · Playwright',
               'Web security (OWASP) & dependency audits',
               'Performance & Core Web Vitals',
               'HTML5 · CSS3/SCSS · accessible, responsive UI',
               'Code review, mentoring & merge protocols'
            ]
         },
         {
            tier: 'Proficient',
            skills: [
               'React',
               'Next.js',
               'Angular Material · Bootstrap · Tailwind',
               'REST contracts (Postman, Swagger)',
               'CI/CD: Azure DevOps · Jenkins · Netlify'
            ]
         },
         {
            tier: 'Working',
            skills: ['Vue.js', 'Node.js / TypeScript APIs', 'AWS (S3, SNS, SQS)']
         },
         {
            tier: 'AI-augmented delivery',
            skills: ['Claude Opus 5.5 & Fable 5.1', 'Claude Code · MCP · agent skills', 'CLAUDE.md repo constitutions'],
            note: 'Scaffold and ship in any framework at speed, with tests and audits as the gate.'
         }
      ];
   }

   getTechWatching(): string[] {
      return ['Zoneless Angular & Signal Forms', 'MCP & agentic tooling', 'Playwright / Vitest', 'ml5.js', 'Edge computing'];
   }

   getKeyTechnicalAchievements(): string[] {
      return [
         "🏦 **Two platforms through CAB**: Led the frontend of Credit Approval (CAP) and Trade Export (NXP) at Globus Bank in a seven-person team; both roll out to production in October 2026.",
         "⚡ **Empty repo to UAT in 83 days**: Trade Export, 10 July to 1 October 2026 — signals-first Angular 21, 776 Vitest tests and npm audit at 0, built with an AI-augmented workflow held to written standards.",
         "🛡️ **Fraud at full coverage**: As sole frontend engineer on the Fraud Management System — 100% of bank transactions monitored in week one; fraudulent incidents down 45% within 90 days.",
         "💸 **Payments at national scale**: Domestic Transfer project at Zenith Bank (NIP, NEFT, NAPS) processed ₦100B+ in its first week live, with zero downtime.",
         "🏆 **Back-to-back Sprint Champion**: Named highest achiever by Zenith's PMO in Sprints 3 and 4 (March 2023); in Sprint 4 the team's velocity rose from 8 to 28 points and completion from 19% to 69%.",
         "🚀 **Promoted at two banks**: Senior Frontend Engineer → Frontend Team Lead at Zenith (April 2023), and a grade promotion at Globus (January 2026)."
      ];
   }

   getEmploymentHistory(): Job[] {
      return [
         {
            company: "Globus Bank Plc",
            role: "Senior Frontend Engineer (A.B.O grade)",
            period: "Jan 2026 — Present",
            location: "Victoria Island, Lagos",
            description: "Promoted to the A.B.O grade in January 2026. The senior frontend engineer in a seven-person delivery team — a second frontend engineer, two senior backend engineers, a project manager, a product owner and a QA tester — shipping the bank's credit and trade-finance platforms.",
            achievements: [
               "Led the frontend of Globus Trade Export (NXP) from an empty repository on 10 July 2026: live API integration from 18 August, two stakeholder walkthroughs in September, final UAT on 1 October and business CAB approval for October rollout.",
               "Owned the Export domain's frontend — 13 routed pages, 3 data services and 40+ endpoints: NXP applications, the NESS levy payment (a customer-account debit gated on a resolved lookup, an unpaid levy and the SHIPMENT stage), repatriation of export proceeds within a ±10% tolerance band, and cancellation and closure.",
               "Took CAP's Retail module through business CAB for October 2026: origination, a 15-desk approval chain from Account Officer to the MCC and BCC committees, and the post-approval disbursement and deferral workflows. (Corporate is paused at ~10% since the team moved to Trade Export.)",
               "Led CAP's Disbursement workflow: multiple drawdowns per facility validated against the undrawn balance, a By Facility / By Request queue, COO and CPO approval with live loan-booking status, currency-aware screens with SOFR base-rate resolution, VAT and fee calculations, vendor account-name verification and the matching Deferral flows.",
               "Built the approval journey with the backend team: role-based queues and landing routes for all 15 desks, Approve / Return-to-any-lower-desk / Reject with comments, the MD's offer-letter decision, a 48-hour SLA flag, and the 17-desk disbursement and 8-desk deferral chains that open after approval."
            ],
            technicalAchievements: [
               "Set Trade Export up signals-first on Angular 21 — standalone components with zero NgModules, an NgRx Signal Store for session and roles, httpResource reads and OnPush throughout — moved its tests from Karma to Vitest (776 passing), held npm audit at 0 across dev and production trees, and maintained 42 documented patches to the bank's web-component design system.",
               "Drove CAP's Angular 19 → 20 migration to fully signal-based contracts (input(), output(), viewChild(), linkedSignal(), resource()), resolved the Vite 7 incompatibility that had taken down the team's dev server, cleared 83 compiler warnings and scripted a -webkit-backdrop-filter fix across 202 CSS and HTML files.",
               "Run an AI-augmented workflow — Claude Opus 5.5 and Fable 5.1 through Claude Code and MCP — governed by repo constitutions: Trade Export's CLAUDE.md routes the agent through 4,100+ lines of Angular, architecture, security, merge and audit standards, plus a verify skill that drives the real app with Playwright against mocked APIs."
            ],
            technicalLeadership: [
               "Wrote and maintain the team's Angular standards and branch-merge protocol; every integration goes through it, and I review every merge into the working branch.",
               "Mentor the second frontend engineer on modern Angular — standalone components, @if/@for control flow, inject() and signal architecture — and work with the PM, PO and QA through walkthroughs, UAT and CAB."
            ]
         },
         {
            company: "Globus Bank Plc",
            role: "Senior Frontend Engineer (S.E.A grade)",
            period: "Feb 2024 — Dec 2025",
            location: "Victoria Island, Lagos",
            description: "Sole frontend engineer on the bank's fraud-monitoring and import trade-finance platforms, then founding frontend architect of the Credit Approval Process.",
            achievements: [
               "Built the Fraud Management System frontend as its sole engineer: transactions scored against 14 weighted rules (SIM swap, PIN and device changes, velocity, unusual amounts and hours, high-risk IPs, watch-listed BVNs), PND/lien restriction with customer call-back review, and maker-checker approval — 100% transaction coverage in week one, fraudulent incidents down 45% within 90 days.",
               "Delivered the Globus Trade Application (Import) as its sole frontend engineer: Form M processing with an FX-validity gate, shipping documents reviewed by bill of lading (Advanced and Negotiating sets against a 13-document checklist), ECD and PAAR review, amendments, extensions and cancellation with fees, and release to a verified recipient — adopted by the whole trade-operations team within six months.",
               "Founded CAP's frontend in July 2025 with a second engineer: four facility tracks (Retail, Corporate, Staff Loan, Product Program) on one signal-based form engine, the 15-desk sequential approval routing, and the origination checks — AML screening against PEP, Sanction and AMC lists with fuzzy-match scores, and credit-bureau reports from FirstCentral, CreditRegistry and CBN CRMS.",
               "Contributed with a second engineer to the NRBVN (Non-Resident BVN) reviewer, authoriser and customer portals and to Pay-with-Transfer on POS."
            ],
            technicalAchievements: [
               "Upgraded Trade Import from Angular 16 to 19 one major at a time, with a production security report showing zero vulnerabilities in the production bundle, and hardened session handling by keeping sensitive data in memory and only auth tokens in sessionStorage.",
               "Designed CAP's section-scoped comment system, shared by all three workflow stages: a context service tracking section, entity type and indices, and a single RxJS composition that normalises, transforms and formats every section's comments.",
               "Built the fraud dashboards with AG Charts (inflow vs outflow trends, channel analysis, per-transaction risk scores) and a reusable component layer shared by the Fraud and Import apps."
            ]
         },
         {
            company: "HiedBerg LTD",
            role: "Senior Angular Engineer & Tech Lead (Contract)",
            period: "Jun 2024 — Sept 2024",
            location: "United Kingdom (Remote)",
            description: "Remote contract with a UK company building COSTAFF, an AI digital-worker platform for enterprise clients across the Middle East.",
            achievements: [
               "Led the Angular frontend and coordinated 6 frontend developers across the product: an AI email assistant on Gmail (summaries and suggested replies), an AI scheduling agent on Google Calendar, tasks, bookings, documents, invoicing and analytics.",
               "The scheduling agent protects focus time and moves flexible meetings to resolve conflicts, cutting calendar-management time by 85% for client teams.",
               "Built the onboarding and account lifecycle — sign-up, activation, password recovery — and the transactional email templates (welcome, verification, profile completion, re-engagement)."
            ],
            technicalAchievements: [
               "Angular 16 with NGXS state, Angular Material and rich AI replies rendered through ngx-markdown and ngx-quill, integrated with the Python AI services behind the agents.",
               "Set the team's coding standards and a shared component library used across every product area."
            ]
         },
         {
            company: "Zenith Bank PLC",
            role: "Frontend Team Lead",
            period: "Apr 2023 — Feb 2024",
            location: "Victoria Island, Lagos",
            description: "Promoted to Frontend Team Lead in April 2023, weeks after back-to-back Sprint Champion awards. Led 6 frontend engineers across the bank's payments and collections platforms.",
            achievements: [
               "Led the frontend of ProjectTiger, the Domestic Transfer platform: teller payment processing for NIP, NEFT and NAPS with sender balance and limit checks, name enquiry and approval queues — ₦100B+ processed in its first week live, with zero downtime.",
               "Led X-Path, the merchant-collections suite (Admin, Teller and Data-Store apps) used across 350 branches: collections against merchant-defined custom fields and memo pop-ups, cash and cheque withdrawals, PTA/BTA payments, inbound IMTO transfers, HOP approval and reversals, reprocessing, and receipt and payment reports.",
               "Self-service merchant configuration made merchant onboarding 70% faster.",
               "Delivered the Zenith Tax Clearance System as its sole frontend engineer."
            ],
            technicalLeadership: [
               "Ran weekly architecture reviews with design, QA and business; set the team's coding standards and Jenkins pipelines; mentored through code review and pair programming."
            ]
         },
         {
            company: "Zenith Bank PLC",
            role: "Senior Frontend Engineer",
            period: "Dec 2022 — Apr 2023",
            location: "Victoria Island, Lagos",
            description: "Joined the X-Path (Zeth) core-banking programme as a senior Angular engineer on the Admin and Teller apps.",
            achievements: [
               "Named Sprint Champion — the PMO's highest achiever — in back-to-back sprints in March 2023: Sprint 3 outright and Sprint 4 jointly, at an 87.5% personal completion rate.",
               "In Sprint 3 I took over a departing colleague's tasks so the team's estimate held; in Sprint 4 the team's velocity rose from 8 to 28 points, average velocity from 11.06 to 15.26 and completion from 19% to 69%.",
               "Built Teller flows on Angular 14 with NGXS and live transaction status over SignalR, as the Data-Store app joined the Admin and Teller apps."
            ]
         },
         {
            company: "Samsky Pay UK",
            role: "Senior Frontend Engineer",
            period: "Feb 2022 — Dec 2022",
            location: "London, United Kingdom",
            achievements: [
               "Built the Samsky Pay web app for multi-currency conversion and payments: live exchange rates for all supported currencies, a wallet for deposits and transfers, and the admin panel.",
               "Integrated the RemitOne payments API and AWS services (SNS, SQS, S3).",
               "Set up Jenkins CI with Selenium end-to-end tests."
            ]
         },
         {
            company: "Upperlink Limited",
            role: "Frontend Engineer (Mid-level → Senior)",
            period: "Jun 2018 — Feb 2022",
            location: "Alausa, Lagos",
            description: "Grew from mid-level to senior engineer, leading development and QA on bank and government payment channels.",
            achievements: [
               "Built and tested payment flows for internet-banking, USSD and branch channels, onboarding 180+ merchants and billers and cutting integration time from two weeks to three days.",
               "Led testing for the NIBSS GSI and EbillsPay integrations, with Selenium suites running in Jenkins CI.",
               "Mentored 4 junior developers who progressed to mid-level roles."
            ]
         }
      ];
   }

   getCourses(): Course[] {
      return [
         {
            title: "Secure Coding Certificate",
            institution: "IT Stack",
            period: "May 2024"
         },
         {
            title: "Angular, HTML, CSS, Frontend, AGILE Assessment",
            institution: "LinkedIn",
            period: "May 2022 — Present"
         },
         {
            title: "Certificate of Language Ability",
            institution: "Emmersion",
            period: "Jun 2022 — Oct 2022"
         },
         {
            title: "HTML5, CSS, Pluralsight Certification",
            institution: "Pluralsight",
            period: "Nov 2019"
         }
      ];
   }

   getReferences(): Reference[] {
      return [
         { name: "Mr. Folarin Fambegbe", company: "Golden Scepter Ltd" },
         { name: "Jibril Abdulkadir", company: "Field Intelligence Inc" },
         { name: "Joseph Adeyemi", company: "Zenith Bank Plc (Team Lead)" },
         { name: "Faith Joseph", company: "Olohie Virtual" },
         { name: "Ekenedirichukwu Amaechi", company: "INITS Limited" }
      ];
   }
}
