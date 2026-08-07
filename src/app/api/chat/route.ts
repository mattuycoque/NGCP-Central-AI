import { NextResponse } from "next/server";

import { createChatCompletion } from "@/lib/azure-openai";
import { retrieveDocuments } from "@/lib/azure-search";
import { getCitedSources } from "@/lib/citations";
import { buildRoleContext, getRole } from "@/lib/demo-access";

function linkifyCitations(response: string, roleId: string, sourceById: Map<string, string>): string {
  return response.replace(/\[([a-z0-9-]+)\]/gi, (fullMatch, sourceId: string) => {
    const sourceFile = sourceById.get(sourceId);
    if (!sourceFile) {
      return fullMatch;
    }

    const href = `/api/source?documentId=${encodeURIComponent(sourceId)}&roleId=${encodeURIComponent(roleId)}`;
    return `[${sourceFile}](${href})`;
  });
}

export const runtime = "nodejs";

type ChatRequest = {
  message?: unknown;
  roleId?: unknown;
};

export async function POST(request: Request) {
  let payload: ChatRequest;

  try {
    payload = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: "The request must be valid JSON." }, { status: 400 });
  }

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  const roleId = typeof payload.roleId === "string" ? payload.roleId : "";
  const role = getRole(roleId);

  if (!message || message.length > 2_000) {
    return NextResponse.json({ error: "Enter a message up to 2,000 characters." }, { status: 400 });
  }

  if (!role) {
    return NextResponse.json({ error: "The selected demo role is not valid." }, { status: 400 });
  }

  try {
    const sources = await retrieveDocuments(role, message);
    if (sources.length === 0) {
      return NextResponse.json({
        response: "I could not find authorized demo evidence for that question.",
        sources: [],
      });
    }

    const response = await createChatCompletion(buildRoleContext(role), message, sources);
    const citedSources = getCitedSources(response, sources);
    if (citedSources.length === 0) {
      return NextResponse.json({
        response: "I could not find authorized demo evidence for that question.",
        sources: [],
      });
    }
    const linkifiedResponse = linkifyCitations(
      response,
      role.id,
      new Map(citedSources.map((source) => [source.documentId, source.sourceFile])),
    );

    return NextResponse.json({
      response: linkifiedResponse,
      sources: citedSources.map((source) => ({
        documentId: source.documentId,
        sourceFile: source.sourceFile,
        title: source.title,
        domain: source.domain,
        classification: source.classification,
        provenance: source.provenance,
        date: source.date,
        sourceUrl: source.sourceUrl || undefined,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Azure OpenAI is not configured." || message === "Document retrieval is not configured." ? 503 : 502;

    return NextResponse.json(
      {
        error:
          status === 503
            ? "Chat is not configured yet. Add the Azure OpenAI and document retrieval settings to enable it."
            : "Chat is temporarily unavailable. Please try again.",
      },
      { status },
    );
  }
}