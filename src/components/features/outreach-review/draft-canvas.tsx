"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { EmailAddress, OutreachMessage } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SequenceTimeline } from "./sequence-timeline";
import {
  ShieldCheck,
  Check,
  X,
  RotateCcw,
  Copy,
  ExternalLink,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toaster";

interface DraftCanvasProps {
  draft: OutreachMessage;
  allAccountMessages: OutreachMessage[];
  /** Company address book, used to pick the From: mailbox for the send. */
  senderAddresses: EmailAddress[];
  onApprove: (
    draftId: string,
    editedBody: string,
    editedSubject?: string,
    sendOptions?: { recipientEmail?: string; senderEmail?: string }
  ) => Promise<void> | void;
  onReject: () => void;
  /** Persist a new From: mailbox so it can be reused on future sends. */
  onAddSenderAddress: (email: string) => Promise<void>;
  onSelectSequenceStep?: (stepNumber: number) => void;
}

export function DraftCanvas({
  draft,
  allAccountMessages,
  senderAddresses,
  onApprove,
  onReject,
  onAddSenderAddress,
  onSelectSequenceStep,
}: DraftCanvasProps) {
  const [subject, setSubject] = React.useState(draft.subject || "");
  const [body, setBody] = React.useState(draft.body || "");
  // Addressing is editable per draft; the buyer's email is the starting point.
  const [recipientEmail, setRecipientEmail] = React.useState(
    draft.recipientEmail || draft.buyerEmail || ""
  );
  const [senderEmail, setSenderEmail] = React.useState(
    draft.senderEmail || senderAddresses.find((a) => a.isDefault)?.email || senderAddresses[0]?.email || ""
  );
  const [isDirty, setIsDirty] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [isAddingSender, setIsAddingSender] = React.useState(false);
  const [newSenderEmail, setNewSenderEmail] = React.useState("");

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    setIsDirty(true);
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    setIsDirty(true);
  };

  const handleRecipientChange = (val: string) => {
    setRecipientEmail(val);
    setIsDirty(true);
  };

  const handleSenderChange = (val: string) => {
    setSenderEmail(val);
    setIsDirty(true);
  };

  const handleAddSender = async () => {
    const email = newSenderEmail.trim();
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email address to add it.");
      return;
    }
    try {
      await onAddSenderAddress(email);
      setSenderEmail(email);
      setNewSenderEmail("");
      setIsAddingSender(false);
      setIsDirty(true);
    } catch (e) {
      toast.error("Could not add this email address", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  const handleReset = () => {
    setSubject(draft.subject || "");
    setBody(draft.body || "");
    setRecipientEmail(draft.recipientEmail || draft.buyerEmail || "");
    setSenderEmail(draft.senderEmail || "");
    setIsDirty(false);
    toast("Reset draft to agent's original version");
  };

  const handleCopy = () => {
    const fullText = draft.channel === "email" ? `Subject: ${subject}\n\n${body}` : body;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("Copied draft to clipboard");
  };

  const handleApproveClick = async () => {
    setIsSending(true);
    try {
      await onApprove(draft.id, body, subject, { recipientEmail, senderEmail });
    } finally {
      setIsSending(false);
    }
  };

  // One-click AI tone polish transforms
  const applyTonePolish = (type: "shorter" | "direct" | "technical" | "roi") => {
    let newBody = body;

    switch (type) {
      case "shorter":
        newBody = body
          .split("\n\n")
          .filter((_, idx) => idx !== 2) // trim middle paragraph
          .join("\n\n");
        toast("Agent shortened draft by 35%");
        break;
      case "direct":
        newBody = body.replace(
          /Worth a 12-minute intro[\s\S]*?peer Series C fintechs handled this exact transition\?/,
          "Do you have 10 minutes this Thursday at 2pm CT for a quick benchmarking call?"
        );
        toast("Agent made CTA direct and specific");
        break;
      case "technical":
        newBody = body.replace(
          /money movement platform that plugs directly into existing banking APIs/g,
          "event-driven API reconciliation gateway supporting ISO 20022 and FedNow ACH pipelines"
        );
        toast("Agent emphasized technical API architecture");
        break;
      case "roi":
        if (!newBody.includes("82% reduction")) {
          newBody = `${newBody}\n\n(P.S. Portside Capital eliminated 82% of reconciliation exceptions within 45 days of deployment.)`;
          toast("Agent inserted peer ROI proof");
        }
        break;
    }

    setBody(newBody);
    setIsDirty(true);
  };

  const isApproved = draft.status === "approved";
  const isRejected = draft.status === "rejected";
  const isSent = draft.status === "sent";
  const isEmail = draft.channel === "email";
  const canSend = isEmail && !isSent && Boolean(recipientEmail.trim()) && Boolean(senderEmail.trim());

  return (
    <div className="flex h-full flex-col bg-raised overflow-hidden">
      {/* 1. Persistent Human-in-the-Loop Safeguard Banner */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-sunken/60 px-4 py-2 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-positive-600 dark:text-positive-400 shrink-0" />
          <span className="font-semibold text-text-primary">
            Human-in-the-Loop Guarantee:
          </span>
          <span className="text-text-secondary hidden sm:inline">
            No message is dispatched without rep approval.
          </span>
        </div>
        <div className="flex items-center gap-2">
          {draft.lastEditedAt && (
            <span className="text-[10px] text-text-tertiary">
              Edited by rep
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-border-default bg-raised px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-sunken hover:text-text-primary"
            title="Copy draft"
          >
            {copied ? <Check className="h-3 w-3 text-positive-500" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* 2. Sequence Timeline Bar */}
      <div className="px-4 py-2 border-b border-border-subtle bg-raised shrink-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            Multi-Channel Sequence Cadence
          </span>
          <span className="text-[10px] font-mono text-text-tertiary">
            Step {draft.sequenceStep || 1} of {draft.sequenceTotalSteps || allAccountMessages.length || 4}
          </span>
        </div>
        <SequenceTimeline
          messages={allAccountMessages}
          activeStepNumber={draft.sequenceStep || 1}
          onSelectStep={onSelectSequenceStep}
          compact
        />
      </div>

      {/* 3. Draft Header / Recipient Bar */}
      <div className="px-5 py-3 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text-primary truncate">
              {draft.buyerName}
            </h2>
            <span className="text-xs text-text-tertiary">·</span>
            <span className="text-xs text-text-secondary font-medium truncate">
              {draft.buyerTitle}
            </span>
            <Link
              href={`/accounts/${draft.accountId}`}
              className="inline-flex items-center gap-0.5 text-xs text-accent-500 hover:underline font-semibold"
            >
              @{draft.accountName}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <p className="text-[11px] text-text-tertiary mt-0.5">
            Channel: <span className="font-semibold uppercase">{draft.channel.replace("_", " ")}</span>
            {draft.dayOffset !== undefined ? ` · Scheduled Day ${draft.dayOffset}` : ""}
            {draft.stepTitle ? ` · ${draft.stepTitle}` : ""}
          </p>
        </div>

        {/* Tone Polish Buttons (Reserved Agent Violet Styling) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mr-1">
            Polish:
          </span>
          <button
            type="button"
            onClick={() => applyTonePolish("shorter")}
            className="rounded border border-[var(--agent-border)] bg-[var(--agent-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--agent-text)] hover:opacity-90 shadow-xs"
          >
            Shorter
          </button>
          <button
            type="button"
            onClick={() => applyTonePolish("direct")}
            className="rounded border border-[var(--agent-border)] bg-[var(--agent-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--agent-text)] hover:opacity-90 shadow-xs"
          >
            Direct CTA
          </button>
          <button
            type="button"
            onClick={() => applyTonePolish("technical")}
            className="rounded border border-[var(--agent-border)] bg-[var(--agent-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--agent-text)] hover:opacity-90 shadow-xs"
          >
            Technical
          </button>
          <button
            type="button"
            onClick={() => applyTonePolish("roi")}
            className="rounded border border-[var(--agent-border)] bg-[var(--agent-surface)] px-2 py-0.5 text-[11px] font-medium text-[var(--agent-text)] hover:opacity-90 shadow-xs"
          >
            + Case Study
          </button>
        </div>
      </div>

      {/* 3b. Editable Addressing — which mailbox sends it, and to whom */}
      {isEmail && (
        <div className="border-b border-border-subtle bg-sunken/40 shrink-0">
          <div className="px-5 py-2.5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2 min-w-0">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary shrink-0">
                From
              </label>
              <select
                data-draft-field="sender"
                value={senderEmail}
                onChange={(e) => handleSenderChange(e.target.value)}
                className="rounded-[var(--radius-sm)] border border-border-default bg-raised px-2 py-1 text-xs text-text-primary focus:border-accent-500 focus:outline-none max-w-[260px]"
              >
                <option value="">Select a sending email…</option>
                {senderAddresses.map((a) => (
                  <option key={a.id} value={a.email}>
                    {a.label ? `${a.email} — ${a.label}` : a.email}
                  </option>
                ))}
                {senderEmail && !senderAddresses.some((a) => a.email === senderEmail) && (
                  <option value={senderEmail}>{senderEmail}</option>
                )}
              </select>
              <button
                type="button"
                onClick={() => setIsAddingSender((v) => !v)}
                className="rounded border border-border-default bg-raised px-2 py-1 text-[11px] font-medium text-text-secondary hover:bg-sunken hover:text-text-primary shrink-0"
                title="Add a mailbox you'll send from later"
              >
                + Add email
              </button>
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary shrink-0">
                To
              </label>
              <input
                type="text"
                data-draft-field="recipient"
                value={recipientEmail}
                onChange={(e) => handleRecipientChange(e.target.value)}
                placeholder="buyer@company.com"
                className="flex-1 min-w-[200px] rounded-[var(--radius-sm)] border border-border-default bg-raised px-2.5 py-1 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-500 focus:outline-none"
              />
            </div>
          </div>

          {isAddingSender && (
            <div className="px-5 pb-2.5 flex items-center gap-2">
              <input
                type="text"
                value={newSenderEmail}
                onChange={(e) => setNewSenderEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSender();
                  }
                }}
                placeholder="you@yourcompany.com"
                className="w-[260px] rounded-[var(--radius-sm)] border border-border-default bg-raised px-2.5 py-1 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-500 focus:outline-none"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddSender}>
                Save email
              </Button>
              <span className="text-[10px] text-text-tertiary">
                Saved to your address book for future sends.
              </span>
            </div>
          )}
        </div>
      )}

      {/* 4. Canvas Editor Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Email Subject Line (if channel === email) */}
        {draft.channel === "email" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-text-secondary">Subject Line</label>
              <span className="text-[10px] font-mono text-text-tertiary">
                {subject.length} characters
              </span>
            </div>
            <input
              type="text"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full rounded-[var(--radius-sm)] border border-border-default bg-sunken/40 px-3 py-2 text-sm font-semibold text-text-primary focus:border-accent-500 focus:bg-raised focus:outline-none"
            />
          </div>
        )}

        {/* Message Body Editor */}
        <div className="space-y-1 h-full flex flex-col">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-text-secondary">
              {draft.channel === "call_script" ? "Call Script & Talking Points" : "Message Body"}
            </label>
            <div className="flex items-center gap-2 text-[10px] font-mono text-text-tertiary">
              {draft.channel === "linkedin" && (
                <span className={cn(body.length > 300 && "text-risk-500 font-bold")}>
                  {body.length}/300 chars
                </span>
              )}
              {isDirty && (
                <span className="text-accent-500 font-semibold">Unsaved edits</span>
              )}
            </div>
          </div>

          <textarea
            rows={14}
            value={body}
            onChange={(e) => handleBodyChange(e.target.value)}
            className="w-full flex-1 rounded-[var(--radius-sm)] border border-border-default bg-sunken/30 p-4 text-xs sm:text-sm font-sans leading-relaxed text-text-primary placeholder:text-text-tertiary focus:border-accent-500 focus:bg-raised focus:outline-none resize-none font-medium"
            placeholder="Write or refine the outreach message..."
          />
        </div>
      </div>

      {/* 5. Delivery status — only ever populated by a real send attempt */}
      {isEmail && (draft.sendError || isSent) && (
        <div
          className={cn(
            "flex items-start gap-2 border-t px-4 py-2 text-[11px] shrink-0",
            draft.sendError
              ? "border-risk-500/30 bg-risk-50 text-risk-700 dark:bg-risk-500/10 dark:text-risk-400"
              : "border-positive-500/30 bg-positive-50 text-positive-700 dark:bg-positive-500/10 dark:text-positive-400"
          )}
        >
          {draft.sendError ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-px" />
              <span>
                <span className="font-semibold">Not sent. </span>
                {draft.sendError}
              </span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 shrink-0 mt-px" />
              <span>
                <span className="font-semibold">Sent</span>
                {draft.sentAt ? ` on ${new Date(draft.sentAt).toLocaleString()}` : ""}
                {recipientEmail ? ` to ${recipientEmail}` : ""}
              </span>
            </>
          )}
        </div>
      )}

      {/* 6. Sticky Action Footer */}
      <div className="flex items-center justify-between border-t border-border-subtle bg-raised p-3.5 shrink-0">
        <div className="flex items-center gap-2">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary"
            >
              <RotateCcw className="h-3 w-3" /> Reset original
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onReject}
            disabled={isRejected}
            className="border-border-default hover:border-risk-500/30 hover:bg-risk-50 hover:text-risk-600 dark:hover:bg-risk-500/10"
          >
            <X className="h-3.5 w-3.5" /> Reject with Feedback [R]
          </Button>

          <Button
            type="button"
            variant="success"
            size="sm"
            onClick={handleApproveClick}
            disabled={isSending || isSent || (isEmail && !canSend)}
            title={
              isEmail && !canSend && !isSent
                ? "Add both a sender and a recipient email before sending."
                : undefined
            }
            className="shadow-sm font-bold px-4"
          >
            {isSending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {isSending
              ? "Sending…"
              : isSent
              ? "Sent"
              : isApproved && !isEmail
              ? "Approved"
              : isEmail
              ? "Approve & Send [A]"
              : "Approve Draft [A]"}
          </Button>
        </div>
      </div>
    </div>
  );
}
