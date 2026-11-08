import { CalendarDays, MapPin, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { AzurePhoto } from "@/components/photo";
import { EVENT_KINDS } from "@/lib/arena";
import { eventPhoto } from "@/lib/photos";
import { fmtDate } from "@/lib/format";
import { toggleSeat } from "@/app/actions/arena";

export const metadata = { title: "Events" };

export default async function AppEvents() {
  const user = await requireRole("INNOVATOR");
  const events = await prisma.event.findMany({
    where: { endsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
    include: { _count: { select: { attendees: true } }, attendees: { where: { userId: user.id }, select: { id: true } } },
  });
  return (
    <div>
      <PageHeader
        eyebrow={<span className="eyebrow text-sky-700">Competitions & events</span>}
        title="Events"
        subtitle="Hackathons, bootcamps and pitch nights across Botswana. Attending adds points to your Innovator Index."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {events.map((e) => {
          const booked = e.attendees.length > 0;
          const full = e._count.attendees >= e.seats;
          return (
            <article key={e.id} className="card group flex flex-col overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <AzurePhoto src={eventPhoto(e.kind)} alt="" vivid sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0 transition duration-700 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent" />
                <span className="absolute bottom-3 left-5 chip bg-sky-400 text-navy-950 ring-sky-300">{EVENT_KINDS[e.kind as keyof typeof EVENT_KINDS]}</span>
                <span className="absolute right-5 bottom-3 chip bg-white/90 text-navy-950 ring-white">+{e.bonus} Index</span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h2 className="text-lg text-navy-950">{e.title}</h2>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">{e.summary}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {fmtDate(e.startsAt)}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {e._count.attendees}/{e.seats} seats</span>
                </div>
                <form action={toggleSeat} className="mt-5">
                  <input type="hidden" name="slug" value={e.slug} />
                  <button className={booked ? "btn-ghost" : "btn-primary"} disabled={!booked && full}>
                    {booked ? "Seat booked · release it" : full ? "Event full" : "Book a seat"}
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
