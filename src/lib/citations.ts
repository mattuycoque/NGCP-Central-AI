import type { RetrievedDocument } from "@/lib/document-types";

export function getCitedSources(response: string, sources: RetrievedDocument[]): RetrievedDocument[] {
  const sourceIds = [...response.matchAll(/\[([a-z0-9-]+)\]/gi)].map((match) => match[1]);
  if (sourceIds.length === 0) {
    return [];
  }

  const sourcesById = new Map(sources.map((source) => [source.documentId, source]));
  const citedSources: RetrievedDocument[] = [];
  for (const sourceId of new Set(sourceIds)) {
    const source = sourcesById.get(sourceId);
    if (!source) {
      throw new Error("The model returned an invalid source citation.");
    }
    citedSources.push(source);
  }

  return citedSources;
}