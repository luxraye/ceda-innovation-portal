import Link from "next/link";
import { ArrowRight, Check, PlayCircle } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/public-chrome";
import { DemoButton } from "@/components/demo-button";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo";
import { ROLE_INFO, type Role } from "@/lib/domain";

export const metadata = { title: "Judge's guide" };

type Section = {
  id: string;
  code: string;
  title: string;
  plain: string;
  how: string[];
  demo: { email: string; next: string; label: string };
};

const SECTIONS: Section[] = [
  {
    id: "a",
    code: "3.2(a)",
    title: "A submission form nobody can get wrong",
    plain: "A young founder applies from a phone, and Sky makes sure the application is complete before CEDA ever sees it.",
    how: [
      "Eligibility is checked at sign-up: age 18 to 35, citizenship, CIPA UIN format and more than 50% youth shareholding.",
      "Each call has its own form, built by CEDA staff without code. Required fields block submission until answered.",
      "Drafts save as you go. Files are encrypted, sealed with SHA-256 and confirmed with a signed receipt.",
    ],
    demo: { email: "naledi@demo.sky.bw", next: "/calls/youth-innovation-challenge-2026", label: "Apply as Naledi" },
  },
  {
    id: "b",
    code: "3.2(b)",
    title: "Evaluation in stages, by panels, against clear criteria",
    plain: "Ideas pass through screening, a scoring panel and the committee. Each judge scores the same weighted criteria, and the maths keeps it fair.",
    how: [
      "Stages and weighted rubrics are set per call. Evaluators declare conflicts of interest before an idea opens.",
      "Review is blind: evaluators see the idea, not the founder's name or company.",
      "Scores are normalised per evaluator so a harsh judge and a generous judge count equally. Big disagreements are flagged.",
    ],
    demo: { email: "thabo.eval@demo.sky.bw", next: "/app/evaluator", label: "Score as an evaluator" },
  },
  {
    id: "b2",
    code: "3.2(b)",
    title: "The committee decides, with reasons on record",
    plain: "The CEDA innovation committee sees a ranked shortlist with the evidence behind it, then advances, declines or awards each idea.",
    how: [
      "Ranked by normalised score, with raw score, panel spread and reviewer count beside each idea.",
      "Every decision needs a written rationale, which becomes the applicant's feedback.",
      "Awards record the amount, so reports show exactly where CEDA's funding went.",
    ],
    demo: { email: "lesego.adj@demo.sky.bw", next: "/app/adjudicator", label: "Decide as the committee" },
  },
  {
    id: "c",
    code: "3.2(c)",
    title: "Everyone can see where every idea is, live",
    plain: "Applicants track their idea like a parcel. CEDA staff see the whole pipeline on one board.",
    how: [
      "A stage tracker and timeline on every submission, updated the moment something changes.",
      "A live notification bell in every workspace, with email and SMS adapters behind it.",
      "A pipeline board for CEDA showing every idea in every stage, with time-in-stage warnings.",
    ],
    demo: { email: "admin@demo.sky.bw", next: "/app/admin/pipeline", label: "Open the pipeline board" },
  },
  {
    id: "d",
    code: "3.2(d)",
    title: "Each person sees only what their role allows",
    plain: "Five roles, five workspaces. An evaluator cannot open an idea they were not assigned, and every action is recorded.",
    how: [
      "Roles: innovator, evaluator, adjudicator, programme admin and data protection officer.",
      "Checked twice: at the route and again inside every server action, so a forged request still fails.",
      "A hash-chained audit trail. Change one past entry and the chain shows exactly where it broke.",
    ],
    demo: { email: "admin@demo.sky.bw", next: "/app/admin/audit", label: "Verify the audit chain" },
  },
  {
    id: "e",
    code: "3.2(e)",
    title: "Feedback that leads somewhere",
    plain: "Evaluators comment on specific criteria. The applicant answers, improves the idea and resubmits, and every version is kept.",
    how: [
      "Feedback is tied to a criterion, so the applicant knows exactly what to fix.",
      "\"Changes requested\" reopens the form. Resubmissions become version 2, 3 and so on.",
      "A side-by-side comparison shows the panel exactly what changed.",
    ],
    demo: { email: "naledi@demo.sky.bw", next: "/app/innovator", label: "Answer feedback as Naledi" },
  },
  {
    id: "f",
    code: "3.2(f)",
    title: "Reports CEDA can act on",
    plain: "Who applied, from where, how far they got, how the panels scored and how long each stage took.",
    how: [
      "Participation by district, sector and gender; the funnel from submission to award.",
      "Score distributions per call and average days spent in each stage.",
      "CSV export for analysts and a print-ready report for the board.",
    ],
    demo: { email: "admin@demo.sky.bw", next: "/app/reports", label: "Open the reports" },
  },
  {
    id: "g",
    code: "3.2(g)",
    title: "Ready to grow without a rebuild",
    plain: "New calls, criteria, stages and roles are settings, not code. Other systems can connect through an API.",
    how: [
      "Calls, forms, rubrics and stages are stored as data. A new call takes minutes.",
      "Modular codebase: each workspace is independent. REST API and webhook seams for CEDA systems, email and SMS.",
      "Runs on PostgreSQL in production and in a container on Botswana-hosted servers.",
    ],
    demo: { email: "admin@demo.sky.bw", next: "/app/admin/calls", label: "Build a call" },
  },
  {
    id: "dpa",
    code: "DPA 2024",
    title: "Data protection is a feature, not a footnote",
    plain: "Sky turns the Botswana Data Protection Act 2024 into tools applicants and CEDA's DPO actually use.",
    how: [
      "Separate, versioned consents. Applicants download, correct, restrict or ask to erase their data themselves.",
      "A DPO workspace with rights requests and due dates, retention rules and a breach register with a 72-hour countdown.",
      "Encryption at rest, sealed submissions and data-residency-ready deployment.",
    ],
    demo: { email: "dpo@demo.sky.bw", next: "/app/dpo", label: "Open the DPO workspace" },
  },
];

export default function Tour() {
  const demo = process.env.DEMO_MODE === "true";
  return (
    <div>
      <section className="sky-gradient">
        <PublicHeader />
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-16 md:px-8">
          <div className="req-badge mb-4">Judge's guide</div>
          <h1 className="text-4xl font-extrabold text-navy-900 md:text-5xl">Sky in two minutes, mapped to the CEDA brief.</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-700">
            Each section below is one requirement from section 3.2 of the hackathon guidelines, in plain words. Press the button to sign
            in as the right person and land on the screen that proves it. Gold badges inside the app show which requirement each screen
            answers.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["One idea, five stages", "Submit, screen, panel, committee, award"],
              ["Five roles, five workspaces", "Each sees only what they should"],
              ["Every action on record", "Sealed submissions and a hash-chained audit trail"],
            ].map(([a, b]) => (
              <div key={a} className="card p-4">
                <div className="font-semibold text-navy-900">{a}</div>
                <div className="text-sm text-slate-600">{b}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-14 md:px-8">
        <nav className="flex flex-wrap gap-2" aria-label="Jump to requirement">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="chip border border-slate-200 bg-white text-slate-700 hover:border-sky-300">
              {s.code} {s.id === "b2" ? "committee" : ""}
            </a>
          ))}
        </nav>
        {SECTIONS.map((s, i) => (
          <section key={s.id} id={s.id} className="card scroll-mt-6 overflow-hidden">
            <div className="grid md:grid-cols-[1fr_1.3fr]">
              <div className="bg-gradient-to-br from-sky-600 to-sky-800 p-7 text-white">
                <div className="flex items-center gap-2 text-xs font-semibold text-gold-300">
                  <span className="font-mono">{s.code}</span> · Step {i + 1} of {SECTIONS.length}
                </div>
                <h2 className="mt-3 text-2xl font-bold">{s.title}</h2>
                <p className="mt-3 text-sm text-sky-100">{s.plain}</p>
                {demo && (
                  <DemoButton email={s.demo.email} next={s.demo.next} className="btn-gold mt-6">
                    <PlayCircle className="h-4 w-4" /> {s.demo.label}
                  </DemoButton>
                )}
              </div>
              <ul className="space-y-4 p-7">
                {s.how.map((h) => (
                  <li key={h} className="flex gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        {demo && (
          <section className="card p-7">
            <h2 className="text-xl font-bold text-navy-900">Demo accounts</h2>
            <p className="mt-1 text-sm text-slate-600">
              Every account uses the password <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">{DEMO_PASSWORD}</code>. All
              people and companies are fictional.
            </p>
            <div className="mt-5 divide-y divide-slate-100">
              {DEMO_ACCOUNTS.map((a) => (
                <div key={a.email} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-navy-900">
                      {a.name} <span className="chip ml-1 bg-sky-100 text-sky-800">{ROLE_INFO[a.role as Role].label}</span>
                    </div>
                    <div className="text-sm text-slate-600">{a.note}</div>
                    <div className="font-mono text-xs text-slate-500">{a.email}</div>
                  </div>
                  <DemoButton email={a.email} className="btn-ghost shrink-0">
                    Sign in <ArrowRight className="h-4 w-4" />
                  </DemoButton>
                </div>
              ))}
            </div>
          </section>
        )}
        <div className="text-center">
          <Link href="/" className="text-sm font-medium text-sky-700 hover:underline">Back to the home page</Link>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
