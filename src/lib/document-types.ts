import type { DemoRoleId, Domain } from "@/lib/demo-data";

export type DocumentProvenance = "synthetic" | "public";

export type DocumentSource = {
  documentId: string;
  sourceFile: string;
  title: string;
  domain: Domain;
  classification: "Internal" | "Confidential" | "Public";
  eligibleRoles: DemoRoleId[];
  provenance: DocumentProvenance;
  date: string;
  sourceUrl?: string;
};

export type RetrievedDocument = DocumentSource & {
  content: string;
};

export type SearchDocument = RetrievedDocument & {
  chunkId: string;
  contentVector?: number[];
};