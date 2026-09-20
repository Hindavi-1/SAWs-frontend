import { ConfidenceBadge } from "@/components/ui/badge";
import { MODULE_SHORT } from "@/lib/stage-meta";
import type { EvidenceItem } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-text-tertiary">No evidence collected yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-[var(--radius-sm)] border border-border-subtle p-3">
          <p className="text-sm text-text-primary">{item.claim}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-tertiary">
            <a href={item.sourceUrl ?? "#"} className="flex items-center gap-1 font-medium text-text-secondary hover:text-accent-500">
              {item.sourceName}
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>{timeAgo(item.collectedAt)}</span>
            <span className="rounded-full bg-sunken px-1.5 py-0.5 text-[10px]">{MODULE_SHORT[item.moduleId]}</span>
            <ConfidenceBadge level={item.confidence} />
          </div>
        </li>
      ))}
    </ul>
  );
}
