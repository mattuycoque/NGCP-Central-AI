import "server-only";

import { DefaultAzureCredential, getBearerTokenProvider } from "@azure/identity";
import { AzureOpenAI } from "openai";

import type { RetrievedDocument } from "@/lib/document-types";

const scope = "https://cognitiveservices.azure.com/.default";

function getConfiguration() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

  if (!endpoint || !deployment) {
    return undefined;
  }

  return { endpoint, deployment, apiVersion };
}

export async function createChatCompletion(systemPrompt: string, userMessage: string, sources: RetrievedDocument[]): Promise<string> {
  const configuration = getConfiguration();

  if (!configuration) {
    throw new Error("Azure OpenAI is not configured.");
  }

  const credential = new DefaultAzureCredential();
  const azureADTokenProvider = getBearerTokenProvider(credential, scope);
  const client = new AzureOpenAI({
    azureADTokenProvider,
    endpoint: configuration.endpoint,
    deployment: configuration.deployment,
    apiVersion: configuration.apiVersion,
  });

  const sourceContext = sources
    .map((source) => `[${source.documentId}] ${source.title} (${source.sourceFile}, ${source.date})\n${source.content}`)
    .join("\n\n");
  const completion = await client.chat.completions.create({
    model: configuration.deployment,
    messages: [
      {
        role: "system",
        content: `${systemPrompt}\n\nUse only the authorized source excerpts below. Cite factual statements inline with the matching source ID in square brackets, such as [finance-capital-program-outlook]. When citing multiple sources on one line, separate citations with commas, for example: [source-a], [source-b]. Do not cite a source that is not provided.\n\nAuthorized source excerpts:\n${sourceContext}`,
      },
      { role: "user", content: userMessage },
    ],
    temperature: 0.2,
    max_tokens: 900,
  });

  return completion.choices[0]?.message.content?.trim() || "The model did not return a response.";
}