"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE, SESSION_HOURS } from "@/lib/session";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { checkEligibility } from "@/lib/eligibility";
import { CONSENT_PURPOSES, CONSENT_VERSION, ROLE_INFO, type ConsentPurpose, type Role } from "@/lib/domain";
import { getSession } from "@/lib/auth";

async function startSession(user: { id: string; role: string; name: string }) {
  const token = await createSessionToken({ sub: user.id, role: user.role as Role, name: user.name });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
}

// Simple in-memory throttle against password guessing (per email, per instance).
const attempts = new Map<string, { n: number; until: number }>();

export type FormState = { error?: string; fieldErrors?: Record<string, string> } | undefined;

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "");
  const a = attempts.get(email);
  if (a && a.n >= 5 && a.until > Date.now()) {
    return { error: "Too many attempts. Wait 5 minutes and try again." };
  }
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && !user.anonymisedAt && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    const n = (a?.n ?? 0) + 1;
    attempts.set(email, { n, until: Date.now() + 5 * 60_000 });
    await audit({ action: "auth.login_failed", entity: "User", meta: { email } });
    return { error: "That email and password don't match." };
  }
  attempts.delete(email);
  await startSession(user);
  await audit({ actorId: user.id, actorRole: user.role, action: "auth.login", entity: "User", entityId: user.id });
  redirect(next.startsWith("/app") ? next : ROLE_INFO[user.role as Role].home);
}

/** Judge quick access: signs in as a seeded demo account. Disabled unless DEMO_MODE=true. */
export async function demoLogin(form: FormData) {
  if (process.env.DEMO_MODE !== "true") throw new Error("Demo access is off");
  const email = String(form.get("email") ?? "");
  const next = String(form.get("next") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !email.endsWith("@demo.ceda.bw")) throw new Error("Unknown demo account");
  await startSession(user);
  (await cookies()).set("sky_judge", "1", { path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax" });
  await audit({ actorId: user.id, actorRole: user.role, action: "auth.demo_login", entity: "User", entityId: user.id });
  redirect(next.startsWith("/app") ? next : ROLE_INFO[user.role as Role].home);
}

export async function logout() {
  const session = await getSession();
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  if (session) await audit({ actorId: session.sub, actorRole: session.role, action: "auth.logout", entity: "User", entityId: session.sub });
  redirect("/");
}

const registerSchema = z.object({
  name: z.string().trim().min(3, "Enter your full name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().regex(/^(\+267)?\s?7\d{7}$/, "Use a Botswana mobile number, e.g. 71234567"),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .regex(/[A-Z]/, "Add a capital letter")
    .regex(/[0-9]/, "Add a number"),
  dateOfBirth: z.coerce.date({ message: "Enter your date of birth" }),
  gender: z.enum(["Female", "Male", "Prefer not to say"]),
  district: z.string().min(2, "Choose your district"),
  citizen: z.literal("on", { message: "CEDA calls are open to Batswana citizens" }),
  orgName: z.string().trim().min(2, "Enter your company name"),
  uin: z.string().trim().toUpperCase(),
  youthShareholdingPct: z.coerce.number().int().min(0).max(100),
  sector: z.string().min(2, "Choose a sector"),
  employees: z.coerce.number().int().min(1).max(10000),
});

export async function register(_: FormState, form: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { error: "Some details need attention.", fieldErrors };
  }
  const d = parsed.data;
  const consents = (Object.keys(CONSENT_PURPOSES) as ConsentPurpose[]).map((p) => ({
    purpose: p,
    granted: form.get(`consent_${p}`) === "on",
  }));
  const missing = consents.find((c) => CONSENT_PURPOSES[c.purpose].required && !c.granted);
  if (missing) return { error: "Please accept the two required consents so CEDA can process your application." };

  const elig = checkEligibility({ dateOfBirth: d.dateOfBirth, citizen: true, uin: d.uin, youthShareholdingPct: d.youthShareholdingPct });
  if (!elig.eligible) {
    const failed = elig.checks.filter((c) => !c.ok).map((c) => c.label.toLowerCase());
    return { error: `Not eligible yet: ${failed.join("; ")}.` };
  }
  if (await prisma.user.findUnique({ where: { email: d.email } })) {
    return { error: "An account with that email already exists. Sign in instead." };
  }
  const existingOrg = await prisma.organisation.findUnique({ where: { uin: d.uin } });
  const org =
    existingOrg ??
    (await prisma.organisation.create({
      data: {
        name: d.orgName,
        uin: d.uin,
        youthShareholdingPct: d.youthShareholdingPct,
        district: d.district,
        sector: d.sector,
        employees: d.employees,
      },
    }));
  const user = await prisma.user.create({
    data: {
      name: d.name,
      email: d.email,
      phone: d.phone,
      passwordHash: await bcrypt.hash(d.password, 12),
      dateOfBirth: d.dateOfBirth,
      gender: d.gender,
      district: d.district,
      role: "INNOVATOR",
      orgId: org.id,
      consents: { create: consents.map((c) => ({ purpose: c.purpose, granted: c.granted, version: CONSENT_VERSION })) },
    },
  });
  await audit({
    actorId: user.id,
    actorRole: "INNOVATOR",
    action: "user.registered",
    entity: "User",
    entityId: user.id,
    meta: { org: org.uin, consents: consents.filter((c) => c.granted).map((c) => c.purpose), consentVersion: CONSENT_VERSION },
  });
  await notify({
    userId: user.id,
    title: "Welcome to the CEDA Innovation Portal",
    body: "Your account is ready. Browse open CEDA calls and start your first submission.",
    href: "/app/innovator",
    kind: "SUCCESS",
  });
  await startSession(user);
  redirect("/app/innovator");
}
