import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, Flame, XCircle } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Callout } from "@/components/ui";
import { DIFFICULTY, TRACKS, type Track } from "@/lib/arena";
import { cn, fmtDateTime, parseJson } from "@/lib/format";
import { answerChallenge } from "@/app/actions/arena";

const RESULTS: Record<string, { tone: "emerald" | "rose" | "gold" | "sky"; title: string; body: string }> = {
  correct: { tone: "emerald", title: "Correct. Points added.", body: "Your Innovator Index has gone up. Try another challenge in a different track." },
  first: { tone: "gold", title: "First solve! 20% bonus added.", body: "You're the first team to crack this one. Your name shows on the Range if you've agreed to be showcased." },
  wrong: { tone: "rose", title: "Not quite.", body: "Read the brief again and have another go. Only correct answers count, and there's no penalty for trying." },
  pending: { tone: "sky", title: "Sent for verification.", body: "The CEDA team will read your evidence, usually within two working days. You'll get a notification either way." },
  short: { tone: "rose", title: "A bit more detail, please.", body: "Your answer is shorter than this challenge needs. Add numbers, names and sources." },
  pick: { tone: "rose", title: "Pick an answer first.", body: "Choose one of the options, then submit." },
};

export default async function Challenge({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ result?: string }> }) {
  const user = await requireRole("INNOVATOR");
  const { slug } = await params;
  const { result } = await searchParams;
  const c = await prisma.challenge.findUnique({
    where: { slug },
    include: { solves: { where: { userId: user.id } }, _count: { select: { solves: { where: { status: "SOLVED" } } } } },
  });
  if (!c) notFound();
  const mine = c.solves[0];
  const options = parseJson<string[]>(c.options, []);
  const r = result ? RESULTS[result] : undefined;
  const open = !mine || mine.status === "FAILED";
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/innovator/range" className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-950">
        <ArrowLeft className="h-4 w-4" /> Back to the Range
      </Link>
      <div className="night relative overflow-hidden rounded-2xl p-6 md:p-8">
        <div className="hex-grid absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="term text-sky-300">{TRACKS[c.track as Track].label}</span>
            <span className="text-white/25">·</span>
            <span className="term text-white/50">{DIFFICULTY[c.difficulty as keyof typeof DIFFICULTY].label}</span>
            <span className="text-white/25">·</span>
            <span className="term text-white/50">{c.kind === "QUIZ" ? "Auto-marked" : "Verified by CEDA"}</span>
          </div>
          <h1 className="mt-4 text-3xl text-white md:text-4xl">{c.title}</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/60">{c.brief}</p>
          <div className="mt-6 flex gap-6 text-sm">
            <div>
              <div className="term text-white/35">Points</div>
              <div className="mt-1 font-mono text-2xl text-sky-300">{c.points}</div>
            </div>
            <div>
              <div className="term text-white/35">Solves</div>
              <div className="mt-1 font-mono text-2xl text-white">{c._count.solves}</div>
            </div>
            <div>
              <div className="term text-white/35">First solve bonus</div>
              <div className="mt-1 font-mono text-2xl text-gold-300">{c._count.solves ? "taken" : "+20%"}</div>
            </div>
          </div>
        </div>
      </div>

      {r && (
        <div className="mt-5">
          <Callout tone={r.tone} title={r.title}>{r.body}</Callout>
        </div>
      )}

      {mine?.status === "SOLVED" && (
        <div className="card mt-5 flex items-center gap-4 p-5">
          <CheckCircle2 className="h-8 w-8 text-sky-600" />
          <div className="flex-1">
            <div className="font-medium text-navy-950">Solved · +{mine.points} points</div>
            <div className="text-sm text-slate-500">
              {fmtDateTime(mine.solvedAt)} · {mine.attempts} {mine.attempts === 1 ? "attempt" : "attempts"}
              {mine.first && <span className="ml-2 inline-flex items-center gap-1 text-earth-700"><Flame className="h-3.5 w-3.5" /> First solve</span>}
            </div>
          </div>
        </div>
      )}
      {mine?.status === "PENDING" && (
        <div className="card mt-5 flex items-center gap-4 p-5">
          <Clock className="h-8 w-8 text-amber-600" />
          <div>
            <div className="font-medium text-navy-950">Waiting for CEDA to verify</div>
            <div className="text-sm text-slate-500">Sent {fmtDateTime(mine.solvedAt)}. Points are added once it's accepted.</div>
          </div>
        </div>
      )}

      {open && (
        <form action={answerChallenge} className="card mt-5 p-6">
          <input type="hidden" name="slug" value={c.slug} />
          <div className="font-medium text-navy-950">{c.question}</div>
          {mine?.status === "FAILED" && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-rose-600">
              <XCircle className="h-4 w-4" /> {mine.attempts} earlier {mine.attempts === 1 ? "attempt" : "attempts"}. Keep going.
            </div>
          )}
          {c.kind === "QUIZ" ? (
            <fieldset className="mt-5 space-y-2.5">
              <legend className="sr-only">Choose one answer</legend>
              {options.map((o, i) => (
                <label key={i} className="flex cursor-pointer items-start gap-3 rounded-xl p-3.5 ring-1 ring-slate-200 transition hover:bg-slate-50 has-[:checked]:bg-sky-50 has-[:checked]:ring-sky-400">
                  <input type="radio" name="choice" value={i} className="mt-0.5 accent-[#0aa85c]" required />
                  <span className="text-[14px] text-slate-700">
                    <span className="mr-2 font-mono text-xs text-slate-400">{String.fromCharCode(65 + i)}</span>
                    {o}
                  </span>
                </label>
              ))}
            </fieldset>
          ) : (
            <div className="mt-4">
              <textarea name="evidence" rows={9} className="input" placeholder="Write your answer. Use real numbers, names and sources." required />
              <p className="help">At least {c.minWords} words. The CEDA team checks every answer; copied or invented evidence is returned.</p>
            </div>
          )}
          <div className="mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-400">Every attempt is recorded in the audit trail.</span>
            <button className={cn("btn-primary")}>{c.kind === "QUIZ" ? "Submit answer" : "Send for verification"}</button>
          </div>
        </form>
      )}
    </div>
  );
}
