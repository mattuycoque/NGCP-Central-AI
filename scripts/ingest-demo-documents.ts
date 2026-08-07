import { readFile } from "node:fs/promises";
import path from "node:path";

import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { loadEnvConfig } from "@next/env";
import { BlobServiceClient } from "@azure/storage-blob";
import { SearchClient, SearchIndexClient, type SearchIndex } from "@azure/search-documents";
import { AzureOpenAI } from "openai";

import { loadValidatedManifest } from "./document-manifest";
import type { SearchDocument } from "../src/lib/document-types";

const cognitiveServicesScope = "https://cognitiveservices.azure.com/.default";
const vectorDimensions = 1536;

loadEnvConfig(process.cwd());

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set before ingesting documents.`);
  }
  return value;
}

function chunkText(content: string, maximumLength = 2_000): string[] {
  const paragraphs = content.split(/\n\s*\n/);
  const chunks: string[] = [];
  let chunk = "";

  for (const paragraph of paragraphs) {
    if ((chunk.length + paragraph.length + 2) > maximumLength && chunk) {
      chunks.push(chunk);
      chunk = "";
    }
    chunk = chunk ? `${chunk}\n\n${paragraph}` : paragraph;
  }
  if (chunk) {
    chunks.push(chunk);
  }

  return chunks;
}

async function main(): Promise<void> {
  const storageAccountUrl = requiredEnvironment("AZURE_STORAGE_ACCOUNT_URL");
  const storageContainer = requiredEnvironment("AZURE_STORAGE_CONTAINER_NAME");
  const searchEndpoint = requiredEnvironment("AZURE_SEARCH_ENDPOINT");
  const searchIndex = requiredEnvironment("AZURE_SEARCH_INDEX");
  const openAIEndpoint = requiredEnvironment("AZURE_OPENAI_ENDPOINT");
  const embeddingDeployment = requiredEnvironment("AZURE_OPENAI_EMBEDDING_DEPLOYMENT");
  const apiVersion = requiredEnvironment("AZURE_OPENAI_API_VERSION");
  const credential = new DefaultAzureCredential();
  const manifest = await loadValidatedManifest();
  const blobContainer = new BlobServiceClient(storageAccountUrl, credential).getContainerClient(storageContainer);
  const indexClient = new SearchIndexClient(searchEndpoint, credential);
  const searchClient = new SearchClient<SearchDocument>(searchEndpoint, searchIndex, credential);
  const openAI = new AzureOpenAI({
    azureADTokenProvider: getBearerTokenProvider(credential, cognitiveServicesScope),
    endpoint: openAIEndpoint,
    deployment: embeddingDeployment,
    apiVersion,
  });

  await blobContainer.createIfNotExists();

  const index: SearchIndex = {
    name: searchIndex,
    fields: [
      { name: "chunkId", type: "Edm.String", key: true, filterable: true, sortable: true },
      { name: "documentId", type: "Edm.String", filterable: true, sortable: true },
      { name: "sourceFile", type: "Edm.String", filterable: true, retrievable: true },
      { name: "title", type: "Edm.String", searchable: true, retrievable: true },
      { name: "domain", type: "Edm.String", filterable: true, facetable: true, retrievable: true },
      { name: "classification", type: "Edm.String", filterable: true, facetable: true, retrievable: true },
      { name: "eligibleRoles", type: "Collection(Edm.String)", filterable: true, retrievable: true },
      { name: "provenance", type: "Edm.String", filterable: true, facetable: true, retrievable: true },
      { name: "date", type: "Edm.String", filterable: true, sortable: true, retrievable: true },
      { name: "sourceUrl", type: "Edm.String", retrievable: true },
      { name: "content", type: "Edm.String", searchable: true, retrievable: true },
      { name: "contentVector", type: "Collection(Edm.Single)", searchable: true, vectorSearchDimensions: vectorDimensions, vectorSearchProfileName: "ngcp-vector-profile" },
    ],
    vectorSearch: {
      algorithms: [{ name: "ngcp-hnsw", kind: "hnsw", parameters: { metric: "cosine" } }],
      profiles: [{ name: "ngcp-vector-profile", algorithmConfigurationName: "ngcp-hnsw" }],
    },
  };
  await indexClient.createOrUpdateIndex(index);

  const searchDocuments: SearchDocument[] = [];
  for (const source of manifest.documents) {
    const content = await readFile(path.join(process.cwd(), "demo-documents", source.sourceFile), "utf8");
    await blobContainer.getBlockBlobClient(source.sourceFile).uploadData(Buffer.from(content, "utf8"), {
      metadata: {
        documentid: source.documentId,
        domain: source.domain,
        classification: source.classification,
        eligibleroles: source.eligibleRoles.join(","),
        provenance: source.provenance,
      },
    });

    for (const [index, chunk] of chunkText(content).entries()) {
      const embedding = await openAI.embeddings.create({ model: embeddingDeployment, input: chunk });
      const vector = embedding.data[0]?.embedding;
      if (!vector || vector.length !== vectorDimensions) {
        throw new Error(`Unexpected embedding dimensions for ${source.sourceFile}.`);
      }
      searchDocuments.push({ ...source, chunkId: `${source.documentId}-${index + 1}`, content: chunk, contentVector: vector });
    }
  }

  const result = await searchClient.mergeOrUploadDocuments(searchDocuments);
  const failed = result.results.filter((item) => !item.succeeded);
  if (failed.length > 0) {
    throw new Error(`Azure AI Search rejected ${failed.length} document chunks.`);
  }

  console.log(`Uploaded ${manifest.documents.length} canonical files and indexed ${searchDocuments.length} chunks.`);
}

void main();