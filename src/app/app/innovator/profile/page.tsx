import Link from "next/link";
import { BadgeCheck, CalendarDays, Eye, EyeOff, Flame, MapPin } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, StatusBadge } from "@/components/ui";
import { MyIndexCard } from "@/components/my-index";
import { EVENT_KINDS, INDEX_PARTS, TRACKS, getIndex, type Track } from "@/lib/arena";
import { cn, fmtDate } from "@/lib/format";

export const metadata = { title: "My profile" };

const NEXT_STEP: Record<string, { text: string; href: string }> = {
  panel: { text: "Strengthen your next application with pilot evidence and clear numbers.", href: "/app/calls" },
  progress: { text: "Submit an idea to an open call. Passing screening alone adds 110 points.", href: "/app/calls" },
  range: { text: "Solve challenges in tracks you haven't tried yet.", href: "/app/innovator/range" },
  events: { text: "Book a seat at an upcoming hackathon or bootcamp.", href: "/app/events" },
};

export default async function Profile() {
  const user = await requireRole("INNOVATOR");
  const [rows, solves, seats, subs] = await Promise.all([
    getIndex(),
    prisma.challengeSolve.findMany({ where: { userId: user.id, status: "SOLVED" }, include: { challenge: true }, orderBy: { solvedAt: "desc" } }),
    prisma.eventSeat.findMany({ where: { userId: user.id }, include: { event: true }, orderBy: { event: { startsAt: "desc" } } }),
    prisma.submission.findMany({ where: { ownerId: user.id }, include: { call: true }, orderBy: { updatedAt: "desc" } }),
  ]);
  const me = rows.find((r) => r.userId === user.id);
  const org = user.org;
  const trackDone = new Map<string, number>();
  solves.forEach((s) => trackDone.set(s.challenge.track, (trackDone.get(s.challenge.track) ?? 0) + 1));
  return (
    <div>
      <PageHeader
        eyebrow={<span className="eyebrow text-sky-700">Innovator profile</span>}
        title={org?.name ?? user.name}
        subtitle="How CEDA and partners see your company on Arena, and exactly how to climb."
        actions={
          <Link href="/app/leaderboard" className="btn-ghost">
            View the leaderboard
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <MyIndexCard userId={user.id} showLink={false} />

          <section className="card p-6">
            <h2 className="text-lg text-navy-950">Your Index, part by part</h2>
            <div className="mt-5 space-y-5">
              {INDEX_PARTS.map((p) => {
                const v = me?.parts[p.key] ?? 0;
                const pct = Math.round((v / p.max) * 100);
                return (
                  <div key={p.key}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium text-navy-950">{p.label}</span>
                      <span className="font-mono text-slate-500">
                        <span className="font-semibold text-navy-950">{v}</span> / {p.max}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{p.how}</p>
                    {pct < 80 && (
                      <Link href={NEXT_STEP[p.key].href} className="mt-1 inline-block text-xs font-medium text-sky-700 hover:underline">
                        Next step: {NEXT_STEP[p.key].text}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-navy-950">Range badges</h2>
              <Link href="/app/innovator/range" className="text-sm font-medium text-sky-700 hover:underline">Open the Range</Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {(Object.keys(TRACKS) as Track[]).map((t) => {
                const n = trackDone.get(t) ?? 0;
                return (
                  <div key={t} className={cn("rounded-xl p-3 ring-1", n ? "bg-navy-950 ring-sky-400/40" : "bg-slate-50 ring-slate-200")}>
                    <div className={cn("term", n ? "text-sky-300" : "text-slate-400")}>{TRACKS[t].label}</div>
                    <div className={cn("mt-1 font-mono text-xl", n ? "text-white" : "text-slate-300")}>{n}</div>
                  </div>
                );
              })}
            </div>
            <ul className="mt-5 divide-y divide-slate-100">
              {solves.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-slate-700">
                    {s.challenge.title}
                    {s.first && <Flame className="ml-1.5 inline h-3.5 w-3.5 text-gold-600" aria-label="First solve" />}
                  </span>
                  <span className="font-mono text-sky-700">+{s.points}</span>
                </li>
              ))}
              {!solves.length && <li className="py-3 text-sm text-slate-500">No challenges solved yet.</li>}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <div className="flex items-center gap-2 font-medium text-navy-950">
              {org?.name}
              {org?.verified && <BadgeCheck className="h-4 w-4 text-sky-600" aria-label="CIPA verified" />}
            </div>
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ["UIN", org?.uin],
                ["Sector", org?.sector || "Not set"],
                ["Youth shareholding", `${org?.youthShareholdingPct ?? 0}%`],
                ["Employees", org?.employees],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="text-right font-medium text-navy-950">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">District</dt>
                <dd className="flex items-center gap-1 font-medium text-navy-950"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {org?.district}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-navy-950">
              {me?.public ? <Eye className="h-4 w-4 text-sky-600" /> : <EyeOff className="h-4 w-4 text-slate-400" />}
              {me?.public ? "Shown by name on the leaderboard" : "Shown anonymously on the leaderboard"}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {me?.public
                ? "You agreed to be showcased. Partners can see your company name, district, sector and Index."
                : `Others see you as "${me?.display}". Turn on the showcase consent if you'd like partners to find you.`}
            </p>
            <Link href="/app/privacy" className="mt-3 inline-block text-xs font-medium text-sky-700 hover:underline">Change this in your privacy centre</Link>
          </section>

          <section className="card p-5">
            <div className="font-medium text-navy-950">Events</div>
            <ul className="mt-3 space-y-3 text-sm">
              {seats.map((s) => (
                <li key={s.id} className="flex items-start gap-2.5">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <div className="text-navy-950">{s.event.title}</div>
                    <div className="text-xs text-slate-500">
                      {EVENT_KINDS[s.event.kind as keyof typeof EVENT_KINDS]} · {fmtDate(s.event.startsAt)} ·{" "}
                      {s.attended ? <span className="text-sky-700">attended, +{s.event.bonus}</span> : s.event.startsAt > new Date() ? "booked" : "missed"}
                    </div>
                  </div>
                </li>
              ))}
              {!seats.length && <li className="text-slate-500">No events yet.</li>}
            </ul>
            <Link href="/app/events" className="mt-4 inline-block text-xs font-medium text-sky-700 hover:underline">Find an event</Link>
          </section>

          <section className="card p-5">
            <div className="font-medium text-navy-950">Ideas</div>
            <ul className="mt-3 space-y-3">
              {subs.map((s) => (
                <li key={s.id}>
                  <Link href={`/app/innovator/submissions/${s.id}`} className="block text-sm text-navy-950 hover:text-sky-700">{s.title}</Link>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <StatusBadge status={s.status} /> {s.call.title}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
