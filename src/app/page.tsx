import Link from "next/link";
import {
  ArrowRight,
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
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { daysUntil, pula } from "@/lib/format";
import { JourneyCard } from "@/components/journey-card";

export const dynamic = "force-dynamic";

async function getStats() {
  const [calls, submitted, districts, evaluators, awarded] = await Promise.all([
    prisma.call.findMany({ where: { status: { in: ["OPEN", "REVIEW"] } }, orderBy: { closesAt: "asc" } }),
    prisma.submission.count({ where: { status: { not: "DRAFT" } } }),
    prisma.organisation.findMany({ select: { district: true }, distinct: ["district"] }),
    prisma.user.count({ where: { role: "EVALUATOR" } }),
    prisma.submission.aggregate({ _sum: { awardAmount: true }, where: { status: "AWARDED" } }),
  ]);
  return { calls, submitted, districts: districts.length, evaluators, awarded: awarded._sum.awardAmount ?? 0 };
}

const STEPS = [
  { icon: Send, title: "Submit", who: "You", body: "Answer one guided form. Sky checks you're eligible and tells you exactly what's missing before you send." },
  { icon: BadgeCheck, title: "Screen", who: "CEDA team", body: "Your company and documents are verified. Complete, eligible ideas move on within days, not months." },
  { icon: ClipboardCheck, title: "Panel review", who: "Independent evaluators", body: "At least two experts score your idea against published criteria, without seeing your name." },
  { icon: Gavel, title: "Committee", who: "CEDA innovation committee", body: "The committee sees fair, normalised rankings and records the reason for every decision." },
  { icon: Trophy, title: "Award", who: "CEDA", body: "Winners receive funding and support from CEDA. Everyone receives written feedback." },
];

const BEFORE = [
  { icon: MailX, text: "Applications emailed as PDFs, and some never arrive" },
  { icon: Inbox, text: "Months of silence. No idea where your application is" },
  { icon: Scale, text: "Scores kept in spreadsheets. Hard to prove fairness" },
  { icon: MessagesSquare, text: "A rejection letter, but no reason and no second chance" },
];
const AFTER = [
  { icon: Send, text: "One guided form that won't let you miss a required answer" },
  { icon: Bell, text: "A live tracker and a notification at every stage" },
  { icon: ScrollText, text: "Blind, weighted scoring with every action on a tamper-evident record" },
  { icon: MessagesSquare, text: "Feedback on each criterion, and a chance to improve and resubmit" },
];

const ROLES = [
  {
    icon: Sprout,
    title: "For young innovators",
    points: ["Apply from your phone in under 20 minutes", "See your idea's stage live, like tracking a parcel", "Get written feedback, then improve and resubmit"],
    cta: { href: "/register", label: "Start an application" },
  },
  {
    icon: ClipboardCheck,
    title: "For evaluators",
    points: ["A clear queue with deadlines", "Score against weighted criteria in one screen", "Declare conflicts of interest before you see an idea"],
    cta: { href: "/tour#b", label: "See the scoring screen" },
  },
  {
    icon: Gavel,
    title: "For the CEDA committee",
    points: ["Rankings adjusted for harsh and generous judges", "Panel disagreements flagged for discussion", "One click to advance, decline or award, with a reason"],
    cta: { href: "/tour#b", label: "See the committee board" },
  },
  {
    icon: LineChart,
    title: "For programme managers",
    points: ["Open a new call without a developer", "Pipeline board across every stage", "Reports on reach, outcomes and timelines"],
    cta: { href: "/tour#f", label: "See the reports" },
  },
];

const PILLARS = [
  { icon: Banknote, title: "Finance", body: "Winning ideas move into CEDA's funding pipeline, with award amounts recorded against each decision." },
  { icon: GraduationCap, title: "Develop", body: "Every applicant gets structured feedback. Shortlisted teams are matched with mentoring." },
  { icon: Sprout, title: "Sustain", body: "Ideas stay on record across calls, so promising teams can come back stronger next round." },
];

const TRUST = [
  { icon: KeyRound, title: "You choose what you share", body: "Separate consent for processing, panel review, showcase and marketing. Withdraw any optional consent at any time." },
  { icon: Fingerprint, title: "Your rights, one click away", body: "Download your data, correct it, restrict it or ask for erasure from your privacy centre. CEDA's DPO answers within 30 days." },
  { icon: FileLock2, title: "Sealed and encrypted", body: "Files are encrypted at rest. Each submission gets a SHA-256 seal and a signed receipt, so nobody can quietly change it." },
  { icon: ShieldCheck, title: "Your idea stays yours", body: "Evaluators only see ideas assigned to them, sign a conflict declaration, and review blind." },
];

export default async function Home() {
  const s = await getStats();
  return (
    <div>
      <section className="sky-gradient relative overflow-hidden">
        <PublicHeader />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-8 pb-20 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-28">
          <div className="animate-rise">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-xs font-semibold text-sky-800">
              <span className="text-gold-600">#KaeKapaKae</span> CEDA Innovation Portal
            </div>
            <h1 className="text-5xl leading-[1.05] font-extrabold text-navy-900 md:text-6xl lg:text-7xl">
              Your idea.
              <br />
              <span className="bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">Botswana's future.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-700">
              Sky is CEDA's home for youth-led innovation. Submit your idea once, follow it live through every stage, and hear back from
              the people deciding, with real feedback, not silence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/calls" className="btn-primary px-5 py-3 text-base">
                Explore open calls <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/tour" className="btn-ghost px-5 py-3 text-base">
                Take the 2-minute tour
              </Link>
            </div>
            <dl className="mt-12 grid max-w-xl grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { k: "Open calls", v: s.calls.length },
                { k: "Ideas submitted", v: s.submitted },
                { k: "Districts reached", v: s.districts },
                { k: "Awarded so far", v: pula(s.awarded) },
              ].map((x) => (
                <div key={x.k}>
                  <dt className="text-xs font-medium text-slate-500">{x.k}</dt>
                  <dd className="font-display mt-1 text-2xl font-bold text-navy-900">{x.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <JourneyCard />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-sm font-semibold text-sky-700">Why Sky exists</div>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">Good ideas get lost in inboxes. Sky gives every one a fair path.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card p-7">
            <div className="text-sm font-semibold tracking-wide text-slate-500 uppercase">The usual way</div>
            <ul className="mt-5 space-y-4">
              {BEFORE.map((b) => (
                <li key={b.text} className="flex items-start gap-3 text-slate-600">
                  <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" /> {b.text}
                </li>
              ))}
            </ul>
          </div>
          <div className="card border-sky-200 bg-gradient-to-br from-sky-50 to-white p-7">
            <div className="text-sm font-semibold tracking-wide text-sky-700 uppercase">With Sky</div>
            <ul className="mt-5 space-y-4">
              {AFTER.map((b) => (
                <li key={b.text} className="flex items-start gap-3 font-medium text-navy-900">
                  <b.icon className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" /> {b.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="how" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-sky-700">How it works</div>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">Five stages. You can see every one.</h2>
            <p className="mt-3 text-slate-600">CEDA can change the stages for each call. This is the standard path an idea takes.</p>
          </div>
          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-3xl font-bold text-sky-100">{i + 1}</span>
                </div>
                <div className="mt-4 font-semibold text-navy-900">{step.title}</div>
                <div className="text-xs font-medium text-sky-700">{step.who}</div>
                <p className="mt-2 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-sky-700">Built for everyone in the room</div>
          <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">One portal, a workspace for each role.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <div key={r.title} className="card flex flex-col p-6">
              <r.icon className="h-7 w-7 text-sky-600" />
              <div className="mt-4 font-semibold text-navy-900">{r.title}</div>
              <ul className="mt-3 flex-1 space-y-2 text-sm text-slate-600">
                {r.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link href={r.cta.href} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-sky-700 hover:underline">
                {r.cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="night-gradient py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold text-gold-400">Finance · Develop · Sustain</div>
            <h2 className="mt-2 text-3xl font-bold md:text-4xl">What happens after you win matters as much as winning.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p.icon className="h-7 w-7 text-gold-400" />
                <div className="font-display mt-4 text-xl font-bold">{p.title}</div>
                <p className="mt-2 text-sm text-sky-100/80">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="text-sm font-semibold text-sky-700">Open now</div>
            <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">Calls for innovation</h2>
          </div>
          <Link href="/calls" className="btn-ghost">All calls <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {s.calls.map((c) => {
            const days = daysUntil(c.closesAt);
            return (
              <Link key={c.id} href={`/calls/${c.slug}`} className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:border-sky-300">
                <div className="text-xs font-semibold tracking-wide text-sky-700 uppercase">{c.theme}</div>
                <div className="mt-2 text-lg font-bold text-navy-900 group-hover:text-sky-700">{c.title}</div>
                <p className="mt-2 flex-1 text-sm text-slate-600">{c.tagline}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-navy-900">{pula(c.prizePool)} pool</span>
                  <span className={days <= 7 ? "font-semibold text-gold-600" : "text-slate-500"}>
                    {c.status === "OPEN" ? (days > 0 ? `Closes in ${days} days` : "Closing today") : "In review"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="trust" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <div className="text-sm font-semibold text-sky-700">Your data, protected by law and by design</div>
              <h2 className="mt-2 text-3xl font-bold text-navy-900 md:text-4xl">Built to the Botswana Data Protection Act 2024.</h2>
              <p className="mt-4 text-slate-600">
                Sky collects only what CEDA needs to assess your idea, uses it only for the purposes you agree to, and keeps it only as
                long as necessary. Every access is recorded.
              </p>
              <Link href="/privacy" className="btn-ghost mt-6">Read the privacy notice</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {TRUST.map((t) => (
                <div key={t.title} className="rounded-2xl border border-slate-200 p-5">
                  <t.icon className="h-6 w-6 text-sky-600" />
                  <div className="mt-3 font-semibold text-navy-900">{t.title}</div>
                  <p className="mt-1.5 text-sm text-slate-600">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sky-gradient">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
          <Users className="mx-auto h-10 w-10 text-sky-600" />
          <h2 className="mt-4 text-3xl font-bold text-navy-900 md:text-5xl">The next big Botswana company starts with one idea.</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-700">Bring yours. If you're 18 to 35 and your company is majority youth-owned, Sky is for you.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn-primary px-6 py-3 text-base">Create your account</Link>
            <Link href="/tour" className="btn-ghost px-6 py-3 text-base">I'm a judge: show me around</Link>
          </div>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
