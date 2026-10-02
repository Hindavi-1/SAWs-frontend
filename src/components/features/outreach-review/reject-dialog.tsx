"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmReject: (reason: string, category: string) => void;
  buyerName?: string;
  accountName?: string;
}

const REJECTION_CATEGORIES = [
  { id: "wrong_angle", label: "Wrong strategic angle / hook" },
  { id: "timing_off", label: "Timing is inappropriate" },
  { id: "wrong_contact", label: "Target contact is not the right decision maker" },
  { id: "incorrect_evidence", label: "Evidence or company claims are inaccurate" },
  { id: "tone_unnatural", label: "Tone feels too generic / unnatural" },
  { id: "custom", label: "Other reason" },
];

export function RejectDialog({
  open,
  onClose,
  onConfirmReject,
  buyerName,
  accountName,
}: RejectDialogProps) {
  const [category, setCategory] = React.useState("wrong_angle");
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = comment.trim()
      ? `${REJECTION_CATEGORIES.find((c) => c.id === category)?.label}: ${comment}`
      : REJECTION_CATEGORIES.find((c) => c.id === category)?.label || "Rejected by rep";
    onConfirmReject(finalReason, category);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-border-default bg-raised p-5 shadow-2xl animate-pop-in">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-risk-50 text-risk-500 dark:bg-risk-500/10">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 id="reject-dialog-title" className="text-sm font-bold text-text-primary">
                Reject Outreach Draft
              </h3>
              <p className="text-xs text-text-tertiary">
                {buyerName && accountName ? `${buyerName} · ${accountName}` : "Feedback logs for agent retraining"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-[var(--radius-sm)] p-1 text-text-tertiary hover:bg-sunken hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Reason Category
            </label>
            <div className="space-y-1.5">
              {REJECTION_CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border-subtle p-2 text-xs text-text-primary hover:bg-sunken cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="rejectCategory"
                    value={cat.id}
                    checked={category === cat.id}
                    onChange={(e) => setCategory(e.target.value)}
                    className="accent-accent-500"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              Feedback Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What specifically should the agent adjust when regenerating outreach for this buyer?"
              className="w-full rounded-[var(--radius-sm)] border border-border-default bg-sunken p-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
