import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Bell,
  ClipboardCheck,
  FileLock2,
  Fingerprint,
  Gavel,
  GraduationCap,
  Inbox,
  KeyRound,
  LineChart,
  MailX,
  MessagesSquare,
  Scale,
  ScrollText,
  Send,
  ShieldCheck,
  Sprout,
  Trophy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { daysUntil, pula } from "@/lib/format";
import { JourneyCard } from "@/components/journey-card";
import { Globe } from "@/components/globe";
import { CountUp, Reveal, Spotlight } from "@/components/motion";
import { AzurePhoto, ParallaxBand, StoryGallery } from "@/components/photo";
import { PHOTOS, themePhoto } from "@/lib/photos";
import { DISTRICTS } from "@/lib/domain";

export const dynamic = "force-dynamic";

async function getStats() {
  const [calls, submitted, subs, awarded] = await Promise.all([
    prisma.call.findMany({ where: { status: { in: ["OPEN", "REVIEW"] } }, orderBy: { closesAt: "asc" } }),
    prisma.submission.count({ where: { status: { not: "DRAFT" } } }),
    prisma.submission.findMany({ where: { status: { not: "DRAFT" } }, select: { org: { select: { district: true } } } }),
    prisma.submission.aggregate({ _sum: { awardAmount: true }, where: { status: "AWARDED" } }),
  ]);
  const counts = new Map<string, number>();
  subs.forEach((s) => counts.set(s.org.district, (counts.get(s.org.district) ?? 0) + 1));
  const districts = DISTRICTS.map((name) => ({ name, count: counts.get(name) ?? 0 }));
  return { calls, submitted, districts, reached: counts.size, awarded: awarded._sum.awardAmount ?? 0 };
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

const STEPS = [
  { icon: Send, title: "Submit", who: "You", body: "One guided form. Sky checks eligibility and tells you exactly what's missing before you send." },
  { icon: BadgeCheck, title: "Screen", who: "CEDA team", body: "Company and documents verified. Complete, eligible ideas move on within days, not months." },
  { icon: ClipboardCheck, title: "Panel review", who: "Independent evaluators", body: "At least two experts score against published criteria, without seeing your name." },
  { icon: Gavel, title: "Committee", who: "CEDA innovation committee", body: "Fair, normalised rankings, and a recorded reason behind every decision." },
  { icon: Trophy, title: "Award", who: "CEDA", body: "Winners receive funding and support. Everyone receives written feedback." },
];

const BEFORE = [
  { icon: MailX, text: "Applications emailed as PDFs, and some never arrive" },
  { icon: Inbox, text: "Months of silence, with no idea where things stand" },
  { icon: Scale, text: "Scores in spreadsheets, so fairness is hard to prove" },
  { icon: MessagesSquare, text: "A rejection letter with no reason and no second chance" },
];
const AFTER = [
  { icon: Send, text: "One guided form that won't let you miss a required answer" },
  { icon: Bell, text: "A live tracker, and a notification at every stage" },
  { icon: ScrollText, text: "Blind, weighted scoring on a tamper-evident record" },
  { icon: MessagesSquare, text: "Feedback per criterion, and a chance to resubmit" },
];

const ROLES = [
  {
    icon: Sprout,
    title: "Young innovators",
    points: ["Apply from your phone in under 20 minutes", "Track your idea live, like a parcel", "Get feedback, improve, resubmit"],
    cta: { href: "/register", label: "Start an application" },
  },
  {
    icon: ClipboardCheck,
    title: "Evaluators",
    points: ["A clear queue with deadlines", "Weighted criteria on one screen", "Conflict declaration before you see an idea"],
    cta: { href: "/tour#b", label: "See the scoring screen" },
  },
  {
    icon: Gavel,
    title: "CEDA committee",
    points: ["Rankings adjusted for harsh and generous judges", "Panel disagreements flagged", "Advance, decline or award, with a reason"],
    cta: { href: "/tour#b", label: "See the committee board" },
  },
  {
    icon: LineChart,
    title: "Programme managers",
    points: ["Open a new call without a developer", "Pipeline board across every stage", "Reach, outcomes and timelines"],
    cta: { href: "/tour#f", label: "See the reports" },
  },
];

const STORIES = [
  { src: PHOTOS.farmer, kicker: "Agriculture", title: "Smarter farms", body: "Sensors, irrigation and cold chains that help farmers grow more with less water." },
  { src: PHOTOS.team, kicker: "Youth-led teams", title: "Founders, together", body: "Majority youth-owned companies, aged 18 to 35, with a plan to grow beyond their first customers." },
  { src: PHOTOS.maker, kicker: "Manufacturing", title: "Made in Botswana", body: "Turning imports into local products, and local products into jobs." },
  { src: PHOTOS.keyboard, kicker: "Digital economy", title: "Software for every phone", body: "Payments, USSD and apps built for how Batswana actually connect." },
  { src: PHOTOS.solar, kicker: "Energy", title: "Power off the grid", body: "Pay-as-you-go solar and storage for homes and businesses the grid hasn't reached." },
];

const PILLARS = [
  { icon: Banknote, title: "Finance", body: "Winning ideas move into CEDA's funding pipeline, with award amounts recorded against each decision." },
  { icon: GraduationCap, title: "Develop", body: "Every applicant gets structured feedback. Shortlisted teams are matched with mentoring." },
  { icon: Sprout, title: "Sustain", body: "Ideas stay on record across calls, so promising teams can come back stronger next round." },
];

const TRUST = [
  { icon: KeyRound, title: "You choose what you share", body: "Separate consent for processing, panel review, showcase and marketing. Withdraw optional consent any time." },
  { icon: Fingerprint, title: "Your rights, one click away", body: "Download, correct, restrict or erase your data from your privacy centre. CEDA's DPO answers within 30 days." },
  { icon: FileLock2, title: "Sealed and encrypted", body: "Files encrypted at rest. Every submission gets a SHA-256 seal and a signed receipt." },
  { icon: ShieldCheck, title: "Your idea stays yours", body: "Evaluators see only what they're assigned, declare conflicts, and review blind." },
];

function SectionTitle({ eyebrow, title, body, center }: { eyebrow: string; title: React.ReactNode; body?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className="eyebrow text-sky-300/80">{eyebrow}</div>
      <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-5xl">{title}</h2>
      {body && <p className={`mt-5 text-[17px] leading-relaxed text-white/55 ${center ? "mx-auto max-w-xl" : "max-w-xl"}`}>{body}</p>}
    </Reveal>
  );
}

export default async function Home() {
  const s = await getStats();
  return (
    <div className="night min-h-screen overflow-x-clip">
      {/* Hero */}
      <section className="noise relative isolate min-h-[100svh] overflow-hidden">
        <div className="grid-lines absolute inset-0 -z-10" aria-hidden="true" />
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(60%_60%_at_70%_20%,rgb(15_111_255/0.20),transparent_70%)]"
          aria-hidden="true"
        />
        <PublicHeader />
        <Globe
          districts={s.districts}
          className="absolute top-[30%] right-[-45%] aspect-square w-[130%] opacity-70 sm:top-[18%] sm:right-[-30%] sm:w-[95%] sm:opacity-100 lg:top-[-2%] lg:right-[-8%] lg:w-[64%]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950 to-transparent" aria-hidden="true" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-[18vh] pb-24 md:px-8 lg:pt-[14vh]">
          <div className="max-w-2xl">
            <div className="animate-rise inline-flex items-center gap-2 rounded-full bg-white/[0.04] py-1 pr-3 pl-1 text-xs ring-1 ring-white/10 backdrop-blur">
              <span className="rounded-full bg-gold-400/15 px-2 py-0.5 font-medium text-gold-300 ring-1 ring-gold-400/30">#KaeKapaKae</span>
              <span className="text-white/60">CEDA Innovation Portal</span>
              <span className="h-1 w-1 rounded-full bg-white/25" />
              <span className="flex items-center gap-1.5 text-white/60">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> {s.calls.filter((c) => c.status === "OPEN").length} calls open
              </span>
            </div>
            <h1 className="animate-rise mt-7 text-[54px] leading-[0.98] font-semibold text-white [animation-delay:80ms] sm:text-7xl lg:text-[88px]">
              <span className="text-gradient">Your idea.</span>
              <br />
              <span className="text-gradient">Botswana's </span>
              <span className="font-serif text-[1.08em] text-sky-300 italic">future.</span>
            </h1>
            <p className="animate-rise mt-7 max-w-lg text-lg leading-relaxed text-white/60 [animation-delay:160ms]">
              Sky is CEDA's home for youth-led innovation. Submit once, follow your idea live through every stage, and hear back from the
              people deciding. Real feedback, not silence.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
              <Link href="/calls" className="btn-light btn-lg">
                Explore open calls <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tour" className="btn-glass btn-lg">
                Judge's 2-minute tour
              </Link>
            </div>
          </div>

          <div className="animate-rise mt-20 max-w-3xl [animation-delay:320ms]">
            <div className="eyebrow mb-4 flex items-center gap-2 text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgb(94_163_255)]" /> Live from the portal
            </div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/[0.07] ring-1 ring-white/[0.07] sm:grid-cols-4">
              {[
                { k: "Ideas submitted", v: <CountUp value={s.submitted} /> },
                { k: "Districts reached", v: <CountUp value={s.reached} suffix={` / ${DISTRICTS.length}`} /> },
                { k: "Calls live", v: <CountUp value={s.calls.length} /> },
                { k: "Awarded so far", v: <CountUp value={s.awarded} prefix="P" /> },
              ].map((x) => (
                <div key={x.k} className="bg-navy-950/80 px-5 py-4 backdrop-blur">
                  <dt className="text-xs text-white/40">{x.k}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-white tabular-nums">{x.v}</dd>
                </div>
              ))}
            </dl>
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

      {/* Why */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
        <SectionTitle
          eyebrow="Why Sky exists"
          title={
            <>
              Good ideas get lost in inboxes.{" "}
              <span className="font-serif text-[1.08em] text-sky-300 italic">Sky gives every one a fair path.</span>
            </>
          }
        />
        <div className="mt-16 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl p-8 ring-1 ring-white/[0.06]">
              <div className="eyebrow text-white/30">The usual way</div>
              <ul className="mt-6 space-y-5">
                {BEFORE.map((b) => (
                  <li key={b.text} className="flex items-start gap-4 text-white/40">
                    <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-white/25" strokeWidth={1.5} /> {b.text}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-dark hairline-top relative h-full overflow-hidden p-8">
              <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" aria-hidden="true" />
              <div className="eyebrow text-sky-300">With Sky</div>
              <ul className="mt-6 space-y-5">
                {AFTER.map((b) => (
                  <li key={b.text} className="flex items-start gap-4 text-white">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 ring-1 ring-sky-400/30">
                      <b.icon className="h-3.5 w-3.5 text-sky-300" />
                    </span>
                    <span className="pt-0.5">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* People */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle
              eyebrow="Who Sky is for"
              title={
                <>
                  The people building <span className="font-serif text-[1.08em] text-sky-300 italic">Botswana's next industries.</span>
                </>
              }
            />
            <Reveal>
              <p className="max-w-xs text-sm text-white/45">Hover or tap a story. Every call on Sky is open to youth-led teams across all {DISTRICTS.length} districts.</p>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-14">
            <StoryGallery stories={STORIES} />
          </Reveal>
        </div>
      </section>

      <ParallaxBand src={PHOTOS.delta} className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-32 md:px-8 md:py-44">
          <Reveal className="max-w-3xl">
            <div className="eyebrow text-sky-300/80">From the Delta to the capital</div>
            <p className="mt-5 text-[34px] leading-[1.1] text-white md:text-[56px]">
              A good idea shouldn't depend on <span className="font-serif text-[1.08em] text-gold-300 italic">how close you live to Gaborone.</span>
            </p>
            <div className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
              {[
                { v: <CountUp value={s.reached} suffix={` / ${DISTRICTS.length}`} />, k: "districts with ideas on Sky" },
                { v: <CountUp value={s.submitted} />, k: "ideas submitted so far" },
                { v: "100%", k: "applied online, from any phone" },
              ].map((x) => (
                <div key={x.k}>
                  <div className="text-4xl font-semibold tracking-tight text-white tabular-nums">{x.v}</div>
                  <div className="mt-1 text-sm text-white/55">{x.k}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </ParallaxBand>

      {/* How it works */}
      <section id="how" className="relative scroll-mt-10 border-t border-white/[0.06]">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-[1fr_440px] lg:gap-20">
          <div>
            <SectionTitle
              eyebrow="How it works"
              title={
                <>
                  Five stages. <span className="font-serif text-[1.08em] text-sky-300 italic">You can see every one.</span>
                </>
              }
              body="CEDA can change the stages for each call. This is the standard path an idea takes, and the innovator is notified at every step."
            />
            <ol className="relative mt-14">
              <span className="absolute top-2 bottom-2 left-[19px] w-px bg-gradient-to-b from-sky-400/70 via-sky-400/20 to-transparent" aria-hidden="true" />
              {STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.06}>
                  <li className="relative flex gap-6 pb-9 last:pb-0">
                    <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-900 ring-1 ring-white/10">
                      <step.icon className="h-[18px] w-[18px] text-sky-300" />
                    </span>
                    <div className="pt-1">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-mono text-xs text-white/30">0{i + 1}</span>
                        <span className="text-lg font-medium tracking-tight text-white">{step.title}</span>
                        <span className="text-sm text-sky-300/70">{step.who}</span>
                      </div>
                      <p className="mt-1.5 max-w-lg text-[15px] leading-relaxed text-white/50">{step.body}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Reveal delay={0.15}>
              <JourneyCard />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
          <SectionTitle
            eyebrow="Built for everyone in the room"
            title={
              <>
                One portal. <span className="font-serif text-[1.08em] text-sky-300 italic">A workspace for each role.</span>
              </>
            }
          />
          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ROLES.map((r, i) => (
              <Reveal key={r.title} delay={i * 0.07} className="h-full">
                <Spotlight className="card-dark group flex h-full flex-col p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-sky-400/25 to-sky-500/5 ring-1 ring-sky-300/25">
                    <r.icon className="h-[18px] w-[18px] text-sky-200" />
                  </span>
                  <div className="mt-6 text-lg font-medium tracking-tight text-white">{r.title}</div>
                  <ul className="mt-4 flex-1 space-y-2.5 text-sm text-white/50">
                    {r.points.map((p) => (
                      <li key={p} className="flex gap-2.5">
                        <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-gold-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link href={r.cta.href} className="relative z-10 mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-white">
                    {r.cta.label} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Finance Develop Sustain: the one daylight band on the page */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#0a59de_0%,#0f6fff_35%,#5ea3ff_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_0%,rgb(255_255_255/0.28),transparent_70%),radial-gradient(40%_50%_at_0%_100%,rgb(246_219_166/0.35),transparent_70%)]" aria-hidden="true" />
        <div className="grid-lines absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
          <Reveal className="max-w-3xl">
            <div className="eyebrow text-white/70">Finance · Develop · Sustain</div>
            <h2 className="mt-4 text-[34px] leading-[1.08] text-white md:text-5xl">
              What happens after you win <span className="font-serif text-[1.08em] text-gold-300 italic">matters as much as winning.</span>
            </h2>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08} className="h-full">
                <div className="h-full rounded-2xl bg-white/[0.12] p-8 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_20px_40px_-20px_rgb(5_8_15/0.45)] ring-1 ring-white/25 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm">
                      <p.icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="font-serif text-4xl text-white/45 italic">0{i + 1}</span>
                  </div>
                  <div className="mt-10 text-2xl font-medium tracking-tight text-white">{p.title}</div>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/80">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Calls */}
      <section className="border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle eyebrow="Open now" title="Calls for innovation" />
            <Reveal>
              <Link href="/calls" className="btn-glass">
                All calls <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {s.calls.map((c, i) => {
              const days = daysUntil(c.closesAt);
              return (
                <Reveal key={c.id} delay={i * 0.07} className="h-full">
                  <Spotlight className="card-dark group h-full">
                    <Link href={`/calls/${c.slug}`} className="relative z-10 flex h-full flex-col">
                      <div className="relative h-44 overflow-hidden rounded-t-2xl">
                        <AzurePhoto src={themePhoto(c.theme)} alt="" className="absolute inset-0" />
                        <span className="absolute inset-0 bg-gradient-to-t from-navy-900 to-transparent" />
                      </div>
                      <div className="flex flex-1 flex-col p-7 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="eyebrow text-sky-300/80">{c.theme}</span>
                        <span
                          className={`chip ${c.status === "OPEN" ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25" : "bg-white/5 text-white/50 ring-white/10"}`}
                        >
                          {c.status === "OPEN" ? (days > 0 ? `${days} days left` : "Closing today") : "In review"}
                        </span>
                      </div>
                      <div className="mt-5 text-xl leading-snug font-medium tracking-tight text-white">{c.title}</div>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{c.tagline}</p>
                      <div className="mt-8 flex items-end justify-between border-t border-white/[0.07] pt-5">
                        <div>
                          <div className="text-xs text-white/35">Prize pool</div>
                          <div className="mt-0.5 text-lg font-semibold tracking-tight text-white">{pula(c.prizePool)}</div>
                        </div>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition group-hover:bg-sky-500 group-hover:ring-sky-400">
                          <ArrowUpRight className="h-4 w-4 text-white" />
                        </span>
                      </div>
                      </div>
                    </Link>
                  </Spotlight>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="scroll-mt-10 border-t border-white/[0.06]">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-[1fr_1.25fr]">
          <div>
            <SectionTitle
              eyebrow="Your data, protected by law and by design"
              title={
                <>
                  Built to the <span className="font-serif text-[1.08em] text-sky-300 italic">Botswana Data Protection Act 2024.</span>
                </>
              }
              body="Sky collects only what CEDA needs to assess your idea, uses it only for the purposes you agree to, and keeps it only as long as necessary. Every access is recorded."
            />
            <Reveal delay={0.1}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/privacy" className="btn-glass">Read the privacy notice</Link>
                <Link href="/verify" className="btn-quiet text-white/60 hover:bg-white/5 hover:text-white">Verify a receipt</Link>
              </div>
              <div className="mt-10 rounded-xl bg-white/[0.03] p-4 font-mono text-[11.5px] leading-relaxed ring-1 ring-white/[0.07]">
                <div className="flex items-center justify-between text-white/35">
                  <span>receipt · SKY-26-0042 · v2</span>
                  <span className="flex items-center gap-1.5 text-emerald-300/80">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> verified
                  </span>
                </div>
                <div className="mt-2 break-all text-sky-200/70">sha256 9f2c4a71e0b8d35c6a1f07e94b2dd8c3a0e5f61b7c92d4e8a3b05f1c6d7e2a94</div>
                <div className="mt-1 text-white/30">sealed 2026-11-03 09:12 CAT · hmac signed · audit #00124</div>
              </div>
            </Reveal>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.07} className="h-full">
                <Spotlight className="card-dark h-full p-6">
                  <t.icon className="h-5 w-5 text-sky-300" strokeWidth={1.6} />
                  <div className="mt-6 font-medium tracking-tight text-white">{t.title}</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{t.body}</p>
                </Spotlight>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/[0.06]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[420px]" aria-hidden="true">
          <div className="absolute bottom-[-520px] left-1/2 h-[760px] w-[1400px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(46_134_255/0.55),rgb(15_111_255/0.12)_60%,transparent)]" />
          <div className="absolute bottom-[-648px] left-1/2 h-[760px] w-[1500px] -translate-x-1/2 rounded-[50%] border-t border-sky-200/50 bg-navy-950 shadow-[0_-20px_80px_-10px_rgb(94_163_255/0.45)]" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 pt-32 pb-56 text-center md:px-8">
          <Reveal>
            <h2 className="text-[40px] leading-[1.04] text-white md:text-6xl">
              The next big Botswana company starts with <span className="font-serif text-[1.08em] text-sky-300 italic">one idea.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/55">
              Bring yours. If you're 18 to 35 and your company is majority youth-owned, Sky is for you.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn-light btn-lg">Create your account</Link>
              <Link href="/tour" className="btn-glass btn-lg">I'm a judge: show me around</Link>
            </div>
          </Reveal>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
