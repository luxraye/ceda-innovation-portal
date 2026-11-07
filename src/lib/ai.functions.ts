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
};

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
        if (e.httpStatus === 402) return { insight: null, error: "AI credits are exhausted for this workspace." };
      } else console.error(e);
      return { insight: null, error: "Could not analyse this idea right now." };
    }
  });
