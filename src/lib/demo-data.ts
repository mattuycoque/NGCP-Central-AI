export type Domain = "finance" | "engineering" | "it-projects";

export type DemoRoleId = "executive" | "finance-analyst" | "planning-engineer" | "it-project-manager";

export type DemoRole = {
  id: DemoRoleId;
  label: string;
  groupName: string;
  description: string;
};

export type DemoSignal = {
  id: string;
  domain: Domain;
  title: string;
  summary: string;
  classification: "Internal" | "Confidential";
  eligibleRoles: DemoRoleId[];
};

export const ROLE_SUGGESTED_QUESTIONS: Record<DemoRoleId, string[]> = {
  executive: [
    "Provide an executive monthly snapshot across finance, planning & engineering, and digital delivery with top metrics and trend direction.",
    "Which portfolio item presents the highest near-term schedule risk, what decision is required, and by what date?",
    "Summarize the FY2026 capital position versus envelope, including the key commitment/cashflow pressure points.",
    "List the top cross-domain decisions for the next 14 days and the expected impact if each is delayed.",
  ],
  "finance-analyst": [
    "Break down the latest variance by package and classify each as timing shift, scope movement, or potential overrun.",
    "Assess procurement commitment concentration risk and identify which milestones require additional evidence before release.",
    "Build a cashflow bridge view from baseline to outturn and highlight the biggest drivers of movement.",
    "Prepare a finance governance note: control gaps, escalation items, and recommended actions before the next review cycle.",
  ],
  "planning-engineer": [
    "Show current stage-gate status by package and identify which dependency is most likely to block the next gate exit.",
    "Summarize the design assurance queue using review IDs, aging, unresolved comments, and required closure actions.",
    "If the North Corridor route decision slips by two weeks, estimate schedule and float impact across affected packages.",
    "Provide a 2-week engineering action plan to protect gate dates for backbone and substation resilience workstreams.",
  ],
  "it-project-manager": [
    "Provide delivery and release health across all digital streams, including RAG status, milestone dates, and blockers.",
    "Give a go/no-go readiness view for the next release with open controls, CAB dependencies, and regression status.",
    "Summarize SCADA uplift and Cyber SOC modernization risks, including the controls needed to stay on plan.",
    "Create a pre-release action checklist for the next 14 days: approvals, test closure, fallback readiness, and ownership.",
  ],
};

export const DOMAINS: Record<Domain, { label: string; accent: string }> = {
  finance: { label: "Finance Monitoring", accent: "coral" },
  engineering: { label: "Planning & Engineering", accent: "teal" },
  "it-projects": { label: "IT Project Monitoring", accent: "gold" },
};

export const DEMO_ROLES: DemoRole[] = [
  {
    id: "executive",
    label: "Executive",
    groupName: "NGCP-CentralAI-Executive",
    description: "Portfolio-level summaries across all demo domains.",
  },
  {
    id: "finance-analyst",
    label: "Finance Analyst",
    groupName: "NGCP-CentralAI-Finance",
    description: "Detailed financial monitoring signals only.",
  },
  {
    id: "planning-engineer",
    label: "Planning Engineer",
    groupName: "NGCP-CentralAI-Engineering",
    description: "Detailed planning and engineering signals only.",
  },
  {
    id: "it-project-manager",
    label: "IT Project Manager",
    groupName: "NGCP-CentralAI-ITProjects",
    description: "Detailed IT project and environment signals only.",
  },
];

export const DEMO_SIGNALS: DemoSignal[] = [
  {
    id: "finance-portfolio",
    domain: "finance",
    title: "Capital program outlook",
    summary: "Portfolio forecast remains within the approved annual envelope, with two work packages flagged for review.",
    classification: "Internal",
    eligibleRoles: ["executive", "finance-analyst"],
  },
  {
    id: "finance-variance",
    domain: "finance",
    title: "Monthly variance watch",
    summary: "Transmission program spend is 3.8% above the monthly plan; review pending supplier milestone evidence.",
    classification: "Confidential",
    eligibleRoles: ["finance-analyst"],
  },
  {
    id: "engineering-portfolio",
    domain: "engineering",
    title: "Network planning portfolio",
    summary: "Three planning packages are on track; one design dependency requires a decision before the next gate.",
    classification: "Internal",
    eligibleRoles: ["executive", "planning-engineer"],
  },
  {
    id: "engineering-design",
    domain: "engineering",
    title: "Design assurance queue",
    summary: "Two design reviews are awaiting technical assurance comments; no safety-critical exception is recorded in this demo data.",
    classification: "Confidential",
    eligibleRoles: ["planning-engineer"],
  },
  {
    id: "it-portfolio",
    domain: "it-projects",
    title: "Digital delivery portfolio",
    summary: "Four active delivery streams are green, with one staging release awaiting change approval.",
    classification: "Internal",
    eligibleRoles: ["executive", "it-project-manager"],
  },
  {
    id: "it-staging",
    domain: "it-projects",
    title: "Staging release readiness",
    summary: "The integration test environment is available. One regression test remains open before the release candidate can progress.",
    classification: "Confidential",
    eligibleRoles: ["it-project-manager"],
  },
  {
    id: "finance-procurement-heatmap",
    domain: "finance",
    title: "Procurement commitment heatmap",
    summary: "High-value contract commitments are concentrated in three expansion packages, with milestone evidence deadlines inside the current reporting cycle.",
    classification: "Confidential",
    eligibleRoles: ["finance-analyst"],
  },
  {
    id: "finance-cashflow-bridge",
    domain: "finance",
    title: "Capex cashflow bridge",
    summary: "Monthly bridge shows commitment timing shifts across major transmission projects while annual forecast remains within the portfolio envelope.",
    classification: "Internal",
    eligibleRoles: ["executive", "finance-analyst"],
  },
  {
    id: "engineering-backbone-gate",
    domain: "engineering",
    title: "Luzon backbone stage-gate tracker",
    summary: "Backbone reinforcement packages are progressing through option and design-basis gates, with one right-of-way dependency at risk of delay.",
    classification: "Internal",
    eligibleRoles: ["executive", "planning-engineer"],
  },
  {
    id: "engineering-substation-resilience",
    domain: "engineering",
    title: "Substation resilience workstream",
    summary: "Three substation resilience sites are on plan while one site awaits survey clearance that may compress detailed-design float.",
    classification: "Confidential",
    eligibleRoles: ["planning-engineer"],
  },
  {
    id: "it-scada-uplift",
    domain: "it-projects",
    title: "Control center SCADA uplift",
    summary: "SCADA modernization stream is tracking to plan with test and cutover preparation milestones aligned to the next operations window.",
    classification: "Internal",
    eligibleRoles: ["executive", "it-project-manager"],
  },
  {
    id: "it-cyber-soc",
    domain: "it-projects",
    title: "Cyber SOC modernization",
    summary: "SOC modernization has open control integration tasks and a staged go-live sequence tied to change-approval gates.",
    classification: "Confidential",
    eligibleRoles: ["it-project-manager"],
  },
];