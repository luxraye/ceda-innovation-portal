import Link from "next/link";
import { cookies } from "next/headers";
import { cn } from "@/lib/format";
import { REQUIREMENTS, SUBMISSION_STATUS, type RequirementKey } from "@/lib/domain";

const TONES: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  sky: "bg-sky-100 text-sky-800",
  indigo: "bg-indigo-100 text-indigo-800",
  amber: "bg-amber-100 text-amber-800",
  emerald: "bg-emerald-100 text-emerald-800",
  rose: "bg-rose-100 text-rose-700",
  gold: "bg-gold-300/50 text-earth-700",
};

export function Tone({ tone, children, className }: { tone: keyof typeof TONES | string; children: React.ReactNode; className?: string }) {
  return <span className={cn("chip", TONES[tone] ?? TONES.slate, className)}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const s = SUBMISSION_STATUS[status as keyof typeof SUBMISSION_STATUS] ?? { label: status, tone: "slate" };
  return <Tone tone={s.tone}>{s.label}</Tone>;
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
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <div className="mb-2 flex flex-wrap items-center gap-2">{eyebrow}</div>}
        <h1 className="text-2xl font-bold text-navy-900 md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{subtitle}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: React.ReactNode; accent?: boolean }) {
  return (
    <div className={cn("card p-5", accent && "border-sky-200 bg-gradient-to-br from-sky-50 to-white")}>
      <div className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</div>
      <div className="font-display mt-1.5 text-3xl font-bold text-navy-900">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-3 h-12 w-12 rounded-full bg-sky-100" />
      <div className="font-semibold text-navy-900">{title}</div>
      {body && <p className="mt-1 max-w-md text-sm text-slate-500">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Callout({ title, children, tone = "sky" }: { title?: string; children: React.ReactNode; tone?: "sky" | "gold" | "rose" | "emerald" }) {
  const map = {
    sky: "border-sky-200 bg-sky-50 text-sky-900",
    gold: "border-gold-400/50 bg-gold-300/20 text-earth-700",
    rose: "border-rose-200 bg-rose-50 text-rose-900",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", map[tone])}>
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
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600" style={{ width: `${pct}%` }} />
    </div>
  );
}
