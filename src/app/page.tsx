"use client";

import { ArrowUp, Bot, ChevronDown, Database, LockKeyhole, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import { getEligibleDomains, getEligibleSignals } from "@/lib/demo-access";
import { DEMO_ROLES, DOMAINS, ROLE_SUGGESTED_QUESTIONS, type DemoRoleId } from "@/lib/demo-data";
import type { DocumentSource } from "@/lib/document-types";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
  sources?: DocumentSource[];
};

const initialMessage: ChatMessage = {
  role: "assistant",
  content: "I can help interpret the synthetic signals available to your active demo role. Ask about a permitted domain or select a suggested question below.",
};

export default function Home() {
  const [roleId, setRoleId] = useState<DemoRoleId>("executive");
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const activeRole = DEMO_ROLES.find((role) => role.id === roleId) ?? DEMO_ROLES[0];
  const domains = getEligibleDomains(roleId);
  const signals = getEligibleSignals(roleId);
  const suggestedQuestions = ROLE_SUGGESTED_QUESTIONS[roleId] ?? [];

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isSending, messages]);

  useEffect(() => {
    if (!isArchitectureOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsArchitectureOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isArchitectureOpen]);

  async function sendMessage(event?: FormEvent<HTMLFormElement>, suggestedMessage?: string) {
    event?.preventDefault();
    const message = (suggestedMessage ?? draft).trim();

    if (!message || isSending) {
      return;
    }

    setDraft("");
    setError(undefined);
    setMessages((current) => [...current, { role: "user", content: message }]);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, roleId }),
      });
      const body = (await response.json()) as { response?: string; sources?: DocumentSource[]; error?: string };

      if (!response.ok || !body.response) {
        throw new Error(body.error ?? "Chat is temporarily unavailable.");
      }

      setMessages((current) => [...current, { role: "assistant", content: body.response as string, sources: body.sources ?? [] }]);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Chat is temporarily unavailable.");
    } finally {
      setIsSending(false);
    }
  }

  function selectRole(nextRoleId: DemoRoleId) {
    setRoleId(nextRoleId);
    setError(undefined);
    setMessages([
      {
        role: "assistant",
        content: `Role view changed to ${DEMO_ROLES.find((role) => role.id === nextRoleId)?.label}. The synthetic context available to new questions has been updated.`,
      },
    ]);
  }

  function refreshConversation() {
    if (isSending) {
      return;
    }

    setDraft("");
    setError(undefined);
    setMessages([initialMessage]);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true"><Sparkles size={19} strokeWidth={2.4} /></span>
          <div>
            <h1>NGCP Central AI</h1>
            <p>Operational intelligence workspace</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="architecture-button" onClick={() => setIsArchitectureOpen(true)} type="button">Architecture</button>
          <span className="session-state"><span className="status-dot" aria-hidden="true" /> Session only</span>
          <span className="demo-badge">Demo data</span>
        </div>
      </header>

      {isArchitectureOpen && (
        <div className="architecture-modal-backdrop" aria-hidden="true" onClick={() => setIsArchitectureOpen(false)}>
          <section
            aria-label="Architecture overview"
            aria-modal="true"
            className="architecture-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="architecture-header">
              <div>
                <p className="eyebrow">NGCP Central AI</p>
                <h2>Current and Future Architecture</h2>
              </div>
              <button aria-label="Close architecture panel" className="architecture-close" onClick={() => setIsArchitectureOpen(false)} type="button">Close</button>
            </div>

            <div className="architecture-grid">
              <article className="architecture-card">
                <h3>Current Runtime Architecture and Azure Services</h3>
                <p>Browser client calls a protected server route. The server performs role-aware retrieval and grounded generation using only authorized source excerpts.</p>
                <ul>
                  <li><strong>UI:</strong> Next.js App Router single-page chat experience with simulated role switching.</li>
                  <li><strong>API:</strong> <code>/api/chat</code> validates payload, role, retrieval results, and source citations.</li>
                  <li><strong>Retrieval:</strong> Hybrid keyword plus vector lookup in Azure AI Search, filtered by role eligibility.</li>
                  <li><strong>Generation:</strong> Azure OpenAI chat deployment with source-grounded system instructions.</li>
                  <li><strong>Auth model:</strong> <code>DefaultAzureCredential</code> with Microsoft Entra identity, no API keys in browser.</li>
                  <li><strong>Azure OpenAI:</strong> Chat deployment <code>ngcp-chat</code> and embeddings deployment <code>ngcp-embeddings</code>.</li>
                  <li><strong>Azure AI Search (Basic):</strong> Service <code>ngcpsearch6ksymucav5omy</code> with local auth disabled.</li>
                  <li><strong>Azure Storage (Blob):</strong> Account <code>ngcpdocs6ksymucav5omy</code> with HTTPS-only, shared-key disabled, public blob access disabled.</li>
                  <li><strong>Microsoft Entra ID:</strong> Role-based data-plane access through RBAC and managed identity pattern.</li>
                </ul>
              </article>

              <article className="architecture-card">
                <h3>Current Source Corpus</h3>
                <p>Canonical sources are private Markdown files in Blob Storage and indexed chunks in Azure AI Search.</p>
                <ul>
                  <li><strong>Synthetic corpus:</strong> 12 NGCP-style records spanning finance, planning/engineering, and digital delivery.</li>
                  <li><strong>Storage:</strong> Private Blob container <code>ngcp-demo-documents</code>.</li>
                  <li><strong>Indexing:</strong> Vector index <code>ngcp-demo-documents</code> with source metadata (domain, classification, date, provenance, eligible roles).</li>
                  <li><strong>Citations:</strong> API returns only files explicitly cited by model output and validated against retrieved set.</li>
                  <li><strong>Data policy:</strong> Synthetic records clearly labeled; public records require manual review and attribution.</li>
                </ul>
              </article>

              <article className="architecture-card future">
                <h3>Future Architecture Expansion</h3>
                <p>Planned enhancements to support broader decision workflows while preserving grounded, auditable responses.</p>
                <ul>
                  <li><strong>More source domains:</strong> outage coordination, right-of-way permits, regulatory reporting, OT asset lifecycle, supplier performance, and risk registers.</li>
                  <li><strong>Source connectors:</strong> controlled ingestion from approved public sources and internal staging feeds with validation gates.</li>
                  <li><strong>Knowledge quality:</strong> confidence scoring, freshness windows, conflict detection across sources, and structured evidence ranking.</li>
                  <li><strong>Execution agents:</strong> skill-based action agents for drafting governance plans, creating decision memos, preparing CAB packs, and generating portfolio briefings.</li>
                  <li><strong>Action integrations:</strong> optional human-approved connectors for sending emails, creating work items, and producing workflow-ready draft artifacts.</li>
                  <li><strong>Governance controls:</strong> approval checkpoints, action logs, role-based policy enforcement, and non-repudiable source/citation traces.</li>
                </ul>
              </article>

              <article className="architecture-card future">
                <h3>Production AI Landing Zone Essentials</h3>
                <p>When moving from demo to production, establish a dedicated AI landing zone with enterprise guardrails from day one.</p>
                <ul>
                  <li><strong>Identity and access:</strong> <strong>Microsoft Entra ID</strong>, <strong>Managed Identities for Azure Resources</strong>, and <strong>Azure RBAC</strong> with least-privilege role assignments and Privileged Identity Management for elevated operations.</li>
                  <li><strong>Network isolation:</strong> <strong>Azure Virtual Network</strong>, <strong>Private Endpoint</strong>, <strong>Azure Private DNS</strong>, <strong>Azure Firewall</strong>, and optionally <strong>Azure Virtual WAN</strong> for hub-spoke routing and controlled egress.</li>
                  <li><strong>Secrets and keys:</strong> <strong>Azure Key Vault</strong> with purge protection, soft delete, key rotation, and managed identity-based secret retrieval.</li>
                  <li><strong>Data governance:</strong> <strong>Azure Storage</strong>, <strong>Azure AI Search</strong>, <strong>Azure Policy</strong>, and <strong>Microsoft Purview</strong> for classification, retention, and environment boundary enforcement.</li>
                  <li><strong>Prompt and model safety:</strong> <strong>Azure OpenAI Service</strong> (content filters and model safety settings), <strong>Azure AI Content Safety</strong>, and server-side grounding/citation enforcement in the application API.</li>
                  <li><strong>Observability and audit:</strong> <strong>Azure Monitor</strong>, <strong>Application Insights</strong>, <strong>Log Analytics Workspace</strong>, and <strong>Microsoft Sentinel</strong> for logging, traces, security analytics, and incident monitoring.</li>
                  <li><strong>Reliability engineering:</strong> <strong>Azure Container Apps</strong> (autoscaling and revisions), <strong>Azure Traffic Manager</strong> or <strong>Azure Front Door</strong> for regional failover, and <strong>Recovery Services Vault</strong> where backup workflows apply.</li>
                  <li><strong>CI/CD and policy as code:</strong> <strong>GitHub Actions</strong> with OIDC federation to <strong>Microsoft Entra ID</strong>, plus <strong>Azure Resource Manager (Bicep)</strong> and <strong>Azure Policy</strong> gates for controlled promotion.</li>
                  <li><strong>Responsible AI controls:</strong> <strong>Azure Machine Learning</strong> (evaluation pipelines where applicable), <strong>Azure OpenAI Service</strong>, <strong>Azure AI Content Safety</strong>, and human approval workflows in <strong>Power Automate</strong> or equivalent.</li>
                  <li><strong>Platform operations:</strong> <strong>Azure Cost Management + Billing</strong>, <strong>Azure Quotas</strong>, <strong>Azure Advisor</strong>, and <strong>Azure Monitor Alerts</strong> for quota, cost, and lifecycle operations.</li>
                </ul>
              </article>
            </div>
          </section>
        </div>
      )}

      <section className="access-ribbon" aria-label="Simulated access policy">
        <div className="role-picker">
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <span className="control-label">Simulated Entra group</span>
            <label className="role-select-wrap" htmlFor="role">
              <select id="role" value={roleId} onChange={(event) => selectRole(event.target.value as DemoRoleId)}>
                {DEMO_ROLES.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </div>
        </div>
        <div className="access-note">
          <LockKeyhole size={15} aria-hidden="true" />
          <span>{activeRole.groupName}</span>
        </div>
        <div className="domain-tags" aria-label="Eligible domains">
          {domains.map((domain) => <span className={`tag ${DOMAINS[domain].accent}`} key={domain}>{DOMAINS[domain].label}</span>)}
        </div>
      </section>

      <section className="workspace" aria-label="NGCP Central AI workspace">
        <section className="chat-panel" aria-label="Chat">
          <div className="chat-intro-row">
            <div className="chat-intro">
              <span className="assistant-avatar" aria-hidden="true"><Bot size={22} /></span>
              <div>
                <p className="eyebrow">Context-aware assistant</p>
                <h2>What would you like to explore?</h2>
                <p className="chat-subtitle">{activeRole.description}</p>
              </div>
            </div>
            <button className="refresh-button" aria-label="Clear conversation" disabled={isSending} onClick={refreshConversation} title="Clear conversation" type="button"><RotateCcw size={17} /></button>
          </div>

          <div className="messages" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" && <span className="message-avatar" aria-hidden="true"><Bot size={15} /></span>}
                <div className="message-content">
                  <span className="message-label">{message.role === "assistant" ? "Central AI" : "You"}</span>
                  {message.role === "assistant" ? (
                    <div className="message-markdown">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  {message.sources && message.sources.length > 0 && (
                    <ul className="message-sources" aria-label="Sources">
                      {message.sources.map((source) => (
                        <li key={source.documentId}>
                          <a href={`/api/source?documentId=${encodeURIComponent(source.documentId)}&roleId=${encodeURIComponent(roleId)}`} rel="noreferrer" target="_blank">{source.sourceFile}</a>
                          {source.sourceUrl && <a className="source-public-link" href={source.sourceUrl} rel="noreferrer" target="_blank">Public reference</a>}
                          <small>{source.provenance === "synthetic" ? "Synthetic demo data" : "Public source"} · {source.date}</small>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
            {isSending && <div className="thinking"><span /><span /><span /> Reviewing permitted context</div>}
            <div ref={messageEndRef} />
          </div>

          <div className="suggestions" aria-label="Suggested questions">
            {suggestedQuestions.map((question) => (
              <button key={question} onClick={() => void sendMessage(undefined, question)} type="button">
                <Sparkles size={14} aria-hidden="true" /> {question}
              </button>
            ))}
          </div>

          <form className="composer" onSubmit={(event) => void sendMessage(event)}>
            <label className="sr-only" htmlFor="message">Ask a question</label>
            <textarea
              id="message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about the signals available to this role..."
              rows={1}
              maxLength={2000}
              disabled={isSending}
            />
            <button aria-label="Send message" disabled={isSending || !draft.trim()} title="Send message" type="submit"><ArrowUp size={19} strokeWidth={2.5} /></button>
          </form>
          <div className="composer-footer">
            <span>Responses are based on eligible synthetic records.</span>
            <span>{draft.length}/2000</span>
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
        </section>

        <aside className="sources-panel">
          <div className="sources-heading">
            <div>
              <p className="eyebrow">Model context</p>
              <h2>Eligible signals</h2>
            </div>
            <span className="source-count">{signals.length}</span>
          </div>
          <p className="sources-copy">This role can use the following records in the current session.</p>
          <div className="source-list">
            {signals.map((signal, index) => (
              <article className="source-item" key={signal.id} style={{ animationDelay: `${index * 55}ms` }}>
                <div className="source-icon"><Database size={16} /></div>
                <div>
                  <div className="source-meta">
                    <span className={DOMAINS[signal.domain].accent}>{DOMAINS[signal.domain].label}</span>
                    <small>{signal.classification}</small>
                  </div>
                  <h3>{signal.title}</h3>
                  <p>{signal.summary}</p>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}