"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { CALL_SECTORS, VENTURE_STAGES, type FormField } from "@/lib/domain";

const fieldSchema = z.object({
  key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{1,40}$/),
  label: z.string().min(2).max(200),
  type: z.enum(["text", "textarea", "select", "number", "url", "file"]),
  required: z.boolean(),
  help: z.string().max(300).optional(),
  options: z.array(z.string().min(1)).optional(),
  maxLength: z.number().int().positive().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  section: z.string().min(2).max(60),
  accept: z.string().optional(),
});

const callSchema = z.object({
  title: z.string().min(5).max(120),
  theme: z.string().min(2).max(60),
  sector: z.enum(CALL_SECTORS),
  ventureStage: z.enum(VENTURE_STAGES),
  tagline: z.string().min(10).max(200),
  description: z.string().min(20).max(5000),
  prizePool: z.number().int().min(0),
  opensAt: z.coerce.date(),
  closesAt: z.coerce.date(),
  status: z.enum(["DRAFT", "OPEN"]),
  fields: z.array(fieldSchema).min(3),
  criteria: z.array(z.object({ name: z.string().min(2), description: z.string().min(2), weight: z.number().int().min(1).max(100), maxScore: z.number().int().min(3).max(10) })).min(1),
  stages: z.array(z.object({ name: z.string().min(2), kind: z.enum(["SCREENING", "PANEL", "ADJUDICATION", "AWARD"]), description: z.string().min(2), minReviewers: z.number().int().min(0).max(10), blind: z.boolean() })).min(2),
});

export type CallInput = z.infer<typeof callSchema>;

export async function createCall(input: CallInput) {
  const user = await assertRole("ADMIN");
  const parsed = callSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).slice(0, 4).join("; ") };
  const d = parsed.data;
  const weights = d.criteria.reduce((a, c) => a + c.weight, 0);
  if (weights !== 100) return { error: `Criteria weights must add up to 100 (now ${weights}).` };
  if (d.closesAt <= d.opensAt) return { error: "The closing date must be after the opening date." };
  if (!d.fields.some((f) => f.key === "title") || !d.fields.some((f) => f.key === "summary")) return { error: "Keep the 'title' and 'summary' questions; every idea needs them." };
  const keys = new Set<string>();
  for (const f of d.fields) {
    if (keys.has(f.key)) return { error: `Two questions share the key "${f.key}".` };
    keys.add(f.key);
  }
  if (!d.stages.some((s) => s.kind === "ADJUDICATION")) return { error: "Include a committee adjudication stage." };
  let slug = d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
  if (await prisma.call.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  const call = await prisma.call.create({
    data: {
      slug,
      title: d.title,
      theme: d.theme,
      sector: d.sector,
      ventureStage: d.ventureStage,
      tagline: d.tagline,
      description: d.description,
      prizePool: d.prizePool,
      opensAt: d.opensAt,
      closesAt: d.closesAt,
      status: d.status,
      formSchema: JSON.stringify(d.fields as FormField[]),
      criteria: { create: d.criteria.map((c, i) => ({ ...c, order: i + 1 })) },
      stages: { create: d.stages.map((s, i) => ({ ...s, order: i + 1 })) },
    },
  });
  await audit({ actorId: user.id, actorRole: user.role, action: "call.created", entity: "Call", entityId: call.id, meta: { slug, fields: d.fields.length, criteria: d.criteria.length, stages: d.stages.length } });
  revalidatePath("/app/admin/calls");
  return { ok: true, slug };
}

export async function setCallStatus(form: FormData) {
  const user = await assertRole("ADMIN");
  const id = String(form.get("callId"));
  const status = String(form.get("status"));
  if (!["DRAFT", "OPEN", "REVIEW", "CLOSED"].includes(status)) throw new Error("Bad status");
  await prisma.call.update({ where: { id }, data: { status } });
  await audit({ actorId: user.id, actorRole: user.role, action: "call.status_changed", entity: "Call", entityId: id, meta: { status } });
  revalidatePath("/app/admin/calls");
}
