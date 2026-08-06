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
];