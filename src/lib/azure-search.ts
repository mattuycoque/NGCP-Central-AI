import "server-only";

import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { SearchClient } from "@azure/search-documents";
import { AzureOpenAI } from "openai";

import type { DemoRole } from "@/lib/demo-data";
import type { RetrievedDocument, SearchDocument } from "@/lib/document-types";

const cognitiveServicesScope = "https://cognitiveservices.azure.com/.default";

type DocumentConfiguration = {
  searchEndpoint: string;
  searchIndex: string;
  embeddingDeployment: string;
  openAIEndpoint: string;
  apiVersion: string;
};

function getDocumentConfiguration(): DocumentConfiguration | undefined {
  const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
  const searchIndex = process.env.AZURE_SEARCH_INDEX;
  const embeddingDeployment = process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT;
  const openAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;

  if (!searchEndpoint || !searchIndex || !embeddingDeployment || !openAIEndpoint || !apiVersion) {
    return undefined;
  }

  return { searchEndpoint, searchIndex, embeddingDeployment, openAIEndpoint, apiVersion };
}

function escapeODataValue(value: string): string {
  return value.replaceAll("'", "''");
}

export async function retrieveDocuments(role: DemoRole, query: string): Promise<RetrievedDocument[]> {
  const configuration = getDocumentConfiguration();

  if (!configuration) {
    throw new Error("Document retrieval is not configured.");
  }

  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(credential, cognitiveServicesScope);
  const openAI = new AzureOpenAI({
    azureADTokenProvider,
    endpoint: configuration.openAIEndpoint,
    deployment: configuration.embeddingDeployment,
    apiVersion: configuration.apiVersion,
  });
  const embedding = await openAI.embeddings.create({
    model: configuration.embeddingDeployment,
    input: query,
  });
  const vector = embedding.data[0]?.embedding;

  if (!vector) {
    throw new Error("The embedding model did not return a vector.");
  }

  const client = new SearchClient<SearchDocument>(
    configuration.searchEndpoint,
    configuration.searchIndex,
    credential,
  );
  const results = await client.search(query, {
    filter: `eligibleRoles/any(role: role eq '${escapeODataValue(role.id)}')`,
    top: 10,
    select: ["documentId", "sourceFile", "title", "domain", "classification", "eligibleRoles", "provenance", "date", "sourceUrl", "content"],
    vectorSearchOptions: {
      queries: [{ kind: "vector", vector, fields: ["contentVector"], kNearestNeighborsCount: 10, perDocumentVectorLimit: 1 }],
    },
  });

  const documents = new Map<string, RetrievedDocument>();
  for await (const result of results.results) {
    const document = result.document;
    if (!document.documentId || !document.eligibleRoles?.includes(role.id) || documents.has(document.documentId)) {
      continue;
    }

    documents.set(document.documentId, {
      documentId: document.documentId,
      sourceFile: document.sourceFile,
      title: document.title,
      domain: document.domain,
      classification: document.classification,
      eligibleRoles: document.eligibleRoles,
      provenance: document.provenance,
      date: document.date,
      sourceUrl: document.sourceUrl,
      content: document.content,
    });
  }

  return [...documents.values()].slice(0, 5);
}