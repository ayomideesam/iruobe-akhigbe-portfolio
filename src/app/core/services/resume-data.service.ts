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

// Content rules for this file (2026-10-04, agreed with Akhigbe):
// - Every figure must be one he can defend in an interview: verified in the
//   repos (776 tests, 83 days, 15 desks, 14 rules) or the same business
//   outcome the portfolio's project cards already state. No invented % gains.
// - 2026 work was team work (seven-person team); never "solo" or "end to end".
// - CAP: Retail module only in production; no committee voting. Fraud: no
//   real-time streaming. Import: no SWIFT/LC/BC/FX-rate features.
// - Two pages: 4–6 bullets for the current role, 2–4 for the rest.
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
         "🏦 **Two platforms through CAB**: Led the frontend of Credit Approval (CAP) and Trade Export (NXP) at Globus Bank; both roll out to production in October 2026.",
         "⚡ **Empty repo to UAT in 83 days**: Trade Export, 10 July to 1 October 2026 — 776 Vitest tests and npm audit at 0, with an AI-augmented workflow.",
         "🛡️ **Fraud at full coverage**: 100% of bank transactions monitored in week one; fraudulent incidents down 45% within 90 days.",
         "💸 **Payments at national scale**: ProjectTiger at Zenith Bank processed ₦100B+ in its first week live, with zero downtime."
      ];
   }

   getEmploymentHistory(): Job[] {
      return [
         {
            company: "Globus Bank Plc",
            role: "Senior Frontend Engineer",
            period: "Feb 2024 — Present",
            location: "Victoria Island, Lagos",
            description: "The senior frontend engineer in a seven-person delivery team; promoted a grade in January 2026. I set the frontend architecture and standards, review every merge and mentor the second frontend engineer.",
            achievements: [
               "Led the Trade Export (NXP) frontend from an empty repository on 10 July 2026 to final UAT on 1 October and business CAB approval: 13 routed pages and 40+ endpoints for NXP applications, the NESS levy, repatriation and closure — signals-first on Angular 21 with NgRx Signal Store, tests moved to Vitest (776 passing), npm audit held at 0.",
               "Led CAP's frontend architecture with a second engineer: 230+ standalone Angular 20 components, a 15-desk approval chain to the MCC and BCC committees, AML screening and credit-bureau checks (FirstCentral, CreditRegistry, CBN CRMS) at origination, and the disbursement and deferral flows. The Retail module passed CAB for October 2026.",
               "Delivered the Fraud Management System frontend (14 weighted rules, PND/lien restriction, call-back maker-checker review, AG Charts dashboards) and the Trade Import platform (Form M with an FX-validity gate, shipping documents by bill of lading, ECD/PAAR review), adopted by the whole trade-operations team within six months.",
               "Wrote the team's standards — Angular standards, branch-merge protocol, npm-audit policy — and the CLAUDE.md files that make AI agents follow them; drove the Angular 19 → 20 migration across CAP."
            ]
         },
         {
            company: "HiedBerg LTD",
            role: "Senior Angular Engineer & Tech Lead (Contract)",
            period: "Jun 2024 — Sept 2024",
            location: "United Kingdom (Remote)",
            description: "Remote contract with a UK company building COSTAFF, an AI digital-worker platform for enterprise clients across the Middle East.",
            achievements: [
               "Led the Angular frontend and coordinated 6 frontend developers: Gmail, Google Calendar and OpenAI integrations behind an AI email assistant (summaries, suggested replies) and a scheduling agent.",
               "The scheduling agent moves flexible meetings around focus time to resolve conflicts, cutting calendar-management time by 85% for client teams.",
               "Set the team's coding standards and a shared component library on Angular 16 with NGXS."
            ]
         },
         {
            company: "Zenith Bank PLC",
            role: "Frontend Team Lead",
            period: "Dec 2022 — Feb 2024",
            location: "Victoria Island, Lagos",
            description: "Joined as a Senior Frontend Engineer and was promoted to Frontend Team Lead in April 2023, leading 6 frontend engineers across the bank's payments and collections platforms.",
            achievements: [
               "Led the frontend of ProjectTiger, the Domestic Transfer platform for NIP, NEFT and NAPS — teller flows, approval queues, NAPS bulk direct credits and NEFT clearing sessions — which processed ₦100B+ in its first week live with zero downtime.",
               "Led X-Path, a three-app merchant-collections suite (Admin, Teller, Data-Store) used across 350 branches; self-service merchant configuration made onboarding 70% faster.",
               "Delivered the Zenith Tax Clearance System as its sole frontend engineer.",
               "Ran weekly architecture reviews with design, QA and business, set the team's coding standards and Jenkins pipelines, and mentored through code review and pairing."
            ]
         },
         {
            company: "Samsky Pay UK",
            role: "Senior Frontend Engineer",
            period: "Feb 2022 — Dec 2022",
            location: "London, United Kingdom",
            achievements: [
               "Built the Samsky Pay web app for multi-currency conversion and payments: live exchange rates, a wallet for deposits and transfers, and the admin panel.",
               "Integrated the RemitOne payments API and AWS (SNS, SQS, S3), with Jenkins CI and Selenium end-to-end tests."
            ]
         },
         {
            company: "Upperlink Limited",
            role: "Frontend Engineer (Mid-level → Senior)",
            period: "Jun 2018 — Feb 2022",
            location: "Alausa, Lagos",
            achievements: [
               "Built and tested payment flows for internet-banking, USSD and branch channels, onboarding 180+ merchants and billers and cutting integration time from two weeks to three days.",
               "Led testing for the NIBSS GSI and EbillsPay integrations with Selenium suites in Jenkins CI, and mentored 4 junior developers to mid-level."
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
