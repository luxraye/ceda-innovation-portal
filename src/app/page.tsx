import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
  Crosshair,
  FileLock2,
  Fingerprint,
  Gavel,
  Gauge,
  KeyRound,
  LineChart,
  MapPin,
  Radar,
  ScrollText,
  ShieldCheck,
  Smartphone,
  Sprout,
  Swords,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { daysUntil, fmtDate, pula, timeAgo } from "@/lib/format";
import { CountUp, Reveal, Spotlight } from "@/components/motion";
import { DISTRICTS } from "@/lib/domain";
import { EVENT_KINDS, TRACKS, districtLeague, getIndex, type Track } from "@/lib/arena";
import { IndexBar, IndexLegend, LeagueTable, TermLabel, TierBadge } from "@/components/arena-ui";

export const dynamic = "force-dynamic";

async function getData() {
  const [rows, calls, awarded, challenges, solves, recent, events] = await Promise.all([
    getIndex(),
    prisma.call.findMany({ where: { status: { in: ["OPEN", "REVIEW"] } }, orderBy: { closesAt: "asc" } }),
    prisma.submission.aggregate({ _sum: { awardAmount: true }, where: { status: "AWARDED" } }),
    prisma.challenge.findMany({ select: { track: true, points: true } }),
    prisma.challengeSolve.aggregate({ _sum: { points: true }, _count: true, where: { status: "SOLVED" } }),
    prisma.challengeSolve.findMany({ where: { status: "SOLVED" }, orderBy: { solvedAt: "desc" }, take: 14, include: { challenge: true } }),
    prisma.event.findMany({ where: { endsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 3, include: { _count: { select: { attendees: true } } } }),
  ]);
  const byUser = new Map(rows.map((r) => [r.userId, r]));
  const feed = recent.map((s) => ({ id: s.id, who: byUser.get(s.userId)?.display ?? "An innovator", what: s.challenge.title, pts: s.points, first: s.first, at: s.solvedAt }));
  const trackCounts = new Map<string, number>();
  challenges.forEach((c) => trackCounts.set(c.track, (trackCounts.get(c.track) ?? 0) + 1));
  return {
    rows,
    league: districtLeague(rows),
    calls,
    awarded: awarded._sum.awardAmount ?? 0,
    challenges: challenges.length,
    points: solves._sum.points ?? 0,
    solveCount: solves._count,
    feed,
    trackCounts,
    events,
  };
}

const BRIEF = [
  ["a", "Submission"],
  ["b", "Multi-level evaluation"],
  ["c", "Real-time tracking"],
  ["d", "Role-based security"],
  ["e", "Feedback & resubmission"],
  ["f", "Reporting"],
  ["g", "Modular & scalable"],
];

const PLATFORM = [
  { icon: Crosshair, tag: "RANGE", title: "Challenge engine", body: "Short, scored tasks across six tracks. Quizzes are marked instantly; evidence tasks are verified by CEDA staff. First solves earn a bonus." },
  { icon: Gauge, tag: "INDEX", title: "Innovator Index", body: "A 0 to 1000 rating built from panel scores, pipeline progress, challenges and events. Every point is explained, and it never decides an award on its own." },
  { icon: ScrollText, tag: "CALLS", title: "Guided submission", body: "One form per call, with eligibility checked up front. Every version is sealed with SHA-256 and a signed receipt." },
  { icon: ClipboardCheck, tag: "PANEL", title: "Blind, fair scoring", body: "Conflict declared before an idea opens. Scores are normalised so harsh and generous judges count equally." },
  { icon: Radar, tag: "LIVE", title: "Real-time tracking", body: "A live tracker for every idea, notifications at each stage, and a pipeline board for CEDA." },
  { icon: Building2, tag: "TALENT", title: "Talent directory", body: "CEDA and partners find ranked, verified youth companies by sector, district and tier, with consent." },
];

const AUDIENCES = [
  { icon: Sprout, title: "Young innovators", points: ["Train on the Range before you apply", "See exactly how to climb the Index", "Track every idea live and resubmit with feedback"], cta: { href: "/register", label: "Join the Arena" } },
  { icon: Gavel, title: "Evaluators & committee", points: ["Blind queue with conflict declaration", "Weighted, normalised rankings", "Decide with a recorded reason"], cta: { href: "/tour#b", label: "See the scoring screen" } },
  { icon: LineChart, title: "CEDA programme team", points: ["Run calls, events and challenges without a developer", "District league shows where to focus outreach", "Reports, CSV export and a tamper-evident audit trail"], cta: { href: "/tour#f", label: "See the reports" } },
  { icon: Users, title: "Partners & investors", points: ["Browse a ranked pipeline of verified companies", "Only companies that agreed to be showcased are named", "Co-host hackathons and bootcamps"], cta: { href: "/leaderboard", label: "View the leaderboard" } },
];

const BUILT_FOR = [
  { icon: Smartphone, title: "Any phone", body: "Every screen works on a small Android phone and a slow connection." },
  { icon: MapPin, title: "Hosted in Botswana", body: "Designed for in-country servers. Data stays home unless the law allows otherwise." },
  { icon: FileLock2, title: "Data Protection Act 2024", body: "Consent per purpose, data-rights requests, retention rules and a 72-hour breach clock." },
  { icon: KeyRound, title: "Open by design", body: "Calls, rubrics, stages and challenges are data. A Postgres database and API seams for scale." },
];

export default async function Home() {
  const d = await getData();
  const top = d.rows.slice(0, 6);
  const maxLeague = Math.max(1, ...d.league.map((l) => l.total));
  const pulaSense = d.rows.find((r) => r.org.startsWith("Pula Sense"));
  return (
    <div className="night min-h-screen overflow-x-clip">
      {/* Hero with live scoreboard */}
      <section className="noise relative isolate overflow-hidden">
        <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
        <div className="hex-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 -z-10 h-[680px] bg-[radial-gradient(55%_60%_at_75%_10%,rgb(10_168_92/0.22),transparent_70%)]" aria-hidden="true" />
        <PublicHeader />
        <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 pt-12 pb-20 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-28">
          <div>
            <div className="animate-rise inline-flex items-center gap-2 rounded-full bg-white/[0.04] py-1 pr-3 pl-1 text-xs ring-1 ring-white/10 backdrop-blur">
              <span className="term rounded-full bg-sky-400/15 px-2 py-0.5 text-sky-300 ring-1 ring-sky-400/30">National range</span>
              <span className="text-white/60">CEDA Innovation Portal · Botswana</span>
            </div>
            <h1 className="animate-rise mt-7 text-[50px] leading-[0.98] font-semibold text-white [animation-delay:80ms] sm:text-7xl lg:text-[82px]">
              <span className="text-gradient">Train. Compete.</span>
              <br />
              <span className="text-azure animate-shimmer">Get funded.</span>
            </h1>
            <p className="animate-rise mt-7 max-w-lg text-lg leading-relaxed text-white/60 [animation-delay:160ms]">
              Arena is a national innovation range for Botswana's youth-owned companies. Sharpen your idea on scored challenges, climb a
              transparent Innovator Index, and take your best work to CEDA calls where a fair panel decides.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/register" className="btn-primary btn-lg">
                Join the Arena <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/leaderboard" className="btn-glass btn-lg">
                <Trophy className="h-4 w-4 text-sky-300" /> Live leaderboard
              </Link>
            </div>
            <dl className="animate-rise mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/[0.07] [animation-delay:320ms] sm:grid-cols-4">
              {[
                { k: "Innovators ranked", v: <CountUp value={d.rows.length} /> },
                { k: "Range points earned", v: <CountUp value={d.points} /> },
                { k: "Calls live", v: <CountUp value={d.calls.length} /> },
                { k: "Awarded so far", v: <CountUp value={d.awarded} prefix="P" /> },
              ].map((x) => (
                <div key={x.k} className="bg-navy-950/80 px-5 py-4 backdrop-blur">
                  <dt className="text-xs text-white/40">{x.k}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-white tabular-nums">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Scoreboard */}
          <div className="animate-rise min-w-0 [animation-delay:200ms]">
            <div className="panel-dark scanlines relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-3">
                <div className="term flex items-center gap-2 text-white/70">
                  <span className="dot-live" /> Live · National Innovation League
                </div>
                <span className="term text-white/35">Season 2026</span>
              </div>
              <div className="grid gap-0 sm:grid-cols-[1fr_1.1fr] [&>*]:min-w-0">
                <div className="border-b border-white/[0.07] p-5 sm:border-r sm:border-b-0">
                  <div className="term text-white/40">District league</div>
                  <ul className="mt-4 space-y-3">
                    {d.league.slice(0, 6).map((l, i) => (
                      <li key={l.district}>
                        <div className="flex items-baseline justify-between text-[13px]">
                          <span className={i === 0 ? "font-medium text-white" : "text-white/70"}>
                            <span className="mr-2 font-mono text-[11px] text-white/35">{String(i + 1).padStart(2, "0")}</span>
                            {l.district}
                          </span>
                          <span className="font-mono text-[12px] text-sky-300 tabular-nums">{l.total.toLocaleString("en-BW")}</span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <div
                            className={i === 0 ? "h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-300" : "h-full rounded-full bg-sky-500/50"}
                            style={{ width: `${(l.total / maxLeague) * 100}%` }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5">
                  <div className="term flex items-center justify-between text-white/40">
                    <span>Top innovators</span>
                    <span>Index</span>
                  </div>
                  <div className="mt-2">
                    <LeagueTable rows={top} compact />
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden border-t border-white/[0.07] py-2.5">
                <div className="ticker flex w-max gap-8 pl-5 font-mono text-[11.5px] whitespace-nowrap text-white/50">
                  {[...d.feed, ...d.feed].map((f, i) => (
                    <span key={`${f.id}-${i}`}>
                      <span className="text-sky-400">+{f.pts}</span> {f.who} solved <span className="text-white/75">{f.what}</span>
                      {f.first && <span className="ml-1.5 text-gold-300">first solve</span>}
                      <span className="ml-1.5 text-white/30">{timeAgo(f.at)}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11.5px] text-white/35">Companies appear by name only if they agreed to be showcased. Others are shown anonymously.</p>
          </div>
        </div>
      </section>

      {/* The brief, answered */}
      <section className="border-y border-white/[0.06] bg-white/[0.015]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:gap-8 md:px-8">
          <div className="eyebrow shrink-0 text-white/35">Every function in the CEDA brief, §3.2</div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
            {BRIEF.map(([k, v]) => (
              <li key={k} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-sky-300/70">({k})</span> {v}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-gold-400/80">DPA</span> Data Protection Act 2024
            </li>
          </ul>
        </div>
      </section>

      {/* Platform */}
      <section id="how" className="mx-auto max-w-7xl scroll-mt-10 px-4 py-24 md:px-8 md:py-28">
        <Reveal className="max-w-3xl">
          <TermLabel>The platform</TermLabel>
          <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-5xl">
            One range for the whole journey, from <span className="text-sky-300">first idea</span> to <span className="text-gold-300">award.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/55">
            Train and get measured like a national competition, then apply through CEDA's fair, auditable pipeline. Six modules, one login.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORM.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05} className="h-full">
              <Spotlight className="card-dark group h-full p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 ring-1 ring-sky-400/25">
                    <p.icon className="h-5 w-5 text-sky-300" strokeWidth={1.6} />
                  </span>
                  <span className="term text-white/30">{p.tag}</span>
                </div>
                <div className="mt-6 text-[17px] font-medium tracking-tight text-white">{p.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{p.body}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Tracks */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 md:px-8 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <TermLabel>Disciplines</TermLabel>
            <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-[44px]">Six tracks. {d.challenges} challenges. Every one teaches what panels look for.</h2>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/55">
              Challenges are short and practical: size a market, price a product, write a 90-second pitch. Each one is drawn from what CEDA panels
              mark down most often.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/range" className="btn-primary">
                <Swords className="h-4 w-4" /> Enter the Range
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-px overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(TRACKS) as Track[]).map((t) => (
              <div key={t} className="bg-navy-950 p-5">
                <div className="flex items-center justify-between">
                  <span className="term text-sky-300">{TRACKS[t].label}</span>
                  <span className="font-mono text-[11px] text-white/35">{d.trackCounts.get(t) ?? 0} tasks</span>
                </div>
                <p className="mt-3 text-[13.5px] text-white/55">{TRACKS[t].hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <Reveal className="max-w-3xl">
            <TermLabel>Who it's for</TermLabel>
            <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-5xl">Built for everyone on the field.</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {AUDIENCES.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.06} className="h-full">
                <div className="card-dark flex h-full flex-col p-6">
                  <a.icon className="h-5 w-5 text-sky-300" strokeWidth={1.6} />
                  <div className="mt-5 font-medium text-white">{a.title}</div>
                  <ul className="mt-4 flex-1 space-y-2.5 text-[13.5px] text-white/55">
                    {a.points.map((p) => (
                      <li key={p} className="flex gap-2">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-sky-400" /> {p}
                      </li>
                    ))}
                  </ul>
                  <Link href={a.cta.href} className="term mt-6 text-sky-300 hover:text-sky-200">
                    {a.cta.label} →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Case study */}
      {pulaSense && (
        <section className="border-t border-white/[0.06] bg-[radial-gradient(60%_80%_at_20%_50%,rgb(10_168_92/0.12),transparent_70%)]">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 md:px-8 lg:grid-cols-2">
            <Reveal>
              <TermLabel>Case study · demo data</TermLabel>
              <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-[44px]">
                Pula Sense: from a thin first draft to the CEDA committee.
              </h2>
              <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-white/55">
                The panel asked for pilot evidence. Naledi's team ran the market-sizing and customer-interview challenges, resubmitted with results
                from 14 farms, and their normalised score jumped. Every step is on the record, and the Index shows exactly why they rank where they
                do.
              </p>
              <div className="mt-8 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-xl bg-white/[0.07] ring-1 ring-white/[0.07]">
                {[
                  { k: "Water saved", v: "38%" },
                  { k: "Pilot farms", v: "14" },
                  { k: "League rank", v: `#${pulaSense.rank}` },
                ].map((x) => (
                  <div key={x.k} className="bg-navy-950 px-4 py-3">
                    <div className="text-[11px] text-white/40">{x.k}</div>
                    <div className="mt-0.5 font-mono text-xl text-sky-300">{x.v}</div>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="panel-dark p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white">{pulaSense.display}</div>
                    <div className="text-xs text-white/40">
                      {pulaSense.district} · {pulaSense.sector}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-3xl font-semibold text-sky-300">{pulaSense.score}</div>
                    <TierBadge score={pulaSense.score} />
                  </div>
                </div>
                <IndexBar parts={pulaSense.parts} dark className="mt-6 h-2" />
                <div className="mt-3">
                  <IndexLegend dark />
                </div>
                <ol className="mt-6 space-y-3 border-l border-white/10 pl-5 text-[13px]">
                  {[
                    ["Submitted v1 to the Agri-Tech call", "text-white/60"],
                    ["Panel requested pilot evidence", "text-amber-300"],
                    ["Solved Market sizing and Unit economics on the Range", "text-sky-300"],
                    ["Resubmitted v2 with 14-farm pilot results", "text-white/60"],
                    ["Advanced to the CEDA innovation committee", "text-gold-300"],
                  ].map(([t, c]) => (
                    <li key={t} className={`relative ${c}`}>
                      <span className="absolute top-1.5 -left-[24.5px] h-2 w-2 rounded-full bg-current" />
                      {t}
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Events */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal className="max-w-2xl">
              <TermLabel>Competitions & events</TermLabel>
              <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-5xl">Hackathons, bootcamps and pitch nights, in every region.</h2>
            </Reveal>
            <Link href="/events" className="btn-glass">
              <CalendarDays className="h-4 w-4" /> All events
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {d.events.map((e) => (
              <div key={e.id} className="card-dark flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="term text-sky-300">{EVENT_KINDS[e.kind as keyof typeof EVENT_KINDS]}</span>
                  <span className="term text-white/35">+{e.bonus} index</span>
                </div>
                <div className="mt-4 text-lg font-medium text-white">{e.title}</div>
                <p className="mt-2 flex-1 text-[13.5px] text-white/50">{e.summary}</p>
                <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4 text-xs text-white/50">
                  <span>
                    {fmtDate(e.startsAt)} · {e.district}
                  </span>
                  <span className="font-mono">
                    {e._count.attendees}/{e.seats} seats
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calls */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <Reveal className="max-w-2xl">
            <TermLabel>Funding calls</TermLabel>
            <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-5xl">When you're ready, apply.</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {d.calls.map((c) => {
              const left = daysUntil(c.closesAt);
              return (
                <Link key={c.id} href={`/calls/${c.slug}`} className="card-dark group flex flex-col p-6 transition hover:bg-white/[0.06]">
                  <div className="flex items-center justify-between">
                    <span className="term text-white/40">{c.theme}</span>
                    <span className={`term ${c.status === "OPEN" ? "text-sky-300" : "text-amber-300"}`}>
                      {c.status === "OPEN" ? `${left} days left` : "In review"}
                    </span>
                  </div>
                  <div className="mt-4 text-lg font-medium text-white group-hover:text-sky-200">{c.title}</div>
                  <p className="mt-2 flex-1 text-[13.5px] text-white/50">{c.tagline}</p>
                  <div className="mt-5 font-mono text-sm text-gold-300">{pula(c.prizePool)} pool</div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Built for Botswana */}
      <section id="trust" className="scroll-mt-10 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8">
          <Reveal className="max-w-3xl">
            <TermLabel>Built for Botswana</TermLabel>
            <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-5xl">Secure, lawful and ready to scale.</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BUILT_FOR.map((b) => (
              <div key={b.title} className="rounded-2xl p-6 ring-1 ring-white/[0.08]">
                <b.icon className="h-5 w-5 text-sky-300" strokeWidth={1.6} />
                <div className="mt-5 font-medium text-white">{b.title}</div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-white/50">{b.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Fingerprint, t: "Hash-chained audit trail", h: "/tour#d" },
              { icon: ShieldCheck, t: "Role checks on every page and action", h: "/tour#d" },
              { icon: BadgeCheck, t: "Verify any submission receipt", h: "/verify" },
            ].map((x) => (
              <Link key={x.t} href={x.h} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-4 py-3 text-sm text-white/65 ring-1 ring-white/[0.07] hover:text-white">
                <x.icon className="h-4 w-4 text-sky-300" /> {x.t}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06]">
        <div className="hex-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-4xl px-4 py-32 text-center md:px-8">
          <Reveal>
            <Target className="mx-auto h-8 w-8 text-sky-300" strokeWidth={1.4} />
            <h2 className="mt-6 text-[40px] leading-[1.04] text-white md:text-6xl">
              {DISTRICTS.length} districts. One league. <span className="text-sky-300">Your move.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/55">
              If you're 18 to 35 and your company is majority youth-owned, the Arena is yours. Start with a five-minute challenge.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn-primary btn-lg">Create your account</Link>
              <Link href="/tour" className="btn-glass btn-lg">I'm a judge: show me around</Link>
            </div>
          </Reveal>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
