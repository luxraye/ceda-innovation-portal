import { Check, RotateCcw, X } from "lucide-react";
import { PIPELINE, STAGE_META, type Stage } from "@/lib/stages";
import { cn } from "@/lib/utils";

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  const m = STAGE_META[stage];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        m.tone,
        className,
      )}
    >
      {m.label}
    </span>
  );
}

/** Horizontal tracker showing how far an idea has travelled through the pipeline. */
export function StageTracker({ stage, compact = false }: { stage: Stage; compact?: boolean }) {
  const idx = PIPELINE.indexOf(stage);
  const off = stage === "rejected" || stage === "revision_requested";
  const steps = PIPELINE;
  return (
    <div>
      <ol className={cn("grid gap-1.5", compact ? "grid-cols-6" : "grid-cols-6 gap-2")}>
        {steps.map((s, i) => {
          const done = idx >= 0 && i < idx;
          const current = i === idx;
          return (
            <li key={s} className="min-w-0">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  done && "bg-gradient-ember",
                  current && "bg-gradient-ember animate-pulse",
                  !done && !current && "bg-border",
                )}
              />
              {!compact && (
                <p
                  className={cn(
                    "mt-2 truncate text-[11px] font-semibold uppercase tracking-wider",
                    current ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {STAGE_META[s].label}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {off && !compact && (
        <p
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 text-xs font-semibold",
            stage === "rejected" ? "text-destructive" : "text-accent",
          )}
        >
          {stage === "rejected" ? <X className="size-3.5" /> : <RotateCcw className="size-3.5" />}
          {stage === "rejected"
            ? "This idea did not progress this round."
            : "The panel has asked for changes. Update and resubmit."}
        </p>
      )}
      {stage === "awarded" && !compact && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <Check className="size-3.5" /> Awarded. Congratulations!
        </p>
      )}
    </div>
  );
}
