import { DEMO_ROLES, DEMO_SIGNALS, type DemoRole, type DemoRoleId, type DemoSignal, DOMAINS, type Domain } from "@/lib/demo-data";

export function getRole(roleId: string): DemoRole | undefined {
  return DEMO_ROLES.find((role) => role.id === roleId);
}

export function getEligibleSignals(roleId: DemoRoleId): DemoSignal[] {
  return DEMO_SIGNALS.filter((signal) => signal.eligibleRoles.includes(roleId));
}

export function getEligibleDomains(roleId: DemoRoleId): Domain[] {
  return [...new Set(getEligibleSignals(roleId).map((signal) => signal.domain))];
}

export function buildRoleContext(role: DemoRole): string {
  const signals = getEligibleSignals(role.id);
  const context = signals
    .map(
      (signal) =>
        `- [${DOMAINS[signal.domain].label}] ${signal.title} (${signal.classification}): ${signal.summary}`,
    )
    .join("\n");

  return [
    `The active simulated role is ${role.label}.`,
    "Answer only from the synthetic signals below.",
    "Do not invent metrics, live system access, or data outside these signals.",
    "If the question concerns a domain or detail not represented here, say that the active simulated role cannot access it or that the demo has no matching signal.",
    "Keep answers concise, operational, and clearly identify that the content is demo data when relevant.",
    "Eligible synthetic signals:",
    context,
  ].join("\n\n");
}