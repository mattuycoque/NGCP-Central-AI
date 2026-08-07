import assert from "node:assert/strict";
import test from "node:test";

import { getEligibleSignals } from "../src/lib/demo-access";

test("simulated roles expose only their permitted domain signals", () => {
  const financeSignals = getEligibleSignals("finance-analyst");
  assert.ok(financeSignals.length > 0);
  assert.ok(financeSignals.every((signal) => signal.domain === "finance"));
});