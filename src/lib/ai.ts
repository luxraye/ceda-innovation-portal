import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { FormField } from "./domain";

// AI help for innovators (Pitch Coach) and reviewers (Panel Brief).
//
// When ANTHROPIC_API_KEY is set, Claude writes the feedback. Without it (or if the
// call fails), a built-in checklist gives the same shape of answer, so the demo
// always works. Identity fields are stripped before anything leaves the server for
// a blind review, and the model is told never to infer who the applicant is.

const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
export const aiLive = () => !!process.env.ANTHROPIC_API_KEY && process.env.AI_DISABLED !== "true";

// ---------- shared ----------

export type Criterion = { name: string; description: string | null; weight: number };
type Answers = Record<string, unknown>;

function asText(v: unknown) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function answerBlock(fields: FormField[], answers: Answers) {
  return fields
    .filter((f) => f.type !== "file")
    .map((f) => `### ${f.label} [${f.key}]\n${asText(answers[f.key]) || "(not answered)"}`)
    .join("\n\n");
}

function criteriaBlock(criteria: Criterion[]) {
  return criteria.map((c) => `- ${c.name} (${c.weight}%): ${c.description ?? ""}`).join("\n");
}

let client: Anthropic | null = null;
const anthropic = () => (client ??= new Anthropic());

async function ask<T extends z.ZodType>(schema: T, system: string, prompt: string): Promise<z.infer<T> | null> {
  try {
    const res = await anthropic().beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      // A refused request is re-run on a fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(schema) },
      system,
      messages: [{ role: "user", content: prompt }],
    });
    if (res.stop_reason === "refusal") return null;
    return (res.parsed_output as z.infer<T> | null) ?? null;
  } catch (err) {
    console.error("[ai] falling back to the built-in checklist:", err instanceof Error ? err.message : err);
    return null;
  }
}

// Light per-user throttle so one person cannot run up the AI bill.
const hits = new Map<string, number[]>();
export function aiThrottle(userId: string, perMinute = 6) {
  const now = Date.now();
  const recent = (hits.get(userId) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= perMinute) return false;
  hits.set(userId, [...recent, now]);
  return true;
}

// ---------- Pitch Coach ----------

const CoachSchema = z.object({
  readiness: z.number().describe("0-100: how ready this application is for the panel"),
  headline: z.string().describe("One encouraging sentence on where the pitch stands"),
  strengths: z.array(z.string()).describe("Up to 3 things the pitch does well"),
  improvements: z
    .array(z.object({ fieldKey: z.string().describe("The [key] of the answer to improve"), tip: z.string().describe("One concrete, actionable suggestion") }))
    .describe("Up to 4 improvements, most valuable first"),
});
export type CoachResult = z.infer<typeof CoachSchema> & { source: "ai" | "checklist" };

const COACH_SYSTEM = `You are the Pitch Coach on the CEDA Innovation Portal in Botswana. You help young founders strengthen an application before they submit it to a CEDA funding call.

Judge the draft against the call's scoring rubric. Be warm, specific and practical: point to the exact answer to improve and say what to add (a number, a customer, a pilot result, a cost). Write in plain English a busy founder can act on in minutes. Never invent facts about their business, never promise an outcome, and never write their answers for them. Refer to money in Pula (P).`;

export async function pitchCoach(fields: FormField[], answers: Answers, criteria: Criterion[], callTitle: string): Promise<CoachResult> {
  if (aiLive()) {
    const out = await ask(
      CoachSchema,
      COACH_SYSTEM,
      `Call: ${callTitle}\n\nScoring rubric:\n${criteriaBlock(criteria)}\n\nDraft application:\n\n${answerBlock(fields, answers)}`,
    );
    if (out) {
      const keys = new Set(fields.map((f) => f.key));
      return {
        readiness: Math.max(0, Math.min(100, Math.round(out.readiness))),
        headline: out.headline,
        strengths: out.strengths.slice(0, 3),
        improvements: out.improvements.filter((i) => keys.has(i.fieldKey)).slice(0, 4),
        source: "ai",
      };
    }
  }
  return coachChecklist(fields, answers);
}

const words = (s: string) => (s ? s.split(/\s+/).filter(Boolean).length : 0);
const hasNumber = (s: string) => /\d/.test(s);

function coachChecklist(fields: FormField[], answers: Answers): CoachResult {
  const text = (k: string) => asText(answers[k]);
  const textareas = fields.filter((f) => f.type === "textarea");
  const all = textareas.map((f) => text(f.key)).join(" ").toLowerCase();
  const strengths: string[] = [];
  const improvements: CoachResult["improvements"] = [];
  let score = 0;
  let checks = 0;
  const check = (ok: boolean, good: string, fieldKey: string, tip: string) => {
    checks++;
    if (ok) {
      score++;
      strengths.push(good);
    } else if (fields.some((f) => f.key === fieldKey)) improvements.push({ fieldKey, tip });
  };

  const missing = fields.filter((f) => f.required && f.type !== "file" && !text(f.key));
  for (const f of missing.slice(0, 2)) improvements.push({ fieldKey: f.key, tip: `Answer "${f.label}". The panel can't score what isn't there.` });
  checks += 2;
  if (missing.length === 0) score += 2;

  const thin = textareas.find((f) => (f.maxLength ?? 1000) > 400 && text(f.key) && words(text(f.key)) < 25);
  check(!thin, "Your answers are detailed enough to judge.", thin?.key ?? "", thin ? `Add detail to "${thin.label}": who, how many, how often, and what it costs them.` : "");
  const probKey = fields.find((f) => f.key === "problem")?.key ?? textareas[0]?.key ?? "";
  check(hasNumber(text("problem") + text("market") + text("impact")), "You back your case with numbers.", probKey, "Size the problem with a figure: farmers affected, litres lost, hours wasted, Pula spent.");
  check(/pilot|prototype|customer|revenue|users|trial|signed|letter of intent|partner/.test(all), "There's evidence of traction.", fields.some((f) => f.key === "solution") ? "solution" : probKey, "Mention any pilot, prototype, paying customer, partner or letter of intent, with a result.");
  check(/job|employ|youth|women|rural|income|district|food security|divers/.test(text("impact") + " " + text("market")), "Your impact on Botswana is clear.", "impact", "Say how many jobs you'll create, for whom, and in which districts.");
  check(/botswana|existing|compet|cheaper|instead|unlike|current/.test(text("innovation")), "You explain what's new compared with today.", "innovation", "Name what people use today in Botswana and why yours is better or cheaper.");
  check(/p\s?\d|pula|bwp|\d+\s?%/.test(text("useOfFunds")), "Your use of funds is costed.", "useOfFunds", "Break the funding down into amounts, e.g. \"200 probes (P90,000)\".");

  const readiness = Math.round(30 + (score / Math.max(checks, 1)) * 65);
  return {
    readiness,
    headline:
      readiness >= 85 ? "Strong and well evidenced. Ready for the panel." : readiness >= 65 ? "A solid pitch. A few additions will make it stand out." : "A promising start. Add detail and evidence before you submit.",
    strengths: strengths.slice(0, 3),
    improvements: improvements.filter((i) => i.fieldKey).slice(0, 4),
    source: "checklist",
  };
}

// ---------- Panel Brief ----------

const BriefSchema = z.object({
  summary: z.string().describe("Two or three neutral sentences: what the idea is and who it serves"),
  criteria: z
    .array(
      z.object({
        criterion: z.string().describe("Rubric criterion name, exactly as given"),
        evidence: z.string().describe("What in the application supports this criterion, quoting figures where given"),
        gaps: z.string().describe("What is missing, unclear or unproven for this criterion"),
      }),
    )
    .describe("One entry per rubric criterion, in rubric order"),
  questions: z.array(z.string()).describe("Up to 4 questions a panel member should ask the applicant"),
  claimsToVerify: z.array(z.string()).describe("Up to 3 factual claims worth checking before deciding"),
});
export type BriefResult = z.infer<typeof BriefSchema> & { source: "ai" | "checklist" };

const BRIEF_SYSTEM = `You prepare neutral briefing notes for CEDA's innovation panel in Botswana. Your brief helps a human reviewer read an application faster; it does not score or recommend.

Map the application's evidence to each rubric criterion and name what is missing or unproven. Stay strictly neutral: no scores, no ranking, no recommendation, and no praise or criticism of the people. This may be a blind review, so never guess or mention who the applicant, founders or company are. Quote the applicant's own figures where they exist, and say plainly when there are none.`;

export async function panelBrief(fields: FormField[], answers: Answers, criteria: Criterion[], callTitle: string): Promise<BriefResult> {
  if (aiLive()) {
    const out = await ask(BriefSchema, BRIEF_SYSTEM, `Call: ${callTitle}\n\nScoring rubric:\n${criteriaBlock(criteria)}\n\nApplication:\n\n${answerBlock(fields, answers)}`);
    if (out) return { ...out, questions: out.questions.slice(0, 4), claimsToVerify: out.claimsToVerify.slice(0, 3), source: "ai" };
  }
  return briefChecklist(fields, answers, criteria);
}

const STOP = new Set(["and", "the", "for", "how", "with", "this", "that", "your", "what", "who", "can", "are", "its", "from", "into", "would", "will", "idea"]);
const terms = (s: string) => s.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2 && !STOP.has(w));

function firstSentences(s: string, n = 2) {
  const parts = s.replace(/\s+/g, " ").match(/[^.!?]+[.!?]?/g) ?? [];
  return parts.slice(0, n).join(" ").trim();
}

function briefChecklist(fields: FormField[], answers: Answers, criteria: Criterion[]): BriefResult {
  const text = (k: string) => asText(answers[k]);
  const answered = fields.filter((f) => f.type !== "file" && text(f.key));
  const summary = text("summary") || firstSentences(text(answered.find((f) => f.type === "textarea")?.key ?? ""), 2) || "No summary given.";

  const rows = criteria.map((c) => {
    const want = new Set(terms(`${c.name} ${c.description ?? ""}`));
    const scored = answered
      .map((f) => ({ f, hit: terms(`${f.label} ${f.key}`).filter((t) => want.has(t)).length }))
      .filter((x) => x.hit > 0)
      .sort((a, b) => b.hit - a.hit)
      .slice(0, 2);
    const src = scored.map((x) => text(x.f.key)).join(" ");
    const evidence = scored.length ? scored.map((x) => `${x.f.label.replace(/[?:]\s*$/, "")}: "${firstSentences(text(x.f.key), 2)}"`).join(" ") : "No visible answer speaks to this. Team and company details are hidden in blind review.";
    const gaps: string[] = [];
    if (!scored.length) gaps.push("Judge from the pitch deck or ask the applicant directly.");
    else {
      if (!hasNumber(src)) gaps.push("No figures are given.");
      if (words(src) < 25) gaps.push("The answer is brief.");
    }
    return { criterion: c.name, evidence, gaps: gaps.join(" ") || "Nothing obvious missing; check the figures." };
  });

  const nums = answered.filter((f) => f.type === "textarea").flatMap((f) => (text(f.key).match(/[^.]*\d[^.]*\./g) ?? []).map((s) => s.trim()));
  const questions: string[] = [];
  if (!/pilot|customer|revenue|users|trial/.test(answered.map((f) => text(f.key)).join(" ").toLowerCase())) questions.push("What evidence do you have that customers want this?");
  if (text("useOfFunds")) questions.push("Which milestone does each part of the funding unlock, and by when?");
  questions.push("What is the biggest risk to this plan, and how will you handle it?");
  if (text("market")) questions.push("How did you estimate the number of customers you can reach?");

  return { summary, criteria: rows, questions: questions.slice(0, 4), claimsToVerify: nums.slice(0, 3), source: "checklist" };
}
