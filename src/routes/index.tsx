import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Activity, Scale, MessagesSquare, BarChart3, Sparkles } from "lucide-react";
import hero from "@/assets/hero-innovators.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CEDA Innovation Portal — Youth innovation, from idea to award" },
      { name: "description", content: "Submit, track and get rewarded for youth-led innovation with CEDA Botswana. Transparent evaluation, live tracking, AI pitch coaching." },
      { property: "og:title", content: "CEDA Innovation Portal" },
      { property: "og:description", content: "From idea to award — Botswana's youth innovation pipeline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = ["Submit", "Screening", "Evaluation", "Adjudication", "Award"];

const FEATURES = [
  { icon: Sparkles, title: "AI Pitch Coach", body: "Instant readiness score and evaluator-style feedback before you hit submit." },
  { icon: Activity, title: "Live tracking", body: "Every stage change pushes to your dashboard in real time — no more waiting in the dark." },
  { icon: Scale, title: "Weighted scoring", body: "Panels score against configurable, weighted criteria for fair, auditable adjudication." },
  { icon: MessagesSquare, title: "Feedback loops", body: "Evaluators request revisions; founders respond and resubmit in one thread." },
  { icon: ShieldCheck, title: "Role-based security", body: "Submitters, evaluators, adjudicators and admins each see only what they should." },
  { icon: BarChart3, title: "Decision reports", body: "Pipeline, sector and score analytics with one-click export for CEDA leadership." },
];

function Landing() {
  const { user } = useAuth();
  const cta = user ? "/dashboard" : "/auth";
  return (
    <div className="min-h-screen bg-background">
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-ink text-ink-foreground">
        <img src={hero} alt="Young Batswana entrepreneurs collaborating" width={1600} height={1008} className="absolute inset-0 -z-10 size-full object-cover opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-ink" />
        <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <Logo />
          <Button asChild variant="glass" size="sm"><Link to={cta}>{user ? "Open dashboard" : "Sign in"}</Link></Button>
        </header>
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-[14vh]">
          <p className="animate-rise font-display text-sm font-bold uppercase tracking-[0.3em] text-primary">#KaeKapaKae · Hackathon 2026</p>
          <h1 className="animate-rise mt-5 max-w-4xl text-5xl font-extrabold leading-[0.95] md:text-8xl" style={{ animationDelay: "80ms" }}>
            Botswana's ideas,<br /><span className="text-gradient-ember">from spark to award.</span>
          </h1>
          <p className="animate-rise mt-6 max-w-xl text-lg opacity-80" style={{ animationDelay: "160ms" }}>
            The CEDA Innovation Portal is where youth-owned companies submit bold ideas, get fair transparent evaluation, and track every step live.
          </p>
          <div className="animate-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Button asChild variant="hero" size="lg" className="h-12 px-7 text-base"><Link to={cta}>Submit your idea <ArrowRight /></Link></Button>
            <Button asChild variant="glass" size="lg" className="h-12 px-7 text-base"><Link to={cta}>Evaluator access</Link></Button>
          </div>
          <ol className="mt-20 grid max-w-4xl grid-cols-5 gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="animate-rise" style={{ animationDelay: `${320 + i * 70}ms` }}>
                <div className={`h-1 rounded-full ${i === 0 ? "bg-gradient-ember" : "bg-ink-foreground/25"}`} />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider opacity-70">0{i + 1}</p>
                <p className="font-display text-sm font-bold md:text-lg">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grain">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
            <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">One platform. Every stage. Total transparency.</h2>
            <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-card p-7 transition-colors hover:bg-secondary">
                  <f.icon className="size-6 text-accent" />
                  <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-6 rounded-3xl bg-gradient-ember p-10 text-primary-foreground md:grid-cols-3 md:p-14">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-extrabold md:text-4xl">Eligible? Youth-owned, more than 50%.</h2>
            <p className="mt-3 max-w-lg opacity-85">Citizen companies with majority shareholding by Batswana aged 18–35. No application fee. Window: 6–10 November 2026.</p>
          </div>
          <div className="flex items-center md:justify-end">
            <Button asChild size="lg" className="h-12 bg-ink px-7 text-ink-foreground hover:bg-ink/90"><Link to={cta}>Start application <ArrowRight /></Link></Button>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Personal data is processed in line with Botswana's Data Protection Act, 2024. © CEDA — Finance · Develop · Sustain
        </p>
      </section>
    </div>
  );
}

export function Logo({ dark = true }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-ember font-display text-lg font-extrabold text-primary-foreground">C</span>
      <span className={`font-display text-lg font-bold leading-none ${dark ? "" : "text-foreground"}`}>
        CEDA<span className="block text-[10px] font-semibold uppercase tracking-[0.25em] opacity-70">Innovation Portal</span>
      </span>
    </Link>
  );
}
