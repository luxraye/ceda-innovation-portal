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
                className={cn("absolute top-4 right-1/2 h-0.5 w-full -translate-y-1/2", i <= currentIdx || finished ? "bg-sky-500" : "bg-slate-200")}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold",
                done && "border-sky-600 bg-sky-600 text-white",
                active && !stopped && "animate-pulse-ring border-sky-600 bg-white text-sky-700",
                active && stopped && "border-rose-500 bg-rose-50 text-rose-600",
                !done && !active && "border-slate-200 bg-white text-slate-400",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn("mt-2 px-1 text-[11px] leading-tight font-medium sm:text-xs", active ? "text-navy-900" : "text-slate-500")}>
              {s.name}
            </span>
            {active && <span className="sr-only">(current stage)</span>}
          </li>
        );
      })}
    </ol>
  );
}
