import assert from "node:assert/strict";
import test from "node:test";

import { getCitedSources } from "../src/lib/citations";
import type { RetrievedDocument } from "../src/lib/document-types";

const sources: RetrievedDocument[] = [
  {
    documentId: "finance-capital-program-outlook",
    sourceFile: "synthetic/finance/capital-program-outlook.md",
    title: "Capital program outlook",
    domain: "finance",
    classification: "Internal",
    eligibleRoles: ["executive"],
    provenance: "synthetic",
    date: "2026-07-31",
    content: "Synthetic source.",
  },
];

test("returns only the authorized source IDs cited by the model", () => {
  const cited = getCitedSources("Forecast is within the envelope [finance-capital-program-outlook].", sources);
  assert.deepEqual(cited, sources);
});

test("returns no sources for an uncited response", () => {
  assert.deepEqual(getCitedSources("No matching evidence is available.", sources), []);
});

test("rejects citations that are not part of the authorized retrieval set", () => {
  assert.throws(() => getCitedSources("Unsupported [fabricated-source].", sources), /invalid source citation/);
});