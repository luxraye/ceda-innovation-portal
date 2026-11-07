import type { Database } from "@/integrations/supabase/types";

export type Stage = Database["public"]["Enums"]["idea_stage"];
export type AppRole = Database["public"]["Enums"]["app_role"];

export const PIPELINE: Stage[] = ["submitted", "screening", "evaluation", "adjudication", "approved", "awarded"];

export const STAGE_META: Record<Stage, { label: string; tone: string }> = {
  draft: { label: "Draft", tone: "bg-muted text-muted-foreground" },
  submitted: { label: "Submitted", tone: "bg-info/15 text-info" },
  screening: { label: "Screening", tone: "bg-info/15 text-info" },
  evaluation: { label: "Evaluation", tone: "bg-primary/20 text-secondary-foreground" },
  adjudication: { label: "Adjudication", tone: "bg-accent/15 text-accent" },
  revision_requested: { label: "Revision requested", tone: "bg-primary/25 text-secondary-foreground" },
  approved: { label: "Approved", tone: "bg-success/15 text-success" },
  awarded: { label: "Awarded", tone: "bg-success text-accent-foreground" },
  rejected: { label: "Not progressed", tone: "bg-destructive/15 text-destructive" },
};

/** Stages each role may move an idea to, given its current stage. Mirrors the advance_idea database rule. */
export function allowedTransitions(roles: AppRole[], from: Stage): Stage[] {
  const out = new Set<Stage>();
  if (roles.includes("admin")) {
    (Object.keys(STAGE_META) as Stage[]).forEach((s) => s !== from && s !== "draft" && out.add(s));
    return [...out];
  }
  if (roles.includes("evaluator") && ["submitted", "screening", "evaluation"].includes(from)) {
    (["screening", "evaluation", "adjudication", "revision_requested", "rejected"] as Stage[]).forEach(
      (s) => s !== from && out.add(s),
    );
  }
  if (roles.includes("adjudicator") && ["adjudication", "approved"].includes(from)) {
    (["approved", "awarded", "rejected", "revision_requested", "evaluation"] as Stage[]).forEach(
      (s) => s !== from && out.add(s),
    );
  }
  return [...out];
}

export const CATEGORIES = [
  "Agritech", "Fintech", "Edtech", "Healthtech", "Cleantech", "Creative Industries",
  "Tourism", "Manufacturing", "Mining Services", "Logistics", "Govtech", "Other",
];

export const isStaff = (roles: AppRole[]) => roles.some((r) => r !== "submitter");
