import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Empty, PageHeader, Stat } from "@/components/ui";
import { DIFFICULTY, TRACKS, type Track } from "@/lib/arena";
import { timeAgo } from "@/lib/format";
import { reviewEvidence } from "@/app/actions/arena";

export const metadata = { title: "Range control" };

export default async function RangeControl() {
  await requireRole("ADMIN");
  const [pending, challenges, events] = await Promise.all([
    prisma.challengeSolve.findMany({ where: { status: "PENDING" }, include: { challenge: true, user: { include: { org: true } } }, orderBy: { solvedAt: "asc" } }),
    prisma.challenge.findMany({
      orderBy: { order: "asc" },
      include: { solves: { select: { status: true, attempts: true } } },
    }),
    prisma.event.findMany({ orderBy: { startsAt: "asc" }, include: { _count: { select: { attendees: true } } } }),
  ]);
  const solved = challenges.reduce((a, c) => a + c.solves.filter((s) => s.status === "SOLVED").length, 0);
  const attempts = challenges.reduce((a, c) => a + c.solves.reduce((x, s) => x + s.attempts, 0), 0);
  return (
    <div>
      <PageHeader
        eyebrow={<span className="eyebrow text-sky-700">Range control</span>}
        title="Challenges and events"
        subtitle="Verify evidence, see which challenges teams find hardest, and track event bookings."
      />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Evidence to verify" value={pending.length} hint="Oldest first" accent />
        <Stat label="Solves" value={solved} />
        <Stat label="Attempts" value={attempts} hint={`${attempts ? Math.round((solved / attempts) * 100) : 0}% success rate`} />
        <Stat label="Upcoming seats booked" value={events.filter((e) => e.startsAt > new Date()).reduce((a, e) => a + e._count.attendees, 0)} />
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold text-navy-950">Evidence waiting for you</h2>
      {pending.length ? (
        <div className="space-y-3">
          {pending.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-navy-950">{p.challenge.title}</div>
                  <div className="text-sm text-slate-500">
                    {p.user.org?.name ?? p.user.name} · sent {timeAgo(p.solvedAt)} · needs {p.challenge.minWords}+ words
                  </div>
                </div>
                <span className="font-mono text-sm text-sky-700">{p.challenge.points} pts</span>
              </div>
              <p className="mt-3 max-h-40 overflow-auto rounded-xl bg-slate-50 p-3 text-sm leading-relaxed whitespace-pre-wrap text-slate-700 ring-1 ring-slate-200">{p.evidence}</p>
              <div className="mt-4 flex gap-2">
                <form action={reviewEvidence}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="accept" value="1" />
                  <button className="btn-primary">Accept and award points</button>
                </form>
                <form action={reviewEvidence}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="accept" value="0" />
                  <button className="btn-ghost">Return for more detail</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="Nothing to verify" body="New evidence from innovators will appear here." />
      )}

      <h2 className="mt-10 mb-4 text-lg font-semibold text-navy-950">Challenge difficulty in practice</h2>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Challenge</th>
              <th className="px-3 py-3 font-medium">Track</th>
              <th className="px-3 py-3 font-medium">Set as</th>
              <th className="px-3 py-3 text-right font-medium">Solves</th>
              <th className="px-5 py-3 text-right font-medium">Success rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {challenges.map((c) => {
              const s = c.solves.filter((x) => x.status === "SOLVED").length;
              const a = c.solves.reduce((x, y) => x + y.attempts, 0);
              const rate = a ? Math.round((s / a) * 100) : 0;
              return (
                <tr key={c.id}>
                  <td className="px-5 py-3 text-navy-950">{c.title}</td>
                  <td className="px-3 py-3 text-slate-500">{TRACKS[c.track as Track].label}</td>
                  <td className="px-3 py-3 text-slate-500">{DIFFICULTY[c.difficulty as keyof typeof DIFFICULTY].label}</td>
                  <td className="px-3 py-3 text-right font-mono">{s}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-sky-500" style={{ width: `${rate}%` }} />
                      </div>
                      <span className="w-9 text-right font-mono text-xs">{rate}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
