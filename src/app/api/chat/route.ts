import { NextResponse } from "next/server";

import { createChatCompletion } from "@/lib/azure-openai";
import { buildRoleContext, getRole } from "@/lib/demo-access";

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
    const response = await createChatCompletion(buildRoleContext(role), message);
    return NextResponse.json({ response });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message === "Azure OpenAI is not configured." ? 503 : 502;

    return NextResponse.json(
      {
        error:
          status === 503
            ? "Chat is not configured yet. Add the Azure OpenAI endpoint and deployment to enable it."
            : "Chat is temporarily unavailable. Please try again.",
      },
      { status },
    );
  }
}