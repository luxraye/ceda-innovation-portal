import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, CheckCircle2, Trophy } from "lucide-react";
import { PublicFooter, PublicHero } from "@/components/public-chrome";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { daysUntil, fmtDate, parseJson, pula } from "@/lib/format";
import { STAGE_KINDS, type FormField } from "@/lib/domain";

export const dynamic = "force-dynamic";

export default async function CallPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const call = await prisma.call.findUnique({
    where: { slug },
    include: { stages: { orderBy: { order: "asc" } }, criteria: { orderBy: { order: "asc" } } },
  });
  if (!call || call.status === "DRAFT") notFound();
  const session = await getSession();
  const fields = parseJson<FormField[]>(call.formSchema, []);
  const required = fields.filter((f) => f.required);
  const d = daysUntil(call.closesAt);
  const applyHref = session?.role === "INNOVATOR" ? `/app/innovator/apply/${call.id}` : session ? "/app" : `/register`;
  return (
    <div className="bg-slate-50">
      <PublicHero
        eyebrow={
          <span className="flex items-center gap-3">
            <Link href="/calls" className="text-white/50 hover:text-white">All calls</Link>
            <span className="text-white/20">/</span>
            {call.theme}
          </span>
        }
        title={call.title}
        body={call.tagline}
      >
        <div className="mt-9 flex flex-wrap items-center gap-3">
          {call.status === "OPEN" ? (
            <Link href={applyHref} className="btn-light btn-lg">
              {session?.role === "INNOVATOR" ? "Start your application" : session ? "Go to my workspace" : "Create an account to apply"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="chip h-8 bg-white/5 px-3 text-sm text-white/70 ring-white/15">Applications closed · panels are reviewing</span>
          )}
          {!session && call.status === "OPEN" && <Link href="/login" className="btn-glass btn-lg">I already have an account</Link>}
        </div>
        <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.08] ring-1 ring-white/[0.08] sm:grid-cols-4">
          {[
            ["Prize pool", pula(call.prizePool)],
            ["Opens", fmtDate(call.opensAt)],
            ["Closes", fmtDate(call.closesAt)],
            ["Time left", call.status === "OPEN" && d > 0 ? `${d} days` : "Closed"],
          ].map(([k, v]) => (
            <div key={k} className="bg-navy-950/80 px-5 py-4 backdrop-blur">
              <dt className="text-xs text-white/40">{k}</dt>
              <dd className="mt-1 text-lg font-semibold tracking-tight text-white tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
      </PublicHero>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 md:px-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <section className="card p-7 md:p-8">
            <div className="eyebrow text-sky-700">The challenge</div>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed whitespace-pre-line text-slate-700">{call.description}</div>
          </section>
          <section className="card p-7 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="eyebrow text-sky-700">How you'll be judged</div>
              <span className="font-mono text-[11px] text-slate-400">Σ weights = 100</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">Every evaluator scores these criteria. Publishing them up front is part of keeping Sky fair.</p>
            <ul className="mt-6 space-y-5">
              {call.criteria.map((c) => (
                <li key={c.id}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium text-navy-950">{c.name}</span>
                    <span className="font-mono text-[13px] font-medium text-sky-700">{c.weight}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-sky-600" style={{ width: `${Math.min(100, c.weight * 2.5)}%` }} />
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500">{c.description}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-7 md:p-8">
            <div className="eyebrow text-sky-700">The stages your idea will pass through</div>
            <ol className="relative mt-6 space-y-6">
              <span className="absolute top-3 bottom-3 left-[15px] w-px bg-slate-200" aria-hidden="true" />
              {call.stages.map((s, i) => (
                <li key={s.id} className="relative flex gap-4">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-mono text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <div className="font-medium text-navy-950">
                      {s.name} <span className="ml-1 text-xs font-normal text-slate-400">{STAGE_KINDS[s.kind as keyof typeof STAGE_KINDS]}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-4 bg-gradient-to-br from-sky-600 to-sky-800 p-6 text-white">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <Trophy className="h-5 w-5 text-gold-300" />
              </span>
              <div>
                <div className="text-xs text-white/70">Prize pool</div>
                <div className="text-2xl font-semibold tracking-tight">{pula(call.prizePool)}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6">
              <CalendarDays className="h-5 w-5 text-slate-400" />
              <div className="text-sm">
                <div className="text-xs text-slate-500">Window</div>
                <div className="font-medium text-navy-950">{fmtDate(call.opensAt)} to {fmtDate(call.closesAt)}</div>
              </div>
            </div>
          </div>
          <div className="card p-6">
            <h3 className="text-base text-navy-950">Who can apply</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
              {["Batswana citizens aged 18 to 35", "A company registered with CIPA", "More than 50% of shares held by youth", "No application fee"].map((x) => (
                <li key={x} className="flex gap-2.5"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-base text-navy-950">What you'll need</h3>
            <p className="mt-1 text-xs text-slate-500">{required.length} required answers. Your draft saves as you go.</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {required.map((f) => <li key={f.key} className="flex gap-2.5"><span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-500" />{f.label}</li>)}
            </ul>
          </div>
        </aside>
      </div>
      <PublicFooter />
    </div>
  );
}
