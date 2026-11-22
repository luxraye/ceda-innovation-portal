import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callRanking } from "@/lib/ranking";
import { NightEyebrow, PageHeader, Req, ScoreBar, Stat, StatusBadge, Tone, WorkspaceHero } from "@/components/ui";
import { PHOTOS } from "@/lib/photos";
import { pula } from "@/lib/format";

export const metadata = { title: "Committee board" };

export default async function AdjudicatorBoard({ searchParams }: { searchParams: Promise<{ call?: string }> }) {
  await requireRole("ADJUDICATOR");
  const { call: callParam } = await searchParams;
  const calls = await prisma.call.findMany({ where: { status: { not: "DRAFT" } }, orderBy: { closesAt: "asc" } });
  const call = calls.find((c) => c.slug === callParam) ?? calls.find((c) => c.status === "REVIEW") ?? calls[0];
  if (!call) return <PageHeader title="Committee board" subtitle="No calls yet." />;
  const [subs, ranking] = await Promise.all([
    prisma.submission.findMany({
      where: { callId: call.id, status: { notIn: ["DRAFT", "WITHDRAWN"] } },
      include: { stage: true, org: true, assignments: true },
    }),
    callRanking(call.id),
  ]);
  const atCommittee = subs.filter((s) => s.stage?.kind === "ADJUDICATION" && !["DECLINED", "AWARDED"].includes(s.status));
  const panelReady = subs.filter((s) => s.stage?.kind === "PANEL" && s.assignments.length > 0 && s.assignments.every((a) => a.status === "DONE" || a.status === "CONFLICT") && !["DECLINED"].includes(s.status));
  const awarded = subs.filter((s) => s.status === "AWARDED");
  const awardedTotal = awarded.reduce((a, s) => a + (s.awardAmount ?? 0), 0);
  const sortByRank = (list: typeof subs) => [...list].sort((a, b) => (ranking.get(b.id)?.normalised ?? -1) - (ranking.get(a.id)?.normalised ?? -1));

  const Row = ({ s, i }: { s: (typeof subs)[number]; i: number }) => {
    const r = ranking.get(s.id);
    return (
      <Link href={`/app/adjudicator/submissions/${s.id}`} className="grid grid-cols-[2rem_1fr] items-center gap-4 p-4 hover:bg-sky-50/60 sm:grid-cols-[2rem_1fr_9rem_6rem_6rem]">
        <span className="font-display text-lg font-semibold text-sky-600">{i + 1}</span>
        <span className="min-w-0">
          <span className="block truncate font-semibold text-navy-900">{s.title}</span>
          <span className="block truncate text-xs text-slate-500">{s.reference} · {s.org.name} · {s.org.district}</span>
        </span>
        <span className="hidden sm:block">{r ? <><span className="text-sm font-semibold text-navy-900">{r.normalised}</span><span className="text-xs text-slate-500"> norm · {r.raw} raw</span><ScoreBar value={r.normalised} /></> : <span className="text-xs text-slate-400">No scores</span>}</span>
        <span className="hidden text-sm sm:block">{r ? <span className={r.flagged ? "inline-flex items-center gap-1 font-semibold text-gold-600" : "text-slate-600"}>{r.flagged && <AlertTriangle className="h-3.5 w-3.5" />}±{r.spread}</span> : "-"}</span>
        <span className="hidden sm:block"><StatusBadge status={s.status} /></span>
      </Link>
    );
  };
  const Head = () => (
    <div className="hidden grid-cols-[2rem_1fr_9rem_6rem_6rem] gap-4 border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500 sm:grid">
      <span>#</span><span>Idea</span><span>Score</span><span>Spread</span><span>Status</span>
    </div>
  );

  return (
    <div>
      <WorkspaceHero
        photo={PHOTOS.delta}
        eyebrow={<><NightEyebrow>Committee board</NightEyebrow><Req k="b" /><Req k="d" /></>}
        title={`${atCommittee.length} ideas await`}
        accent="your decision."
        subtitle="Ranked by normalised panel score, which evens out harsh and generous judges. A high spread means the panel disagreed, so look closer before deciding."
        actions={calls.map((c) => (
          <Link key={c.id} href={`/app/adjudicator?call=${c.slug}`} className={c.id === call.id ? "btn-light" : "btn-glass"}>{c.title.replace(/ 2026$/, "").replace(/ (Challenge|Innovation Call)$/, "")}</Link>
        ))}
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Awaiting committee" value={atCommittee.length} accent />
        <Stat label="Panel finished" value={panelReady.length} hint="Ready to advance or decline" />
        <Stat label="Awarded" value={awarded.length} />
        <Stat label="Committed" value={pula(awardedTotal)} hint={`of ${pula(call.prizePool)} pool`} />
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-navy-900">At committee stage <Tone tone="gold" className="ml-2">Your decision</Tone></h2>
        <div className="card divide-y divide-slate-100 overflow-hidden"><Head />{sortByRank(atCommittee).map((s, i) => <Row key={s.id} s={s} i={i} />)}{atCommittee.length === 0 && <p className="p-5 text-sm text-slate-500">Nothing waiting for the committee.</p>}</div>
      </section>
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-navy-900">Panel review complete</h2>
        <div className="card divide-y divide-slate-100 overflow-hidden"><Head />{sortByRank(panelReady).map((s, i) => <Row key={s.id} s={s} i={i} />)}{panelReady.length === 0 && <p className="p-5 text-sm text-slate-500">No finished panels right now.</p>}</div>
      </section>
      {awarded.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-navy-900">Awarded</h2>
          <div className="card divide-y divide-slate-100 overflow-hidden">{sortByRank(awarded).map((s, i) => <Row key={s.id} s={s} i={i} />)}</div>
        </section>
      )}
    </div>
  );
}
