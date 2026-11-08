import { cn } from "@/lib/format";
import { Check } from "lucide-react";

type StageLite = { id: string; name: string; order: number };

/** Horizontal progress through a call's stages, like a parcel tracker. */
export function StageTracker({
  stages,
  currentStageId,
  status,
}: {
  stages: StageLite[];
  currentStageId: string | null;
  status: string;
}) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);
  const all = [{ id: "submitted", name: "Submitted", order: 0 }, ...sorted];
  const currentIdx = status === "DRAFT" ? -1 : currentStageId ? all.findIndex((s) => s.id === currentStageId) : 0;
  const finished = status === "AWARDED";
  const stopped = status === "DECLINED" || status === "WITHDRAWN";
  return (
    <ol className="flex w-full items-start" aria-label="Progress through the call stages">
      {all.map((s, i) => {
        const done = finished || i < currentIdx;
        const active = !finished && i === currentIdx;
        return (
          <li key={s.id} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className={cn("absolute top-3.5 right-1/2 h-px w-full -translate-y-1/2", i <= currentIdx || finished ? "bg-sky-500" : "bg-slate-200")}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-7 w-7 items-center justify-center rounded-full font-mono text-[11px] font-medium",
                done && "bg-gradient-to-b from-sky-500 to-sky-600 text-white shadow-[0_2px_6px_-1px_rgb(10_168_92/0.5)]",
                active && !stopped && "animate-pulse-ring bg-white text-sky-700 ring-2 ring-sky-500",
                active && stopped && "bg-rose-50 text-rose-600 ring-2 ring-rose-400",
                !done && !active && "bg-white text-slate-400 ring-1 ring-slate-200",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn("mt-2.5 px-1 text-[11px] leading-tight sm:text-xs", active ? "font-medium text-navy-950" : "text-slate-500")}>
              {s.name}
            </span>
            {active && <span className="sr-only">(current stage)</span>}
          </li>
        );
      })}
    </ol>
  );
}
