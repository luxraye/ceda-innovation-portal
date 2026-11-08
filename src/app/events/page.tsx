import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PublicFooter, PublicHero } from "@/components/public-chrome";
import { EVENT_KINDS } from "@/lib/arena";
import { TermLabel } from "@/components/arena-ui";
import { fmtDate } from "@/lib/format";
import { toggleSeat } from "@/app/actions/arena";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await getSession();
  const events = await prisma.event.findMany({ orderBy: { startsAt: "asc" }, include: { _count: { select: { attendees: true } }, attendees: { select: { userId: true } } } });
  const now = Date.now();
  const upcoming = events.filter((e) => e.endsAt.getTime() >= now);
  const past = events.filter((e) => e.endsAt.getTime() < now).reverse();
  const innovator = session?.role === "INNOVATOR";
  return (
    <div className="night min-h-screen">
      <PublicHero
        eyebrow="Competitions & events"
        title={
          <>
            Meet the panel <span className="text-sky-300">before it meets you.</span>
          </>
        }
        body="Hackathons, bootcamps and pitch nights run with CEDA and partners across Botswana. Attending adds points to your Innovator Index."
      />
      <main className="mx-auto max-w-7xl space-y-14 px-4 pb-24 md:px-8">
        <section>
          <TermLabel>Upcoming</TermLabel>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {upcoming.map((e) => {
              const booked = innovator && e.attendees.some((a) => a.userId === session!.sub);
              const full = e._count.attendees >= e.seats;
              return (
                <div key={e.id} className="panel-dark flex flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="term text-sky-300">{EVENT_KINDS[e.kind as keyof typeof EVENT_KINDS]}</span>
                    <span className="term text-gold-300/80">+{e.bonus} index</span>
                  </div>
                  <h2 className="mt-4 text-2xl text-white">{e.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">{e.summary}</p>
                  <div className="mt-5 grid gap-2 text-[13px] text-white/60 sm:grid-cols-3">
                    <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-sky-300" /> {fmtDate(e.startsAt)}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-sky-300" /> {e.district}</span>
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-sky-300" /> {e._count.attendees}/{e.seats} seats</span>
                  </div>
                  <div className="mt-2 text-xs text-white/40">{e.location}{e.partner ? ` · with ${e.partner}` : ""}</div>
                  <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.min(100, (e._count.attendees / e.seats) * 100)}%` }} />
                  </div>
                  <div className="mt-5">
                    {innovator ? (
                      <form action={toggleSeat}>
                        <input type="hidden" name="slug" value={e.slug} />
                        <button className={booked ? "btn-glass" : "btn-primary"} disabled={!booked && full}>
                          {booked ? "Seat booked · release it" : full ? "Event full" : "Book a seat"}
                        </button>
                      </form>
                    ) : (
                      <Link href={session ? "/events" : "/login?next=/events"} className="btn-glass">
                        {session ? "Innovator accounts can book seats" : "Sign in to book a seat"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <TermLabel>Past events</TermLabel>
          <ul className="mt-5 divide-y divide-white/[0.07] rounded-2xl ring-1 ring-white/[0.07]">
            {past.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="text-white">{e.title}</div>
                  <div className="text-xs text-white/40">{fmtDate(e.startsAt)} · {e.location}</div>
                </div>
                <span className="font-mono text-xs text-white/50">{e._count.attendees} took part</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
