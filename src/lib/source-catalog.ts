import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import type { DocumentSource } from "@/lib/document-types";

type Manifest = {
  schemaVersion: number;
  documents: DocumentSource[];
};

let manifestCache: Manifest | undefined;

async function readManifest(): Promise<Manifest> {
  if (manifestCache) {
    return manifestCache;
  }

  const manifestPath = path.join(process.cwd(), "demo-documents", "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
  manifestCache = manifest;
  return manifest;
}

export async function getSourceByDocumentId(documentId: string): Promise<DocumentSource | undefined> {
  const manifest = await readManifest();
  return manifest.documents.find((source) => source.documentId === documentId);
}

export async function readSourceContent(sourceFile: string): Promise<string> {
  const sourcePath = path.join(process.cwd(), "demo-documents", sourceFile);
  return readFile(sourcePath, "utf8");
}
