import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Trophy } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
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
    <div>
      <section className="sky-gradient">
        <PublicHeader />
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-14 md:px-8">
          <Link href="/calls" className="text-sm font-medium text-sky-700 hover:underline">All calls</Link>
          <div className="mt-4 text-sm font-semibold tracking-wide text-sky-700 uppercase">{call.theme}</div>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold text-navy-900 md:text-5xl">{call.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-700">{call.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {call.status === "OPEN" ? (
              <Link href={applyHref} className="btn-primary px-6 py-3 text-base">{session?.role === "INNOVATOR" ? "Start your application" : session ? "Go to my workspace" : "Create an account to apply"}</Link>
            ) : (
              <span className="chip bg-indigo-100 px-3 py-1.5 text-sm text-indigo-800">Applications closed · panels are reviewing</span>
            )}
            {!session && call.status === "OPEN" && <Link href="/login" className="btn-ghost px-6 py-3 text-base">I already have an account</Link>}
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <section className="card p-7">
            <h2 className="text-xl font-bold text-navy-900">The challenge</h2>
            <div className="mt-3 space-y-3 whitespace-pre-line text-slate-700">{call.description}</div>
          </section>
          <section className="card p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-navy-900">How you'll be judged</h2>
              <span className="text-sm text-slate-500">Weights add up to 100</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">Every evaluator scores these criteria. Publishing them up front is part of keeping Sky fair.</p>
            <ul className="mt-5 space-y-4">
              {call.criteria.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-navy-900">{c.name}</span>
                    <span className="font-mono font-semibold text-sky-700">{c.weight}%</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-sky-500" style={{ width: `${c.weight}%` }} /></div>
                  <p className="mt-1 text-sm text-slate-600">{c.description}</p>
                </li>
              ))}
            </ul>
          </section>
          <section className="card p-7">
            <h2 className="text-xl font-bold text-navy-900">The stages your idea will pass through</h2>
            <ol className="mt-5 space-y-4">
              {call.stages.map((s, i) => (
                <li key={s.id} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">{i + 1}</span>
                  <div>
                    <div className="font-semibold text-navy-900">{s.name} <span className="ml-1 text-xs font-normal text-slate-500">{STAGE_KINDS[s.kind as keyof typeof STAGE_KINDS]}</span></div>
                    <p className="text-sm text-slate-600">{s.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3"><Trophy className="h-6 w-6 text-gold-500" /><div><div className="text-xs text-slate-500">Prize pool</div><div className="font-display text-2xl font-bold text-navy-900">{pula(call.prizePool)}</div></div></div>
            <div className="mt-5 flex items-center gap-3"><CalendarDays className="h-6 w-6 text-sky-600" /><div><div className="text-xs text-slate-500">Window</div><div className="font-semibold text-navy-900">{fmtDate(call.opensAt)} to {fmtDate(call.closesAt)}</div>{call.status === "OPEN" && d > 0 && <div className="text-xs font-semibold text-gold-600">{d} days left</div>}</div></div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900">Who can apply</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {["Batswana citizens aged 18 to 35", "A company registered with CIPA", "More than 50% of shares held by youth", "No application fee"].map((x) => (
                <li key={x} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-navy-900">What you'll need</h3>
            <p className="mt-1 text-xs text-slate-500">{required.length} required answers. Your draft saves as you go.</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-700">
              {required.map((f) => <li key={f.key} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />{f.label}</li>)}
            </ul>
          </div>
        </aside>
      </div>
      <PublicFooter />
    </div>
  );
}
