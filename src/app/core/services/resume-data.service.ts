import { Injectable } from "@angular/core";

interface Skill {
   name: string;
   level: number;
}

interface KeyAchievement {
   description: string;
   icon?: string;
}

interface Job {
   company: string;
   role: string;
   period: string;
   location: string;
   description?: string;
   achievements?: string[];
   technicalAchievements?: string[];
   technicalLeadership?: string[];
}

interface Course {
   title: string;
   institution: string;
   period: string;
}

interface Reference {
   name: string;
   company: string;
   email: string;
   phone: string;
}


@Injectable({
   providedIn: 'root'
})
export class ResumeDataService {

   // getSkills(): Skill[] {
   //    return [
   //       { name: "Git version Control, Node Package Modules(npm)", level: 100 },
   //       { name: "Angular 4 - 16 & TypeScript", level: 95 },
   //       { name: "Angular State Management with NGXS Store", level: 100 },
   //       { name: "HTML5 & CSS3", level: 100 },
   //       { name: "Javascript & jQuery", level: 95 },
   //       { name: "Tailwind CSS & Bootstrap", level: 95 },
   //       { name: "JS Reactive Programming, RXJS libraries", level: 100 },
   //       { name: "Jenkins & Postman & MySQL & JMeter", level: 100 },
   //       { name: "Angular Unit testing with Jest, TDD, BDD", level: 95 },
   //       { name: "AWS, Continuous Integration/CD, Azure, Selenium", level: 100 },
   //       { name: "PHP & Laravel Framework", level: 95 },
   //       { name: "Browser Dev Tools & Responsive UI Components", level: 95 },
   //       { name: "Consuming APIs from NodeJs, C#/DotNet, PHP, Java", level: 100 }
   //    ];
   // }
   // Updated getSkills() method in ResumeDataService
   // This strategic reorganization leads with leadership capabilities - the highest value for senior roles

   getSkills(): Skill[] {
      return [
         // CORE ANGULAR & TYPESCRIPT
         { name: "Angular 17/18/19/20 (Standalone Components, Signals, Control Flow)", level: 95 },
         { name: "Angular Signals, Computed Signals & Effect API", level: 95 },
         { name: "TypeScript 5.x Advanced Patterns & ES2024+", level: 95 },
         { name: "Angular State Management (NgRx, NGXS, Signal Store)", level: 100 },
         { name: "RxJS Reactive Programming & Observables", level: 100 },
         { name: "Angular Reactive Forms, Template-driven Forms & Custom Validators", level: 95 },
         { name: "Angular Router, Route Guards, Resolvers & Lazy Loading", level: 95 },
         { name: "Angular Defer Loading, @if/@for/@switch Control Flow", level: 95 },
         { name: "Angular Universal (SSR), Hydration & Progressive Web Apps", level: 90 },

         // CORE TECHNOLOGIES
         { name: "HTML5, CSS3 & CSS preprocessors (SASS/SCSS) + Responsive Design", level: 100 },
         { name: "JavaScript ES2024+ & Modern JS APIs", level: 95 },
         { name: "Tailwind CSS, Bootstrap & UI Component Libraries", level: 95 },
         { name: "Ng-Zorro, Ng-Bootstrap, PrimeNG & Angular Material", level: 90 },
         { name: "Translating Figma/Adobe design mockups into functional applications", level: 99 },

         // ARCHITECTURE & PERFORMANCE
         { name: "Frontend Architecture & System Design", level: 95 },
         { name: "Complex Data Flow Architecture", level: 95 },
         { name: "Performance Optimization & Core Web Vitals", level: 95 },
         { name: "Bundle Analysis, Tree Shaking & Lazy Loading Strategies", level: 95 },
         { name: "Secure Coding Practices & OWASP Compliance", level: 100 },

         // TESTING & QUALITY
         { name: "Test-Driven Development (TDD) & BDD", level: 95 },
         { name: "Angular Unit Testing (Jest, Jasmine, Karma, Vitest)", level: 95 },
         { name: "End-to-End Testing (Cypress, Playwright, Selenium)", level: 100 },

         // DEVOPS & INTEGRATION
         { name: "RESTful APIs, GraphQL & Microservices Integration", level: 100 },
         { name: "Angular HttpClient, Interceptors & HTTP State Management", level: 100 },
         { name: "Payment Gateway Integration & Financial APIs", level: 100 },
         { name: "CI/CD Pipeline Design & Management (Jenkins, GitHub Actions)", level: 100 },
         { name: "JavaScript Build Tooling (Webpack, Vite, esbuild, Gulp)", level: 90 },
         { name: "AWS Cloud Services & Deployment Strategy", level: 95 },
         { name: "Azure DevOps Management", level: 90 },
         { name: "Git version Control, Node Package Modules (npm, pnpm)", level: 100 },

         // LEADERSHIP (last)
         { name: "Technical Team Leadership & Mentoring (6+ Engineers)", level: 100 },
         { name: "Code Review Processes & Quality Assurance", level: 100 },
         { name: "Cross-functional Collaboration & Stakeholder Management", level: 100 }
      ];
   }

   getKeyTechnicalAchievements(): string[] {
      return [
         "🏗️ **Architectural Leadership**: Partnered in technical and product design reviews to shape Zenith Bank's frontend solution (X-PATH, Tax Clearance, Domestic Transfer), and also actively participated in the design and review process of 5 mission-critical banking applications at Globus Bank (Trade Finance, Pay-with-Transfer On POS, Anti-Fraud Management, NRBVN (Non Resident Bank Verification Number), Credit Approval Portal), enabling independent team deployment and reducing inter-team dependencies by 70%.",

         "👥 **Team Leadership & Mentoring**: Led and mentored 6+ frontend engineers across multiple projects, establishing code review processes that improved code quality by 35% and team velocity by 45%, resulting in 3 team promotions",

         "🚀 **Angular Migration Excellence**: Led Angular v16→v19 migrations implementing hybrid security enhancements (in-memory + sessionStorage), eliminating 11 vulnerabilities per application to zero production vulnerabilities with 40% performance improvements",

         "🎯 **Business Impact**: Architected real-time fraud detection system processing all bank transactions, achieving 100% coverage within first week of deployment and reducing fraudulent activities by 45%"
      ];
   }

   getEmploymentHistory(): Job[] {
      return [
         {
            company: "Globus Bank Plc",
            role: "Senior Frontend Engineer - Grade (A.B.O)",
            period: "Jan 2026 — Present",
            location: "Victoria Island",
            description: "Promoted to Associate Designate grade, leading the architectural evolution of the Credit Approval Process (CAP) platform — Globus Bank's CBN-compliant credit lifecycle automation system covering four facility modules, a two-stage committee governance engine, and full disbursement and deferral workflows across 10+ approval roles.",

            technicalLeadership: [
               "Collaborated and Lead Designs, architecture and delivery of CAP across its full lifecycle: 190+ standalone Angular 20 components, 26 reusable shared components, 48 services, and 20 lazy-loaded routes — supporting four facility module tracks (Retail, Corporate, Staff Loan, Product Program) and three workflow stages (Facility Approval, Disbursement, Deferral)",
               "Drive Angular v19 → v20 migration across the entire codebase, adopting fully signal-based component contracts (input(), output(), viewChild(), linkedSignal(), resource()) and eliminating NgModules — including resolving a critical Vite 6/7 API incompatibility that caused complete dev-server failure blocking the team",
               "Own engineering standards across a two-team parallel development model (AIBranch + EIBranch): authored and maintain ANGULAR-20-STANDARDS.md and the EIBranch Merge Protocol, governing code quality, component contracts, signal graph discipline, and conflict resolution rules for all contributors",
               "Mentor development team on modern Angular patterns — standalone components, @if/@for control flow, inject() dependency injection, and reactive signal architecture — conducting code reviews and establishing quality gates that govern every merge into the working branch"
            ],

            achievements: [
               "Own end-to-end delivery of the Credit Approval Process platform — digitising Globus Bank's complete credit lifecycle from account officer origination through multi-tier business approval, two-stage committee governance (MCC and BCC), and post-approval disbursement and deferral workflows for all retail, corporate, staff, and product program facilities",
               "Implemented two-stage approval committee engine: Stage 1 MCC workflow with configurable online/offline deliberation mode, per-member vote capture, real-time Yes/No vote count compilation, and MD/CEO veto power toggled by admin; Stage 2 BCC workflow for ₦100M+ facilities with board-level majority vote, tied-vote re-trigger, and system-automated disbursement module unlock on approval",
               "Integrated automated background checks at origination: PEP and blacklisted BVN screening via third-party API, CRC/Credit Registry API for live credit score and report retrieval, director-related account flagging, and collateral management notification — all triggered by the system before the request enters the approval chain, replacing manual compliance steps",
               "Delivered a full admin control plane enabling Admin Officers to edit process flows, define approval paths, set facility limits per approver, manage custom form tabs by facility type, configure escalation paths and user notifications, and override insufficient-fund blocks with justification — with all admin actions requiring dual-authorisation approval from the Admin Authorizer role",
               "Led Angular 20 migration and resolved Vite 7 compatibility breakage restoring full dev-server operation; eliminated 83 Problems-tab warnings across the codebase; authored automated Python script patching -webkit-backdrop-filter compliance across 202 CSS and HTML files project-wide"
            ],

            technicalAchievements: [
               "Architected four parallel facility module tracks on a unified signal-based form engine — each track with its own multi-step stepper, document compliance gates, section-level validation, and track-specific governance review stages — sharing a single set of base components and services with zero code duplication across tracks",
               "Encoded the full 10+ role sequential approval chain into Angular routing and UI state: Business Approval Flow (RM → BM → BFGH → ZH → GH), Governance Review Flow (CRM Officer → CRM Approver → E&S → Head Risk Mgt → ED → ED Risk → MD/CEO), and Committee Stage (MCC Secretariat → MCC Members → MD veto → BCC Chairman → BCC Directors) — with lazy-loaded isolated layout shells and role-normalizing auth guard per persona",
               "Designed a two-service section-scoped comment system used across all three workflow stages: CommentContextService (BehaviorSubject tracking section name, RequestEntityType enum — Facility/Disbursement/Deferral — parent tab index, inner section, disbursement ID and index) paired with CommentManagementService (loadAndTransformCommentsBySection() — a single RxJS Observable composition method handling API response normalisation, code 00/01 branching, GbCommentFormat transformation, name extraction from email, and date formatting) consumed by every child section with zero boilerplate duplication",
               "Built full admin control plane for five operator personas (Admin Officer, Admin Authorizer, Profile Manager/Internal Control, Application Manager, Internal Audit Officer) — covering process flow editing, user lifecycle management from Active Directory, approval path configuration, facility type and custom tab management, veto power toggling, and report generation filtered by date, branch, unit, facility type, and status",
               "Applied npm override strategy to pin security-sensitive transitive dependencies (esbuild, ws, postcss, serialize-javascript) with documented InfoSec risk assessment for audit compliance; maintained zero production vulnerabilities across the Angular 20 codebase"
            ]
         },
         {
            company: "Globus Bank Plc",
            role: "Senior Frontend Engineer - Grade (S.E.A)",
            period: "Feb 2024 — Dec 2025",
            location: "Victoria Island",
            description: "Led enterprise application development while establishing engineering excellence and mentoring development teams across mission-critical banking systems serving 100,000+ daily users.",

            technicalLeadership: [
               "Architected three mission-critical enterprise banking applications (Fraud Management, Trade Finance, Credit Approval Portal)",
               "Led Angular v16→v19 migrations achieving zero production vulnerabilities & 40% performance improvements",
               "Established technical standards & best practices across frontend development teams",
               "Mentored junior & mid-level developers through code reviews and pair programming"
            ],

            achievements: [
               "Delivered real-time Fraud Management System processing all bank transactions, achieving 100% coverage within first week of deployment",
               "Led Angular v16→v19 migration implementing hybrid security architecture, eliminating 11 vulnerabilities to zero",
               "Delivered Globus Trade Application achieving 100% adoption by trade operations team, reducing processing time by 60%",
               "Architected Credit Approval Portal managing end-to-end credit facility lifecycle with multi-step approval workflows"
            ],

            technicalAchievements: [
               "Designed hybrid security enhancements separating sensitive data into in-memory storage while maintaining auth tokens in sessionStorage",
               "Architected fraud detection system with 14 configurable rule engines covering customer behavioral patterns and transaction monitoring",
               "Built advanced dashboards with real-time visualization of transaction patterns, risk scoring, and alert management",
               "Created reusable component library reducing development time by 40% across all three applications",
               "Architected Credit Approval Portal from inception: designed the four-module (Retail, Corporate, Staff Loan, Product Program) multi-track form engine, the 10+ role sequential approval routing system, section-scoped comment architecture, and automated background check integration (PEP/BVN, CRC API, director flagging)",
               "Built MCC committee voting engine: online/offline deliberation modes, per-member vote capture, Yes/No vote count compilation, MD/CEO configurable veto power, and BCC escalation routing for facilities above ₦100M with majority-vote resolution and tied-result re-vote trigger"
            ]
         },
         {
            company: "HiedBerg LTD",
            role: "Senior Angular Engineer & Technical Lead (Contract)",
            period: "Jun 2024 — Sept 2024",
            location: "United Kingdom (Remote)",
            description: "Remote UK contract engagement building COSTAFF, an innovative AI Digital Worker Application, while collaborating with a frontend team to deliver enterprise-grade solutions.",

            technicalLeadership: [
               "Mentored and coordinated 6 frontend developers, improving team velocity by 45% through technical guidance",
               "Established coding standards and created modular component library reducing development time by 50%",
               "Implemented automated testing achieving 90% code coverage & reduced deployment cycles to 2 days"
            ],

            achievements: [
               "Architected & launched COSTAFF AI Digital Worker Platform serving enterprise clients across Middle East",
               "Led development of AI-powered productivity suite achieving 85% reduction in calendar management time",
               "Deployed automated invoice generation processing 10,000+ invoices monthly with 99.9% accuracy",
               "Integrated multilingual support covering 8 Middle Eastern languages, expanding market reach by 40%"
            ],

            technicalAchievements: [
               "Designed scalable architecture supporting 100,000+ concurrent users with sub-second response times",
               "Implemented real-time document processing handling 50,000+ documents daily",
               "Achieved 99.9% system availability through robust error handling & monitoring",
               "Reduced application load time by 65% through lazy loading & code splitting"
            ]
         },
         {
            company: "Zenith Bank PLC",
            role: "Frontend Team Lead",
            period: "Apr 2023 — Feb 2024",
            location: "Victoria Island, Lagos State",
            description: "Partnered with and mentored a cross-functional frontend team of 6+ engineers while architecting mission-critical enterprise banking applications and facilitating architectural decision-making.",

            technicalLeadership: [
               "Guided and mentored a frontend development team of 8 engineers, establishing coding standards that improved code quality by 35%",
               "Facilitated weekly architectural review meetings with cross-functional teams including designers, developers, QA, & business managers",
               "Established CI/CD pipelines using Jenkins achieving 99.2% successful build rate and seamless deployments",
               "Mentored junior developers through pair programming, resulting in 3 team promotions and 40% faster feature delivery"
            ],

            achievements: [
               "Architected & delivered Domestic Transfer System processing billions in transactions within first week of deployment",
               "Led ProjectTiger payment system development, reducing transaction processing time by 70% with 90% positive user feedback",
               "Improved team sprint completion rates from 19% to 85% and velocity from 8 to 28 story points per sprint",
               "Reduced merchant onboarding time by 70% through dynamic integration platform design"
            ],

            technicalAchievements: [
               "Collaborated on the architecture of a couple of scalable frontend solutions (X-path Admin, X-path Teller, X-path Data-Store, Tax Clearance, Domestic Transfer) serving 100,000+ daily banking customers",
               "Implemented Angular Universal for SSR improving load times by 40% and SEO performance by 60%",
               "Designed reusable component library reducing development time across projects by 60%+",
               "Maintained 99.9% application uptime with comprehensive error handling and monitoring"
            ]
         },
         {
            company: "Zenith Bank PLC",
            role: "Senior Frontend Engineer",
            period: "Dec 2022 — Apr 2023",
            location: "Victoria Island, Lagos State",
            description: "Developed core banking applications and established technical foundations for enterprise-scale frontend architecture.",

            achievements: [
               "Partnered and Collaborated in Design sessions and implemented XPATH Core Banking System architecture achieving 90% completion with zero security incidents",
               "Integrated with 15+ banking APIs while maintaining PCI DSS compliance and real-time transaction monitoring",
               "Implemented progressive web app (PWA) capabilities increasing mobile user engagement by 45%",
               "Achieved 90%+ code coverage through comprehensive testing strategies reducing production bugs by 50%"
            ],

            technicalAchievements: [
               "Led implementation of lazy loading and performance optimization achieving sub-2-second page load times",
               "Drove adoption of secure coding practices following OWASP guidelines with zero security vulnerabilities",
               "Built foundation for micro-frontend architecture enabling independent team deployment",
               "Established automated testing framework using Jasmine and Karma for unit and integration tests"
            ]
         },
         {
            company: "Samsky Pay UK",
            role: "Senior Frontend Engineer",
            period: "Feb 2022 — Dec 2022",
            location: "London, United Kingdom",
            description: "Developed and maintained the Samsky Pay Application for currency conversion and payments in the UK.",
            achievements: [
               "Built complete Samsky-Pay Payment Application with accurate exchange rates for all currencies",
               "Developed secure wallet service for deposits/transfers with comprehensive admin panel",
               "Integrated RemitOne(UK) payment APIs achieving 99.9% uptime"
            ],
            technicalAchievements: [
               "Configured Jenkins CI/CD pipeline with Selenium E2E testing achieving 95% automation coverage",
               "Integrated AWS services (SNS, SQS, S3) for enhanced functionality"
            ]
         },
         {
            company: "Upperlink Limited",
            role: "Frontend Engineer",
            period: "Jun 2018 — Feb 2022",
            location: "Alausa, Lagos State",
            description: "Progressed from Mid-level to Senior Engineer while leading development and QA for mission-critical financial applications.",
            achievements: [
               "Onboarded and tested 180+ merchants/billers with 100% compliance, reducing integration time from 2 weeks to 3 days",
               "Achieved 99.9% uptime for payment processing across multiple channels (Internet Banking, USSD, branches)",
               "Integrated with 15+ banking APIs maintaining PCI DSS compliance with sub-2-second transaction processing"
            ],
            technicalAchievements: [
               "Led testing for NIBSS GSI and EbillsPay applications, reducing post-deployment issues by 80%",
               "Developed automated test suites using Selenium achieving 90% coverage with Jenkins CI/CD",
               "Validated biometric verification system processing 50,000+ daily transactions with 99.99% accuracy"
            ],
            technicalLeadership: [
               "Led cross-functional teams of 8-12 members across development and QA",
               "Established coding standards improving code quality by 70% with Agile methodologies",
               "Mentored 4 junior developers who progressed to mid-level roles"
            ]
         },
         {
            company: "Golden Scepter Limited",
            role: "ICT & Records Management Intern",
            period: "May 2015 — May 2016",
            location: "Alausa, Lagos State",
            description: "Comprehensive training in document management and web development at Union Bank HQ.",
            achievements: [
               "Trained in document management, fraud control, and electronic archiving with high security standards",
               "Built responsive websites using HTML5, CSS3, JavaScript, and Bootstrap for records management",
               "Handled records retrievals, audits, filing, and implemented disaster recovery protocols",
               "Received Commendation Letter for exceptional performance during contract at Union Bank HQ"
            ]
         }
      ];
   }

   getCourses(): Course[] {
      return [
         {
            title: "Angular (Basic) Certificate",
            institution: "HackerRank",
            period: "Nov 28, 2022"
         },
         {
            title: "Secure Coding Certificate",
            institution: "IT Stack",
            period: "May 20, 2024"
         },
         {
            title: "Certificate of Language Ability",
            institution: "Emmersion",
            period: "Jun 2022 — Oct 2022"
         },
         {
            title: "Angular, HTML, CSS, Frontend, AGILE Assessment",
            institution: "LinkedIn",
            period: "May 2022 — Present"
         },
         {
            title: "HTML5, CSS, Pluralsight Certification",
            institution: "Pluralsight",
            period: "Nov 2019 — Nov 2019"
         }
      ];
   }


   getReferences(): Reference[] {
      return [
         {
            name: "MR. Folarin Fambegbe",
            company: "Golden Scepter Ltd",
            email: "info@goldenscepter.com",
            phone: "+234 803 307 3434"
         },
         {
            name: "Jibril Abdulkadir",
            company: "Field Intelligence Inc",
            email: "jibril.abdulkadir.ja@gmail.com",
            phone: "+234 706 939 7914"
         },
         {
            name: "Joseph Adeyemi",
            company: "Zenith Bank Plc (Team Lead)",
            email: "joseph.adeyemi@zenithbank.com",
            phone: "+234 805 137 5051"
         },
         {
            name: "Faith Joseph",
            company: "Olohie Virtual",
            email: "faithajoke@gmail.com",
            phone: "+234 810 611 7877"
         },
         {
            name: "Ekenedirichukwu Amaechi",
            company: "INITS Limited",
            email: "N/A",
            phone: "+234 703 525 9954"
         }
      ];
   }
}