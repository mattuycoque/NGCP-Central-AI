"use client";

import { ArrowUp, Bot, ChevronDown, Database, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

import { getEligibleDomains, getEligibleSignals } from "@/lib/demo-access";
import { DEMO_ROLES, DOMAINS, type DemoRoleId } from "@/lib/demo-data";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
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
  const messageEndRef = useRef<HTMLDivElement>(null);

  const activeRole = DEMO_ROLES.find((role) => role.id === roleId) ?? DEMO_ROLES[0];
  const domains = getEligibleDomains(roleId);
  const signals = getEligibleSignals(roleId);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [isSending, messages]);

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
      const body = (await response.json()) as { response?: string; error?: string };

      if (!response.ok || !body.response) {
        throw new Error(body.error ?? "Chat is temporarily unavailable.");
      }

      setMessages((current) => [...current, { role: "assistant", content: body.response as string }]);
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
          <span className="session-state"><span className="status-dot" aria-hidden="true" /> Session only</span>
          <span className="demo-badge">Demo data</span>
        </div>
      </header>

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
          <div className="chat-intro">
            <span className="assistant-avatar" aria-hidden="true"><Bot size={22} /></span>
            <div>
              <p className="eyebrow">Context-aware assistant</p>
              <h2>What would you like to explore?</h2>
              <p className="chat-subtitle">{activeRole.description}</p>
            </div>
          </div>

          <div className="messages" aria-live="polite">
            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" && <span className="message-avatar" aria-hidden="true"><Bot size={15} /></span>}
                <div className="message-content">
                  <span className="message-label">{message.role === "assistant" ? "Central AI" : "You"}</span>
                  <p>{message.content}</p>
                </div>
              </article>
            ))}
            {isSending && <div className="thinking"><span /><span /><span /> Reviewing permitted context</div>}
            <div ref={messageEndRef} />
          </div>

          <div className="suggestions" aria-label="Suggested questions">
            {signals.slice(0, 3).map((signal) => (
              <button key={signal.id} onClick={() => void sendMessage(undefined, `Summarize ${signal.title}.`)} type="button">
                <Sparkles size={14} aria-hidden="true" /> {signal.title}
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