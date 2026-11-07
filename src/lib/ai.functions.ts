import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateResponse, GatewayError } from "@lovable.dev/ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const IdeaInput = z.object({
  title: z.string().max(300),
  category: z.string().max(100),
  problem: z.string().max(6000),
  solution: z.string().max(6000),
  impact: z.string().max(4000),
  target_market: z.string().max(2000),
  mode: z.enum(["coach", "evaluator"]),
});

export type AiInsight = {
  readiness: number;
  headline: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  /** True when the score came from the built-in checklist instead of the AI model. */
  offline?: boolean;
};

/** Rule-based readiness estimate used when the AI gateway isn't configured (e.g. running locally). */
function offlineInsight(d: z.infer<typeof IdeaInput>): AiInsight {
  const len = (s: string) => s.trim().length;
  const has = (s: string, re: RegExp) => re.test(s.toLowerCase());
  const checks: [boolean, string, string, string][] = [
    [len(d.problem) >= 120, "The problem is described in useful detail.", "The problem statement is thin.", "Describe who has the problem, how often, and what it costs them."],
    [has(d.problem + d.impact, /\d/), "You back your case with numbers.", "There are no figures to size the problem or impact.", "Add a statistic: losses, users affected, or jobs you'll create."],
    [len(d.solution) >= 120, "The solution is concrete.", "The solution needs more detail.", "Explain how it works, what you've built so far and what's next."],
    [has(d.impact, /job|employ|income|youth|sdg|women|rural/), "Socio-economic impact for Botswana is clear.", "Impact on jobs and communities isn't explicit.", "Say how many jobs you'll create and which communities benefit."],
    [len(d.target_market) >= 15, "You know who your customers are.", "The target market is vague.", "Name your first paying customers and estimate the market size."],
    [has(d.solution, /pilot|prototype|customer|revenue|partner|trial|users/), "There's evidence of traction.", "No traction or validation is mentioned.", "Mention a pilot, prototype, partner or early customers."],
  ];
  const passed = checks.filter((c) => c[0]);
  const failed = checks.filter((c) => !c[0]);
  const readiness = Math.round(35 + (passed.length / checks.length) * 60);
  return {
    readiness,
    headline: readiness >= 80 ? "Strong, well-evidenced submission that's ready for the panel." : readiness >= 60 ? "Solid foundation. A few additions will make it stand out." : "Promising idea. Add detail and evidence before submitting.",
    strengths: (passed.length ? passed.map((c) => c[1]) : ["You've started your submission."]).slice(0, 3),
    gaps: (failed.length ? failed.map((c) => c[2]) : ["No major gaps found."]).slice(0, 3),
    suggestions: (failed.length ? failed.map((c) => c[3]) : ["Run through it once more for clarity, then submit."]).slice(0, 3),
    offline: true,
  };
}

function extractText(res: unknown): string {
  const r = res as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof r.output_text === "string" && r.output_text) return r.output_text;
  return (r.output ?? [])
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === "output_text" && c.text)
    .map((c) => c.text)
    .join("");
}

export const analyzeIdea = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdeaInput.parse(d))
  .handler(async ({ data }): Promise<{ insight: AiInsight | null; error: string | null }> => {
    const role =
      data.mode === "coach"
        ? "You are a supportive pitch coach helping a young Motswana entrepreneur strengthen an innovation submission to CEDA (Citizen Entrepreneurial Development Agency, Botswana) before they submit."
        : "You are an impartial assistant briefing a CEDA evaluation panel member. Summarise the idea objectively against: innovation, market potential, socio-economic impact for Botswana, technical feasibility and team capability.";
    if (!process.env["LOVABLE_API_KEY"]) return { insight: offlineInsight(data), error: null };
    try {
      const res = await generateResponse({
        model: "openai/gpt-6-astra",
        instructions: `${role} Reply ONLY with JSON: {"readiness": number 0-100, "headline": string (max 18 words), "strengths": string[3], "gaps": string[3], "suggestions": string[3]}. Keep each item under 25 words.`,
        input: `Title: ${data.title}\nCategory: ${data.category}\nProblem: ${data.problem}\nSolution: ${data.solution}\nImpact: ${data.impact}\nTarget market: ${data.target_market}`,
      });
      const text = extractText(res);
      const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
      return { insight: JSON.parse(json) as AiInsight, error: null };
    } catch (e) {
      if (e instanceof GatewayError) {
        console.error("AI gateway", e.code, e.httpStatus);
        if (e.httpStatus === 429) return { insight: null, error: "The assistant is busy. Please try again in a minute." };
        if (e.httpStatus === 402) return { insight: offlineInsight(data), error: null };
      } else console.error(e);
      return { insight: offlineInsight(data), error: null };
    }
  });
