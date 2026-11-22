"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { assertRole, getCurrentUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { notify, notifyMany } from "@/lib/notify";
import { CONSENT_PURPOSES, CONSENT_VERSION, DATA_REQUEST_TYPES, type ConsentPurpose } from "@/lib/domain";

export async function setConsent(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in first");
  const purpose = String(form.get("purpose")) as ConsentPurpose;
  const grant = form.get("grant") === "1";
  if (!CONSENT_PURPOSES[purpose]) throw new Error("Unknown purpose");
  if (CONSENT_PURPOSES[purpose].required && !grant) throw new Error("This consent is needed while you have active applications. Use 'Erase my data' to leave the portal.");
  await prisma.consent.updateMany({ where: { userId: user.id, purpose, withdrawnAt: null }, data: { withdrawnAt: new Date() } });
  await prisma.consent.create({ data: { userId: user.id, purpose, granted: grant, version: CONSENT_VERSION } });
  await audit({ actorId: user.id, actorRole: user.role, action: grant ? "consent.granted" : "consent.withdrawn", entity: "Consent", meta: { purpose, version: CONSENT_VERSION } });
  revalidatePath("/app/privacy");
}

export async function requestRights(form: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Sign in first");
  const type = String(form.get("type")) as keyof typeof DATA_REQUEST_TYPES;
  const details = String(form.get("details") ?? "").trim().slice(0, 2000);
  if (!DATA_REQUEST_TYPES[type]) throw new Error("Unknown request");
  const count = await prisma.dataRequest.count();
  const req = await prisma.dataRequest.create({
    data: { reference: `DSR-${String(count + 1).padStart(4, "0")}`, userId: user.id, type, details: details || DATA_REQUEST_TYPES[type], dueAt: new Date(Date.now() + 30 * 86400000) },
  });
  if (type === "RESTRICTION") await prisma.user.update({ where: { id: user.id }, data: { restricted: true } });
  await audit({ actorId: user.id, actorRole: user.role, action: "dsr.created", entity: "DataRequest", entityId: req.id, meta: { type } });
  const dpos = await prisma.user.findMany({ where: { role: "DPO" }, select: { id: true } });
  await notifyMany(dpos.map((d) => d.id), { title: `New data rights request: ${req.reference}`, body: `${DATA_REQUEST_TYPES[type]}. Due in 30 days.`, href: "/app/dpo#requests", kind: "ACTION", channels: ["IN_APP", "EMAIL"] });
  await notify({ userId: user.id, title: "We received your request", body: `${req.reference}: CEDA's Data Protection Officer will respond within 30 days.`, href: "/app/privacy", kind: "INFO" });
  revalidatePath("/app/privacy");
}

/** DPO resolves a request. Erasure anonymises personal data but keeps the anonymous record for statistics and audit. */
export async function resolveRequest(form: FormData) {
  const dpo = await assertRole("DPO");
  const id = String(form.get("requestId"));
  const outcome = String(form.get("outcome"));
  const resolution = String(form.get("resolution") ?? "").trim() || (outcome === "COMPLETED" ? "Completed" : "Rejected");
  const req = await prisma.dataRequest.findUniqueOrThrow({ where: { id }, include: { user: true } });
  if (outcome === "COMPLETED" && req.type === "ERASURE") {
    const anon = `erased-${req.user.id.slice(-6)}`;
    await prisma.$transaction([
      prisma.user.update({ where: { id: req.userId }, data: { name: "Erased user", email: `${anon}@erased.ceda.bw`, phone: null, dateOfBirth: null, anonymisedAt: new Date(), passwordHash: "!" } }),
      prisma.notification.deleteMany({ where: { userId: req.userId } }),
    ]);
  }
  if (outcome === "COMPLETED" && req.type === "OBJECTION") {
    await prisma.consent.updateMany({ where: { userId: req.userId, purpose: { in: ["MARKETING", "SHOWCASE"] }, withdrawnAt: null }, data: { withdrawnAt: new Date() } });
  }
  await prisma.dataRequest.update({ where: { id }, data: { status: outcome === "COMPLETED" ? "COMPLETED" : "REJECTED", resolution, resolvedAt: new Date(), handlerId: dpo.id } });
  await audit({ actorId: dpo.id, actorRole: dpo.role, action: `dsr.${outcome.toLowerCase()}`, entity: "DataRequest", entityId: id, meta: { type: req.type } });
  if (!(outcome === "COMPLETED" && req.type === "ERASURE")) {
    await notify({ userId: req.userId, title: `Update on ${req.reference}`, body: resolution, href: "/app/privacy", kind: "INFO" });
  }
  revalidatePath("/app/dpo");
}

export async function logBreach(form: FormData) {
  const dpo = await assertRole("DPO");
  const count = await prisma.breachIncident.count();
  const b = await prisma.breachIncident.create({
    data: {
      reference: `BR-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`,
      title: String(form.get("title")).slice(0, 200),
      description: String(form.get("description")).slice(0, 3000),
      severity: String(form.get("severity")),
      affectedCount: Number(form.get("affectedCount") ?? 0),
      dataTypes: String(form.get("dataTypes") ?? "").slice(0, 300),
      discoveredAt: form.get("discoveredAt") ? new Date(String(form.get("discoveredAt"))) : new Date(),
      isDrill: form.get("isDrill") === "on",
    },
  });
  await audit({ actorId: dpo.id, actorRole: dpo.role, action: "breach.logged", entity: "BreachIncident", entityId: b.id, meta: { severity: b.severity, drill: b.isDrill } });
  const admins = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "DPO"] } }, select: { id: true } });
  await notifyMany(admins.map((a) => a.id), { title: `Breach logged: ${b.reference}`, body: "72-hour clock to notify the Commission has started.", href: "/app/dpo#breaches", kind: "WARNING", channels: ["IN_APP", "EMAIL", "SMS"] });
  revalidatePath("/app/dpo");
}

export async function breachStep(form: FormData) {
  const dpo = await assertRole("DPO");
  const id = String(form.get("breachId"));
  const step = String(form.get("step"));
  const now = new Date();
  const data =
    step === "contain" ? { containedAt: now, status: "CONTAINED" } :
    step === "commission" ? { commissionNotifiedAt: now, status: "REPORTED" } :
    step === "subjects" ? { subjectsNotifiedAt: now } :
    step === "close" ? { status: "CLOSED" } : null;
  if (!data) throw new Error("Unknown step");
  await prisma.breachIncident.update({ where: { id }, data });
  await audit({ actorId: dpo.id, actorRole: dpo.role, action: `breach.${step}`, entity: "BreachIncident", entityId: id });
  revalidatePath("/app/dpo");
}

/** Applies retention rules: anonymises declined/withdrawn applicants whose call closed more than N months ago. */
export async function runRetention() {
  const dpo = await assertRole("DPO");
  const policy = await prisma.retentionPolicy.findUnique({ where: { dataType: "UNSUCCESSFUL_APPLICATION" } });
  const months = policy?.months ?? 24;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  const subs = await prisma.submission.findMany({
    where: { status: { in: ["DECLINED", "WITHDRAWN"] }, call: { closesAt: { lt: cutoff } }, owner: { anonymisedAt: null } },
    select: { ownerId: true },
  });
  const owners = [...new Set(subs.map((s) => s.ownerId))];
  for (const id of owners) {
    // Keep anyone who also has an active or awarded idea.
    const active = await prisma.submission.count({ where: { ownerId: id, status: { notIn: ["DECLINED", "WITHDRAWN"] } } });
    if (active) continue;
    await prisma.user.update({ where: { id }, data: { name: "Anonymised applicant", email: `anon-${id.slice(-8)}@erased.ceda.bw`, phone: null, dateOfBirth: null, anonymisedAt: new Date(), passwordHash: "!" } });
  }
  await prisma.retentionPolicy.updateMany({ data: { lastRunAt: new Date() } });
  await audit({ actorId: dpo.id, actorRole: dpo.role, action: "retention.run", entity: "RetentionPolicy", meta: { candidates: owners.length, months } });
  revalidatePath("/app/dpo");
  return owners.length;
}
