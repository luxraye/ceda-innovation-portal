import Link from "next/link";
import { cookies } from "next/headers";
import { cn } from "@/lib/format";
import { REQUIREMENTS, SUBMISSION_STATUS, type RequirementKey } from "@/lib/domain";

const TONES: Record<string, string> = {
  slate: "bg-slate-50 text-slate-600 ring-slate-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  amber: "bg-amber-50 text-amber-800 ring-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  gold: "bg-gold-300/25 text-earth-700 ring-gold-400/50",
};
const DOTS: Record<string, string> = {
  slate: "bg-slate-400",
  sky: "bg-sky-500",
  indigo: "bg-indigo-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
  gold: "bg-gold-500",
};

export function Tone({ tone, children, className }: { tone: keyof typeof TONES | string; children: React.ReactNode; className?: string }) {
  return <span className={cn("chip", TONES[tone] ?? TONES.slate, className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const s = SUBMISSION_STATUS[status as keyof typeof SUBMISSION_STATUS] ?? { label: status, tone: "slate" };
  return (
    <Tone tone={s.tone}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DOTS[s.tone] ?? DOTS.slate)} />
      {s.label}
    </Tone>
  );
}

/** Shows which hackathon requirement a screen answers. Visible when Judge mode is on. */
export async function Req({ k, className }: { k: RequirementKey; className?: string }) {
  const store = await cookies();
  if (store.get("sky_judge")?.value !== "1") return null;
  return (
    <span className={cn("req-badge", className)} title="Where this screen meets the CEDA brief">
      {REQUIREMENTS[k]}
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="mb-3 flex flex-wrap items-center gap-2">{eyebrow}</div>}
        <h1 className="text-[26px] leading-tight text-navy-950 md:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-slate-500">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean }) {
  return (
    <div
      className={cn(
        "card relative overflow-hidden p-5",
        accent && "bg-[linear-gradient(160deg,#0a59de,#0f6fff_55%,#5ea3ff)] text-white shadow-[0_0_0_1px_#0a59de,0_12px_28px_-14px_rgb(15_111_255/0.7)]",
      )}
    >
      {accent && <div className="grid-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />}
      <div className={cn("relative text-[12.5px] font-medium", accent ? "text-white/75" : "text-slate-500")}>{label}</div>
      <div className={cn("relative mt-2 text-[30px] leading-none font-semibold tracking-[-0.03em] tabular-nums", accent ? "text-white" : "text-navy-950")}>
        {value}
      </div>
      {hint && <div className={cn("relative mt-2 text-xs", accent ? "text-white/70" : "text-slate-500")}>{hint}</div>}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-white to-slate-100 shadow-[0_0_0_1px_rgb(11_18_32/0.08),0_4px_10px_-4px_rgb(11_18_32/0.15)]">
        <span className="h-3 w-3 rounded-full bg-gradient-to-b from-sky-300 to-sky-600" />
      </div>
      <div className="font-medium text-navy-950">{title}</div>
      {body && <p className="mt-1 max-w-md text-sm text-slate-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Callout({ title, children, tone = "sky" }: { title?: string; children: React.ReactNode; tone?: "sky" | "gold" | "rose" | "emerald" }) {
  const map = {
    sky: "bg-sky-50/80 text-sky-900 ring-sky-200 before:bg-sky-500",
    gold: "bg-gold-300/20 text-earth-700 ring-gold-400/40 before:bg-gold-500",
    rose: "bg-rose-50 text-rose-900 ring-rose-200 before:bg-rose-500",
    emerald: "bg-emerald-50 text-emerald-900 ring-emerald-200 before:bg-emerald-500",
  };
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl py-3 pr-4 pl-5 text-sm leading-relaxed ring-1 ring-inset before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
        map[tone],
      )}
    >
      {title && <div className="mb-0.5 font-semibold">{title}</div>}
      {children}
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="font-medium text-sky-700 underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

export function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-sky-600" style={{ width: `${pct}%` }} />
    </div>
  );
}
