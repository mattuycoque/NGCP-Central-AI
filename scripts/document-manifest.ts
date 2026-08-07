import { readFile } from "node:fs/promises";
import path from "node:path";

import type { DocumentSource } from "../src/lib/document-types";
import { DEMO_ROLES, DOMAINS } from "../src/lib/demo-data";

type Manifest = {
  schemaVersion: number;
  documents: DocumentSource[];
};

const roleIds = new Set(DEMO_ROLES.map((role) => role.id));

function assertDocument(document: DocumentSource, seenIds: Set<string>, seenFiles: Set<string>): void {
  if (!document.documentId || seenIds.has(document.documentId)) {
    throw new Error(`Document ID must be present and unique: ${document.documentId || "(missing)"}.`);
  }
  if (!document.sourceFile || document.sourceFile.startsWith("/") || document.sourceFile.includes("..") || seenFiles.has(document.sourceFile)) {
    throw new Error(`Source file must be a unique relative path: ${document.sourceFile || "(missing)"}.`);
  }
  if (!document.title || !DOMAINS[document.domain] || document.eligibleRoles.length === 0 || !document.eligibleRoles.every((role) => roleIds.has(role))) {
    throw new Error(`Document ${document.documentId} has invalid title, domain, or eligible roles.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(document.date)) {
    throw new Error(`Document ${document.documentId} must use an ISO date.`);
  }
  if (document.provenance === "public" && !document.sourceUrl?.startsWith("https://")) {
    throw new Error(`Public document ${document.documentId} must have an HTTPS source URL.`);
  }

  seenIds.add(document.documentId);
  seenFiles.add(document.sourceFile);
}

export async function loadValidatedManifest(rootDirectory = process.cwd()): Promise<Manifest> {
  const manifestPath = path.join(rootDirectory, "demo-documents", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;

  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.documents) || manifest.documents.length === 0) {
    throw new Error("The document manifest must use schema version 1 and include documents.");
  }

  const seenIds = new Set<string>();
  const seenFiles = new Set<string>();
  for (const document of manifest.documents) {
    assertDocument(document, seenIds, seenFiles);
    const documentPath = path.join(rootDirectory, "demo-documents", document.sourceFile);
    const content = await readFile(documentPath, "utf8");
    if (document.provenance === "synthetic" && !content.includes("Synthetic demo data")) {
      throw new Error(`Synthetic document ${document.documentId} must contain the required demo-data notice.`);
    }
  }

  return manifest;
}