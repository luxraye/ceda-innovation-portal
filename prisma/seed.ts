/* Seeds Sky with a believable, fully fictional programme so every screen has something to show. */
import { readFileSync, existsSync } from "node:fs";
if (existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { canonicalJson, encryptFile, sha256, signReceipt } from "../src/lib/crypto";
import { audit } from "../src/lib/audit";
import { CONSENT_VERSION } from "../src/lib/domain";
import { DEFAULT_CRITERIA, DEFAULT_FORM, DEFAULT_STAGES } from "../src/lib/templates";
import { DEMO_PASSWORD } from "../src/lib/demo";
import { AGRI_IDEAS, EVALUATORS, GREEN_IDEAS, INNOVATORS, YOUTH_IDEAS, type Idea } from "./seed-data";

const prisma = new PrismaClient();
const NOW = Date.now();
const day = (n: number, h = 10) => new Date(NOW + n * 86400000 + (h - 12) * 3600000);

// Deterministic randomness so every seed looks the same.
let rng = 42;
const rand = () => ((rng = (rng * 1103515245 + 12345) % 2147483648) / 2147483648);

type AuditEvent = { at: Date; actorId?: string; actorRole?: string; action: string; entity?: string; entityId?: string; meta?: Record<string, unknown> };
const auditQueue: AuditEvent[] = [];
const log = (e: AuditEvent) => auditQueue.push(e);

function demoPdf(title: string, subtitle: string) {
  const text = `BT /F1 22 Tf 60 740 Td (${title.replace(/[()\\]/g, "")}) Tj ET BT /F1 12 Tf 60 712 Td (${subtitle.replace(/[()\\]/g, "")}) Tj ET BT /F1 10 Tf 60 690 Td (Fictional demo document generated for the Sky prototype.) Tj ET`;
  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${text.length} >>\nstream\n${text}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objs.forEach((o, i) => {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, "latin1");
}

async function reset() {
  // Children first.
  await prisma.$transaction([
    prisma.score.deleteMany(), prisma.assignment.deleteMany(), prisma.decision.deleteMany(), prisma.feedback.deleteMany(),
    prisma.stageEvent.deleteMany(), prisma.submissionFile.deleteMany(), prisma.submissionVersion.deleteMany(), prisma.submission.deleteMany(),
    prisma.criterion.deleteMany(), prisma.stage.deleteMany(), prisma.call.deleteMany(), prisma.notification.deleteMany(),
    prisma.consent.deleteMany(), prisma.dataRequest.deleteMany(), prisma.auditLog.deleteMany(), prisma.user.deleteMany(),
    prisma.organisation.deleteMany(), prisma.breachIncident.deleteMany(), prisma.retentionPolicy.deleteMany(),
  ]);
}

async function main() {
  await reset();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------- Staff ----------
  const admin = await prisma.user.create({ data: { email: "admin@demo.ceda.bw", name: "Kagiso Dintwe", role: "ADMIN", title: "Innovation Programme Manager, CEDA", passwordHash, gender: "Male", district: "Gaborone" } });
  const adj = await prisma.user.create({ data: { email: "lesego.adj@demo.ceda.bw", name: "Lesego Molefe", role: "ADJUDICATOR", title: "Innovation Committee member", passwordHash, gender: "Female", district: "Gaborone" } });
  const adj2 = await prisma.user.create({ data: { email: "pako.adj@demo.ceda.bw", name: "Pako Mosweu", role: "ADJUDICATOR", title: "Innovation Committee chair", passwordHash, gender: "Male", district: "Gaborone" } });
  const dpo = await prisma.user.create({ data: { email: "dpo@demo.ceda.bw", name: "Boitumelo Ramotswa", role: "DPO", title: "Data Protection Officer, CEDA", passwordHash, gender: "Female", district: "Gaborone" } });
  const evals = await Promise.all(EVALUATORS.map((e) => prisma.user.create({ data: { email: e.email, name: e.name, role: "EVALUATOR", title: e.title, passwordHash, district: "Gaborone" } })));
  const evalBias = new Map(evals.map((e, i) => [e.id, EVALUATORS[i].bias]));
  const [thabo, onalenna, kefilwe, gaone, amantle] = evals;

  // ---------- Calls ----------
  const fields = DEFAULT_FORM;
  const mkCall = (d: { slug: string; title: string; theme: string; sector: string; ventureStage: string; tagline: string; description: string; prizePool: number; opensAt: Date; closesAt: Date; status: string }) =>
    prisma.call.create({
      data: {
        ...d,
        formSchema: JSON.stringify(fields),
        criteria: { create: DEFAULT_CRITERIA.map((c, i) => ({ ...c, order: i + 1, maxScore: 10 })) },
        stages: { create: DEFAULT_STAGES.map((s, i) => ({ ...s, order: i + 1 })) },
      },
      include: { stages: { orderBy: { order: "asc" } }, criteria: { orderBy: { order: "asc" } } },
    });
  const youth = await mkCall({
    slug: "youth-innovation-challenge-2026",
    title: "Youth Innovation Challenge 2026",
    theme: "Digital economy",
    sector: "Digital & ICT",
    ventureStage: "Prototype",
    tagline: "Digital products that help Botswana's businesses, learners and patients do more with less.",
    description: "CEDA invites youth-owned companies to propose digital solutions with clear commercial potential in Botswana. We are especially interested in financial inclusion, education, health and logistics.\n\nShortlisted teams will pitch to the CEDA innovation committee. Winners receive funding from a P1.5 million pool, mentoring and a place in CEDA's aftercare programme.",
    prizePool: 1500000,
    opensAt: day(-18),
    closesAt: day(24, 17),
    status: "OPEN",
  });
  const agri = await mkCall({
    slug: "agri-tech-food-security-2026",
    title: "Agri-Tech & Food Security Challenge 2026",
    theme: "Agriculture",
    sector: "Agriculture & Agro-processing",
    ventureStage: "Pilot",
    tagline: "Technology and new business models that help Botswana grow, store and sell more of its own food.",
    description: "Food import substitution is a national priority. This call funds youth-led ideas across the agricultural value chain: inputs, production, storage, processing and market access.\n\nApplications closed and panels are now reviewing. The committee will announce winners after pitch sessions.",
    prizePool: 1000000,
    opensAt: day(-80),
    closesAt: day(-23, 17),
    status: "REVIEW",
  });
  const green = await mkCall({
    slug: "green-economy-innovation-2026",
    title: "Green Economy Innovation Call 2026",
    theme: "Energy & environment",
    sector: "Energy & Environment",
    ventureStage: "Idea",
    tagline: "Clean energy, recycling and climate-smart products built in Botswana, for Botswana.",
    description: "CEDA seeks youth-owned businesses that cut emissions, reduce waste or bring clean energy to communities. Manufacturing ideas that use local inputs are encouraged.",
    prizePool: 750000,
    opensAt: day(-5),
    closesAt: day(39, 17),
    status: "OPEN",
  });
  for (const c of [agri, youth, green]) log({ at: new Date(c.opensAt.getTime() - 2 * 86400000), actorId: admin.id, actorRole: "ADMIN", action: "call.created", entity: "Call", entityId: c.id, meta: { slug: c.slug } });

  // ---------- Innovators ----------
  const naledi = await prisma.user.create({
    data: {
      email: "naledi@demo.ceda.bw", name: "Naledi Sebego", role: "INNOVATOR", passwordHash, phone: "+267 71 234 567", gender: "Female", district: "Kgalagadi", dateOfBirth: new Date("1998-04-12"),
      org: { create: { name: "Pula Sense (Pty) Ltd", uin: "BW00001234567", youthShareholdingPct: 100, district: "Kgalagadi", sector: "Agriculture & Agro-processing", employees: 4, verified: true, incorporatedOn: new Date("2025-03-02") } },
    },
    include: { org: true },
  });
  const innovators = [naledi];
  for (const [i, p] of INNOVATORS.entries()) {
    const u = await prisma.user.create({
      data: {
        email: `${p.name.split(" ")[0].toLowerCase()}@example.bw`, name: p.name, role: "INNOVATOR", passwordHash, gender: p.gender, district: p.district, phone: `+267 7${i} ${100 + i * 7} ${300 + i * 11}`,
        dateOfBirth: new Date(1991 + (i % 12), i % 12, 3 + i),
        org: { create: { name: p.org, uin: `BW0000${String(2000000 + i * 7919).padStart(7, "0")}`, youthShareholdingPct: p.youth, district: p.district, sector: "", employees: 2 + (i % 6), verified: i % 3 !== 0 } },
      },
      include: { org: true },
    });
    innovators.push(u);
  }
  for (const u of innovators) {
    const at = new Date(day(-70).getTime() + rand() * 50 * 86400000);
    await prisma.consent.createMany({
      data: [
        { userId: u.id, purpose: "PROCESSING", granted: true, version: CONSENT_VERSION, grantedAt: at },
        { userId: u.id, purpose: "EVALUATION_SHARING", granted: true, version: CONSENT_VERSION, grantedAt: at },
        { userId: u.id, purpose: "SHOWCASE", granted: rand() > 0.3, version: CONSENT_VERSION, grantedAt: at },
        { userId: u.id, purpose: "MARKETING", granted: rand() > 0.55, version: CONSENT_VERSION, grantedAt: at },
      ],
    });
    log({ at, actorId: u.id, actorRole: "INNOVATOR", action: "user.registered", entity: "User", entityId: u.id, meta: { consentVersion: CONSENT_VERSION } });
  }
  const byName = (n: string) => innovators.find((u) => u.name === n)!;

  // ---------- Submission builder ----------
  let refNo = 0;
  type CallT = typeof agri;
  const answersFor = (idea: Idea): Record<string, string> => ({
    title: idea.title, summary: idea.summary, sector: idea.sector, problem: idea.problem, solution: idea.solution, innovation: idea.innovation,
    market: idea.market, jobs: idea.jobs, impact: idea.impact, stage: idea.stage, funding: idea.funding, useOfFunds: idea.useOfFunds, team: idea.team,
    demoUrl: `https://demo.example.bw/${idea.title.toLowerCase().replace(/[^a-z]+/g, "-")}`,
  });

  async function seal(subId: string, reference: string, version: number, answers: Record<string, string>, at: Date, note: string) {
    const files = (await prisma.submissionFile.findMany({ where: { submissionId: subId } })).map((f) => ({ slot: f.slot, name: f.fileName, sha256: f.sha256, size: f.size })).sort((a, b) => a.slot.localeCompare(b.slot));
    const json = canonicalJson({ reference, version, answers, files });
    const hash = sha256(json);
    return prisma.submissionVersion.create({ data: { submissionId: subId, version, payload: json, sha256: hash, signature: signReceipt([reference, String(version), hash, at.toISOString()]), note, createdAt: at } });
  }

  async function makeSubmission(call: CallT, owner: (typeof innovators)[number], idea: Idea, submittedDay: number, opts: { draftOnly?: boolean; v1?: Record<string, string> } = {}) {
    refNo++;
    const reference = `CEDA-26-${String(refNo).padStart(4, "0")}`;
    const answers = answersFor(idea);
    await prisma.organisation.update({ where: { id: owner.orgId! }, data: { sector: idea.sector } });
    const sub = await prisma.submission.create({
      data: { reference, callId: call.id, orgId: owner.orgId!, ownerId: owner.id, title: idea.title, summary: idea.summary, sector: idea.sector, status: opts.draftOnly ? "DRAFT" : "SUBMITTED", draft: JSON.stringify(opts.draftOnly ? { title: idea.title, summary: idea.summary, sector: idea.sector, problem: idea.problem } : answers), createdAt: day(submittedDay - 3), submittedAt: opts.draftOnly ? null : day(submittedDay) },
    });
    if (opts.draftOnly) return { sub, reference };
    for (const [slot, label] of [["pitchDeck", "Pitch deck"], ["cipaCert", "Certificate of incorporation"]] as const) {
      const bytes = demoPdf(`${idea.title}: ${label}`, owner.org?.name ?? "");
      const enc = encryptFile(bytes);
      await prisma.submissionFile.create({ data: { submissionId: sub.id, slot, fileName: `${idea.title.replace(/[^A-Za-z]+/g, "-")}-${slot}.pdf`, mimeType: "application/pdf", size: bytes.length, sha256: sha256(bytes), iv: enc.iv, authTag: enc.authTag, data: enc.data, uploadedAt: day(submittedDay, 9) } });
    }
    const v = await seal(sub.id, reference, 1, opts.v1 ?? answers, day(submittedDay), "First submission");
    const screening = call.stages[0];
    await prisma.submission.update({ where: { id: sub.id }, data: { currentVersion: 1, stageId: screening.id } });
    await prisma.stageEvent.create({ data: { submissionId: sub.id, stageName: screening.name, status: "SUBMITTED", label: "Idea submitted", note: `Sealed with SHA-256 ${v.sha256.slice(0, 12)}...`, actorId: owner.id, createdAt: day(submittedDay) } });
    log({ at: day(submittedDay), actorId: owner.id, actorRole: "INNOVATOR", action: "submission.submitted", entity: "Submission", entityId: sub.id, meta: { version: 1, sha256: v.sha256 } });
    await prisma.notification.create({ data: { userId: owner.id, title: "Submission received", body: `${reference} is sealed. Your receipt is ready.`, href: `/app/innovator/submissions/${sub.id}`, kind: "SUCCESS", channels: "IN_APP,EMAIL,SMS", createdAt: day(submittedDay), readAt: day(submittedDay + 1) } });
    return { sub, reference };
  }

  async function move(subId: string, call: CallT, toOrder: number, at: Date, actor: { id: string; role: string }, rationale: string, ownerId: string, ref: string) {
    const from = await prisma.submission.findUniqueOrThrow({ where: { id: subId }, include: { stage: true } });
    const to = call.stages.find((s) => s.order === toOrder)!;
    await prisma.decision.create({ data: { submissionId: subId, stageId: from.stageId!, deciderId: actor.id, outcome: "ADVANCE", rationale, createdAt: at } });
    await prisma.submission.update({ where: { id: subId }, data: { stageId: to.id, status: "IN_REVIEW" } });
    await prisma.stageEvent.create({ data: { submissionId: subId, stageName: to.name, status: "IN_REVIEW", label: `Advanced to ${to.name}`, note: rationale, actorId: actor.id, createdAt: at } });
    await prisma.notification.create({ data: { userId: ownerId, title: `Good news: ${ref} moved to ${to.name}`, body: `Your idea passed ${from.stage?.name}.`, href: `/app/innovator/submissions/${subId}`, kind: "SUCCESS", channels: "IN_APP,EMAIL,SMS", createdAt: at, readAt: new Date(at.getTime() + 3600000) } });
    log({ at, actorId: actor.id, actorRole: actor.role, action: "decision.advance", entity: "Submission", entityId: subId, meta: { to: to.name } });
  }

  async function finalDecision(subId: string, call: CallT, outcome: "DECLINE" | "AWARD" | "REQUEST_CHANGES", at: Date, actor: { id: string; role: string }, rationale: string, ownerId: string, ref: string, amount?: number) {
    const cur = await prisma.submission.findUniqueOrThrow({ where: { id: subId }, include: { stage: true } });
    const awardStage = call.stages.find((s) => s.kind === "AWARD")!;
    const status = outcome === "AWARD" ? "AWARDED" : outcome === "DECLINE" ? "DECLINED" : "CHANGES_REQUESTED";
    await prisma.decision.create({ data: { submissionId: subId, stageId: cur.stageId!, deciderId: actor.id, outcome, rationale, awardAmount: amount, createdAt: at } });
    await prisma.submission.update({ where: { id: subId }, data: { status, stageId: outcome === "AWARD" ? awardStage.id : cur.stageId, awardAmount: amount } });
    await prisma.stageEvent.create({ data: { submissionId: subId, stageName: outcome === "AWARD" ? awardStage.name : cur.stage!.name, status, label: outcome === "AWARD" ? `Awarded P${amount!.toLocaleString("en-BW")}` : outcome === "DECLINE" ? `Not selected at ${cur.stage!.name}` : "Changes requested", note: rationale, actorId: actor.id, createdAt: at } });
    await prisma.feedback.create({ data: { submissionId: subId, authorId: actor.id, body: rationale, kind: outcome === "REQUEST_CHANGES" ? "CHANGE_REQUEST" : "COMMENT", visibility: "APPLICANT", createdAt: at } });
    await prisma.notification.create({ data: { userId: ownerId, title: outcome === "AWARD" ? `You've been awarded P${amount!.toLocaleString("en-BW")}` : outcome === "DECLINE" ? `Decision on ${ref}` : `Action needed on ${ref}`, body: outcome === "REQUEST_CHANGES" ? "The panel asked you to improve your submission." : "Read the details in Sky.", href: `/app/innovator/submissions/${subId}`, kind: outcome === "DECLINE" ? "WARNING" : outcome === "AWARD" ? "SUCCESS" : "ACTION", channels: "IN_APP,EMAIL,SMS", createdAt: at } });
    log({ at, actorId: actor.id, actorRole: actor.role, action: `decision.${outcome.toLowerCase()}`, entity: "Submission", entityId: subId, meta: { amount: amount ?? null } });
  }

  async function panel(subId: string, call: CallT, quality: number, plan: { ev: (typeof evals)[number]; status: "DONE" | "PENDING" | "IN_PROGRESS" | "CONFLICT"; skew?: number }[], assignedDay: number, ref: string, ownerId: string) {
    const stage = call.stages.find((s) => s.kind === "PANEL")!;
    for (const [i, p] of plan.entries()) {
      const coi = p.status !== "PENDING" ? day(assignedDay + 1 + i * 0.3) : null;
      const doneAt = p.status === "DONE" ? day(assignedDay + 3 + i) : null;
      const a = await prisma.assignment.create({
        data: { submissionId: subId, stageId: stage.id, evaluatorId: p.ev.id, status: p.status, coiDeclaredAt: coi, conflictNote: p.status === "CONFLICT" ? "Former colleague of a founder" : null, dueAt: day(assignedDay + 7, 17), completedAt: doneAt, createdAt: day(assignedDay), overall: p.status === "DONE" ? (quality > 0.75 ? "Strong team and clear path to market. Recommend shortlisting." : quality > 0.65 ? "Promising but evidence is thin in places." : "Not ready for funding at this stage.") : null },
      });
      log({ at: day(assignedDay), actorId: admin.id, actorRole: "ADMIN", action: "panel.assigned", entity: "Submission", entityId: subId, meta: { evaluator: p.ev.id } });
      if (coi) log({ at: coi, actorId: p.ev.id, actorRole: "EVALUATOR", action: p.status === "CONFLICT" ? "coi.declared_conflict" : "coi.declared_none", entity: "Assignment", entityId: a.id, meta: { submission: ref } });
      if (p.status === "DONE" || p.status === "IN_PROGRESS") {
        const bias = (evalBias.get(p.ev.id) ?? 0) + (p.skew ?? 0);
        const crits = p.status === "DONE" ? call.criteria : call.criteria.slice(0, 2);
        for (const c of crits) {
          const v = Math.max(1, Math.min(10, Math.round(quality * 10 + bias + (rand() - 0.5) * 2)));
          await prisma.score.create({ data: { assignmentId: a.id, criterionId: c.id, value: v, comment: v >= 8 ? `Strong on ${c.name.toLowerCase()}.` : v <= 5 ? `Needs more evidence on ${c.name.toLowerCase()}.` : null } });
        }
        if (p.status === "DONE") log({ at: doneAt!, actorId: p.ev.id, actorRole: "EVALUATOR", action: "scores.submitted", entity: "Assignment", entityId: a.id, meta: { submission: ref } });
      }
      if (p.status === "PENDING" && p.ev.id === thabo.id) {
        await prisma.notification.create({ data: { userId: thabo.id, title: "New idea to review", body: `${ref} is waiting in your queue. Due in 7 days.`, href: "/app/evaluator", kind: "ACTION", channels: "IN_APP,EMAIL", createdAt: day(assignedDay) } });
      }
    }
    void ownerId;
  }

  // ---------- Agri call: a full review cycle ----------
  const [pula, morula, kgomo, thaba, aqua, sorghum, vet, honey] = AGRI_IDEAS;
  const agriOwners = [naledi, byName("Onkemetse Tau"), byName("Boipelo Mokgadi"), byName("Thato Kebaabetswe"), byName("Masego Phiri"), byName("Kitso Modise"), byName("Dineo Mmusi"), byName("Lorato Segwai")];
  const pulaV1 = { ...answersFor(pula), solution: "A P450 probe measures soil moisture every hour and sends readings to our gateway. Farmers receive an SMS each morning telling them whether to water.", market: "Smallholder horticulture farmers in Botswana. We will sell probes and an SMS plan." };
  const s = [] as { sub: { id: string }; reference: string }[];
  s.push(await makeSubmission(agri, naledi, pula, -45, { v1: pulaV1 }));
  s.push(await makeSubmission(agri, agriOwners[1], morula, -40));
  s.push(await makeSubmission(agri, agriOwners[2], kgomo, -37));
  s.push(await makeSubmission(agri, agriOwners[3], thaba, -52));
  s.push(await makeSubmission(agri, agriOwners[4], aqua, -33));
  s.push(await makeSubmission(agri, agriOwners[5], sorghum, -30));
  s.push(await makeSubmission(agri, agriOwners[6], vet, -27));
  s.push(await makeSubmission(agri, agriOwners[7], honey, -25));
  const A = { id: admin.id, role: "ADMIN" };
  const J = { id: adj.id, role: "ADJUDICATOR" };
  const J2 = { id: adj2.id, role: "ADJUDICATOR" };

  // Screening
  for (const [i, x] of s.entries()) {
    if (i === 5) continue;
    await move(x.sub.id, agri, 2, day(-21 + i * 0.2), A, "Company, youth shareholding and documents verified.", agriOwners[i].id, x.reference);
  }
  await finalDecision(s[5].sub.id, agri, "DECLINE", day(-21), A, "The CIPA certificate uploaded belongs to a different company and the idea has no prototype yet. You're welcome to apply again with corrected documents.", agriOwners[5].id, s[5].reference);

  // Panels
  await panel(s[0].sub.id, agri, 0.72, [{ ev: thabo, status: "DONE" }, { ev: gaone, status: "DONE" }, { ev: kefilwe, status: "DONE" }], -20, s[0].reference, naledi.id);
  await panel(s[1].sub.id, agri, morula.quality, [{ ev: thabo, status: "DONE" }, { ev: onalenna, status: "DONE" }, { ev: gaone, status: "DONE" }], -20, s[1].reference, agriOwners[1].id);
  await panel(s[2].sub.id, agri, kgomo.quality, [{ ev: thabo, status: "DONE", skew: 2.6 }, { ev: onalenna, status: "DONE", skew: -2.4 }, { ev: kefilwe, status: "DONE" }], -19, s[2].reference, agriOwners[2].id);
  await panel(s[3].sub.id, agri, thaba.quality, [{ ev: gaone, status: "DONE" }, { ev: kefilwe, status: "DONE" }, { ev: amantle, status: "CONFLICT" }, { ev: thabo, status: "DONE" }], -20, s[3].reference, agriOwners[3].id);
  await panel(s[4].sub.id, agri, aqua.quality, [{ ev: onalenna, status: "DONE" }, { ev: gaone, status: "DONE" }], -18, s[4].reference, agriOwners[4].id);
  await panel(s[6].sub.id, agri, vet.quality, [{ ev: thabo, status: "PENDING" }, { ev: gaone, status: "DONE" }, { ev: onalenna, status: "IN_PROGRESS" }], -6, s[6].reference, agriOwners[6].id);
  await panel(s[7].sub.id, agri, honey.quality, [{ ev: thabo, status: "PENDING" }, { ev: kefilwe, status: "DONE" }, { ev: gaone, status: "DONE" }], -5, s[7].reference, agriOwners[7].id);

  // Pula Sense: panel asked for pilot evidence, Naledi resubmitted, now at committee.
  await finalDecision(s[0].sub.id, agri, "REQUEST_CHANGES", day(-14), A, "The panel likes the idea but wants evidence. Please add results from your pilot farms (water saved, farmer feedback) and size your market with numbers.", naledi.id, s[0].reference);
  const crit = (name: string) => agri.criteria.find((c) => c.name.startsWith(name))!.id;
  await prisma.feedback.createMany({
    data: [
      { submissionId: s[0].sub.id, authorId: thabo.id, criterionId: crit("Feasibility"), body: "Show pilot data from at least two farms. How much water did they actually save?", kind: "CHANGE_REQUEST", visibility: "APPLICANT", createdAt: day(-15) },
      { submissionId: s[0].sub.id, authorId: kefilwe.id, criterionId: crit("Market"), body: "How many farmers can you reach in year one, and at what price? A number would help.", kind: "CHANGE_REQUEST", visibility: "APPLICANT", createdAt: day(-15) },
      { submissionId: s[0].sub.id, authorId: naledi.id, body: "Thank you. We have results from 14 farms in Tsabong and will add them this week.", kind: "RESPONSE", visibility: "APPLICANT", createdAt: day(-13) },
      { submissionId: s[0].sub.id, authorId: gaone.id, body: "Pilot evidence in v2 is convincing. Revised my view upward.", kind: "COMMENT", visibility: "PANEL", createdAt: day(-9) },
    ],
  });
  const pulaFinal = answersFor({ ...pula, solution: pula.solution + "\n\nPilot results: 14 farms in Tsabong used 38% less borehole water over 10 weeks, and 11 of 14 farmers said they would pay for the service.", market: pula.market });
  const v2 = await seal(s[0].sub.id, s[0].reference, 2, pulaFinal, day(-11), "Resubmitted after feedback");
  await prisma.submission.update({ where: { id: s[0].sub.id }, data: { status: "IN_REVIEW", currentVersion: 2, draft: JSON.stringify(pulaFinal) } });
  await prisma.feedback.updateMany({ where: { submissionId: s[0].sub.id, kind: "CHANGE_REQUEST" }, data: { resolved: true } });
  await prisma.stageEvent.create({ data: { submissionId: s[0].sub.id, stageName: "Panel evaluation", status: "IN_REVIEW", label: "Version 2 resubmitted", note: `Sealed with SHA-256 ${v2.sha256.slice(0, 12)}...`, actorId: naledi.id, createdAt: day(-11) } });
  log({ at: day(-11), actorId: naledi.id, actorRole: "INNOVATOR", action: "submission.resubmitted", entity: "Submission", entityId: s[0].sub.id, meta: { version: 2, sha256: v2.sha256 } });
  // Re-score after resubmission: lift Pula Sense scores.
  const pulaAssign = await prisma.assignment.findMany({ where: { submissionId: s[0].sub.id }, include: { scores: true } });
  for (const a of pulaAssign) for (const sc of a.scores) await prisma.score.update({ where: { id: sc.id }, data: { value: Math.min(10, sc.value + 1) } });

  // To committee
  await move(s[0].sub.id, agri, 3, day(-4), A, "Panel review complete. Strong normalised score after resubmission.", naledi.id, s[0].reference);
  await move(s[1].sub.id, agri, 3, day(-6), A, "Panel review complete.", agriOwners[1].id, s[1].reference);
  await move(s[2].sub.id, agri, 3, day(-5), J, "Panel split on market size; committee to discuss.", agriOwners[2].id, s[2].reference);
  await move(s[3].sub.id, agri, 3, day(-9), A, "Panel review complete. Top ranked.", agriOwners[3].id, s[3].reference);
  await finalDecision(s[4].sub.id, agri, "DECLINE", day(-8), J, "The panel found the household market too small to support the business at this price. Consider selling to schools and lodges first and reapply next round.", agriOwners[4].id, s[4].reference);
  await finalDecision(s[3].sub.id, agri, "AWARD", day(-2), J2, "Awarded for proven sales, a clear import-substitution case and strong unit economics. Funds released in two tranches against milestones.", agriOwners[3].id, s[3].reference, 250000);

  // ---------- Youth call: in flight ----------
  const [spaza, lesedi, tsela, mma, botho, kgwebo] = YOUTH_IDEAS;
  const y1 = await makeSubmission(youth, naledi, spaza, -9);
  await finalDecision(y1.sub.id, youth, "REQUEST_CHANGES", day(-1, 15), A, "Thanks Naledi. Before we can screen this, please upload a CIPA certificate for the company named in the application (we received Pula Sense's), and explain how you will reach shops outside Gaborone.", naledi.id, y1.reference);
  const y2 = await makeSubmission(youth, byName("Tebogo Ntshole"), lesedi, -14);
  await move(y2.sub.id, youth, 2, day(-10), A, "Eligible. Documents verified.", byName("Tebogo Ntshole").id, y2.reference);
  await panel(y2.sub.id, youth, lesedi.quality, [{ ev: amantle, status: "DONE" }, { ev: onalenna, status: "DONE" }, { ev: kefilwe, status: "PENDING" }], -9, y2.reference, "");
  const y3 = await makeSubmission(youth, byName("Oratile Dikgang"), tsela, -1);
  void y3;
  const y4 = await makeSubmission(youth, byName("Neo Gabaitse"), mma, -12);
  await move(y4.sub.id, youth, 2, day(-11), A, "Eligible. Documents verified.", byName("Neo Gabaitse").id, y4.reference);
  const y5 = await makeSubmission(youth, byName("Katlego Masilo"), botho, -13);
  await move(y5.sub.id, youth, 2, day(-9), A, "Eligible. Documents verified.", byName("Katlego Masilo").id, y5.reference);
  await panel(y5.sub.id, youth, botho.quality, [{ ev: amantle, status: "DONE" }, { ev: thabo, status: "IN_PROGRESS" }], -3, y5.reference, "");
  await makeSubmission(youth, byName("Goitseone Rantsho"), kgwebo, -2, { draftOnly: true });

  // ---------- Green call: just opened ----------
  await makeSubmission(green, byName("Mpho Letsholo"), GREEN_IDEAS[0], -2);
  await makeSubmission(green, byName("Refilwe Sebina"), GREEN_IDEAS[1], 0);

  // ---------- Notifications for the demo accounts ----------
  await prisma.notification.createMany({
    data: [
      { userId: naledi.id, title: "Pula Sense reached the committee", body: "The CEDA innovation committee will review it this week.", href: `/app/innovator/submissions/${s[0].sub.id}`, kind: "SUCCESS", channels: "IN_APP,EMAIL,SMS", createdAt: day(-4) },
      { userId: admin.id, title: "Evaluator declared a conflict", body: `${s[3].reference} had a conflict declared by Ms Amantle Kgari.`, href: `/app/admin/submissions/${s[3].sub.id}`, kind: "ACTION", channels: "IN_APP", createdAt: day(-19) },
      { userId: admin.id, title: "New submission", body: `${y3.reference} · ${tsela.title}`, href: `/app/admin/submissions/${y3.sub.id}`, kind: "ACTION", channels: "IN_APP", createdAt: day(-1) },
      { userId: adj.id, title: "3 ideas waiting for the committee", body: "Agri-Tech & Food Security Challenge 2026", href: "/app/adjudicator", kind: "ACTION", channels: "IN_APP,EMAIL", createdAt: day(-4) },
      { userId: adj.id, title: "Panel split on KgomoTrack", body: "Spread of over 15 points between evaluators. Discuss before deciding.", href: `/app/adjudicator/submissions/${s[2].sub.id}`, kind: "WARNING", channels: "IN_APP", createdAt: day(-5) },
      { userId: dpo.id, title: "New data rights request: DSR-0003", body: "Erase my data. Due in 30 days.", href: "/app/dpo#requests", kind: "ACTION", channels: "IN_APP,EMAIL", createdAt: day(-3) },
    ],
  });

  // ---------- DPO data ----------
  const masego = byName("Masego Phiri");
  const kitso = byName("Kitso Modise");
  await prisma.dataRequest.createMany({
    data: [
      { reference: "DSR-0001", userId: byName("Thato Kebaabetswe").id, type: "ACCESS", details: "Please send me a copy of everything you hold about my company.", status: "COMPLETED", dueAt: day(-10), resolution: "Export sent to the registered email address.", resolvedAt: day(-25), handlerId: dpo.id, createdAt: day(-38) },
      { reference: "DSR-0002", userId: masego.id, type: "RECTIFICATION", details: "My district is wrong. I moved from Chobe to Francistown in September.", status: "OPEN", dueAt: day(24), createdAt: day(-6) },
      { reference: "DSR-0003", userId: kitso.id, type: "ERASURE", details: "My application was declined and I would like my personal details removed.", status: "OPEN", dueAt: day(27), createdAt: day(-3) },
    ],
  });
  await prisma.breachIncident.createMany({
    data: [
      { reference: "BR-2026-001", title: "Phishing drill: fake evaluator login page", description: "Planned drill. A simulated phishing email was sent to all evaluators; 1 of 5 entered credentials on the test page. Password reset enforced and training repeated.", severity: "LOW", affectedCount: 0, dataTypes: "None (simulation)", discoveredAt: day(-30), containedAt: day(-30), commissionNotifiedAt: null, status: "CLOSED", isDrill: true },
      { reference: "BR-2026-002", title: "Drill: evaluator laptop reported lost", description: "Tabletop drill. An evaluator reports a lost laptop with an active Sky session. Sessions revoked; review whether any downloads were cached on the device.", severity: "MEDIUM", affectedCount: 6, dataTypes: "Submission documents for 6 assigned ideas", discoveredAt: new Date(NOW - 20 * 3600000), containedAt: new Date(NOW - 19 * 3600000), status: "CONTAINED", isDrill: true },
    ],
  });
  await prisma.retentionPolicy.createMany({
    data: [
      { dataType: "UNSUCCESSFUL_APPLICATION", label: "Unsuccessful applications", months: 24, action: "ANONYMISE", basis: "Storage limitation; allows re-application history" },
      { dataType: "AWARDED_APPLICATION", label: "Awarded applications", months: 84, action: "ARCHIVE", basis: "Funding agreements and audit (7 years)" },
      { dataType: "AUDIT_LOG", label: "Audit trail", months: 84, action: "ARCHIVE", basis: "Accountability and dispute resolution" },
      { dataType: "NOTIFICATION", label: "Notifications", months: 12, action: "DELETE", basis: "No longer needed after a year" },
    ],
  });
  log({ at: day(-30), actorId: dpo.id, actorRole: "DPO", action: "breach.logged", entity: "BreachIncident", meta: { drill: true } });
  log({ at: new Date(NOW - 20 * 3600000), actorId: dpo.id, actorRole: "DPO", action: "breach.logged", entity: "BreachIncident", meta: { drill: true } });

  // ---------- Audit chain in time order ----------
  auditQueue.sort((a, b) => a.at.getTime() - b.at.getTime());
  for (const e of auditQueue) await audit(e, e.at);

  const counts = { users: await prisma.user.count(), submissions: await prisma.submission.count(), audit: await prisma.auditLog.count() };
  console.log(`[sky] Seeded ${counts.users} users, ${counts.submissions} submissions, ${counts.audit} audit entries.`);
  console.log(`[sky] Demo password for every account: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
