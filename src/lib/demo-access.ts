import { DEMO_ROLES, DEMO_SIGNALS, type DemoRole, type DemoRoleId, type DemoSignal, type Domain } from "@/lib/demo-data";

export function getRole(roleId: string): DemoRole | undefined {
  return DEMO_ROLES.find((role) => role.id === roleId);
}

export function getEligibleSignals(roleId: DemoRoleId): DemoSignal[] {
  return DEMO_SIGNALS.filter((signal) => signal.eligibleRoles.includes(roleId));
}

export function getEligibleDomains(roleId: DemoRoleId): Domain[] {
  return [...new Set(getEligibleSignals(roleId).map((signal) => signal.domain))];
}

function getResponseStructure(role: DemoRole): string {
  if (role.id === "executive") {
    return [
      "Respond in Markdown using this exact structure:",
      "## Executive Snapshot",
      "## Cross-Domain Scorecard",
      "- Finance Monitoring",
      "- Planning & Engineering",
      "- IT Project Monitoring",
      "## Top Risks and Decisions Needed This Week",
      "## Recommended Leadership Actions (next 14 days)",
      "Include concrete numbers, dates, and project names when available from sources.",
    ].join("\n");
  }

  if (role.id === "finance-analyst") {
    return [
      "Respond in Markdown using this exact structure:",
      "## Financial Position",
      "## Variance and Commitment Analysis",
      "## Controls and Evidence Gaps",
      "## Recommended Actions Before Next Governance Cycle",
      "Prioritize forecast, plan-vs-actual, milestone evidence, and cash/commitment impacts.",
    ].join("\n");
  }

  if (role.id === "planning-engineer") {
    return [
      "Respond in Markdown using this exact structure:",
      "## Portfolio Gate Status",
      "## Critical Dependencies and Engineering Constraints",
      "## Assurance Queue and Technical Risks",
      "## Actions to Protect Gate Dates",
      "Use package names, gate dates, queue IDs, and timing impacts where evidence exists.",
    ].join("\n");
  }

  return [
    "Respond in Markdown using this exact structure:",
    "## Delivery and Release Health",
    "## Environment and Quality Controls",
    "## Open Risks and Approval Gates",
    "## Recommended Actions Before Go/No-Go",
    "Use stream names, test/control status, and dates from the evidence.",
  ].join("\n");
}

export function buildRoleContext(role: DemoRole): string {
  return [
    `The active simulated role is ${role.label}.`,
    "Answer only from the authorized document excerpts provided after these instructions.",
    "Do not invent metrics, live system access, source files, or data outside those excerpts.",
    "If the question has no matching authorized source, say that the active simulated role cannot access matching demo evidence.",
    "Keep answers operational, detailed, and decision-oriented. Use short paragraphs and compact bullet points.",
    "Use Markdown formatting for readability. Highlight key metrics and deadlines in bold, and use italics for caveats or assumptions.",
    getResponseStructure(role),
  ].join("\n\n");
}