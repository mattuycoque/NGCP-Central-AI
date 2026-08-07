import { NextResponse } from "next/server";

import { getRole } from "@/lib/demo-access";
import { readSourceContent, getSourceByDocumentId } from "@/lib/source-catalog";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId") ?? "";
  const roleId = searchParams.get("roleId") ?? "";
  const role = getRole(roleId);

  if (!documentId || !role) {
    return NextResponse.json({ error: "A valid documentId and roleId are required." }, { status: 400 });
  }

  const source = await getSourceByDocumentId(documentId);
  if (!source) {
    return NextResponse.json({ error: "The requested source document was not found." }, { status: 404 });
  }

  if (!source.eligibleRoles.includes(role.id)) {
    return NextResponse.json({ error: "This source document is not authorized for the selected role." }, { status: 403 });
  }

  const content = await readSourceContent(source.sourceFile);
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(source.title)}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #f6f8fb; color: #1b2638; }
      main { max-width: 980px; margin: 0 auto; padding: 24px 16px 32px; }
      h1 { margin: 0 0 8px; font-size: 22px; }
      p { margin: 0 0 10px; font-size: 13px; color: #51607b; }
      .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0 18px; }
      .meta span { border: 1px solid #dce4ee; border-radius: 8px; background: #fff; padding: 8px 10px; font-size: 12px; }
      pre { margin: 0; border: 1px solid #dce4ee; border-radius: 10px; background: #fff; padding: 14px; font-size: 12px; line-height: 1.55; overflow: auto; white-space: pre-wrap; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(source.title)}</h1>
      <p>${escapeHtml(source.sourceFile)}</p>
      <div class="meta">
        <span><strong>Role:</strong> ${escapeHtml(role.label)}</span>
        <span><strong>Domain:</strong> ${escapeHtml(source.domain)}</span>
        <span><strong>Classification:</strong> ${escapeHtml(source.classification)}</span>
        <span><strong>Date:</strong> ${escapeHtml(source.date)}</span>
      </div>
      <pre>${escapeHtml(content)}</pre>
    </main>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
