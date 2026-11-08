"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { assertRole } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notify";
import { solvePoints } from "@/lib/arena";

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Answers a Range challenge. Quizzes are marked now; evidence goes to CEDA staff to verify. */
export async function answerChallenge(form: FormData) {
  const user = await assertRole("INNOVATOR");
  const slug = String(form.get("slug"));
  const c = await prisma.challenge.findUnique({ where: { slug } });
  if (!c) throw new Error("Challenge not found");
  const existing = await prisma.challengeSolve.findUnique({ where: { challengeId_userId: { challengeId: c.id, userId: user.id } } });
  if (existing?.status === "SOLVED" || existing?.status === "PENDING") redirect(`/app/innovator/range/${slug}`);
  const back = (r: string) => redirect(`/app/innovator/range/${slug}?result=${r}`);

  if (c.kind === "QUIZ") {
    const choice = Number(form.get("choice"));
    if (!Number.isInteger(choice)) back("pick");
    const correct = choice === c.answer;
    if (!correct) {
      await prisma.challengeSolve.upsert({
        where: { challengeId_userId: { challengeId: c.id, userId: user.id } },
        update: { status: "FAILED", attempts: { increment: 1 } },
        create: { challengeId: c.id, userId: user.id, status: "FAILED", points: 0 },
      });
      await audit({ actorId: user.id, actorRole: user.role, action: "range.attempt_failed", entity: "Challenge", entityId: c.id });
      back("wrong");
    }
    const first = (await prisma.challengeSolve.count({ where: { challengeId: c.id, status: "SOLVED" } })) === 0;
    const points = solvePoints(c.points, first);
    await prisma.challengeSolve.upsert({
      where: { challengeId_userId: { challengeId: c.id, userId: user.id } },
      update: { status: "SOLVED", attempts: { increment: 1 }, points, first, solvedAt: new Date() },
      create: { challengeId: c.id, userId: user.id, status: "SOLVED", points, first },
    });
    await audit({ actorId: user.id, actorRole: user.role, action: "range.solved", entity: "Challenge", entityId: c.id, meta: { points, first } });
    revalidatePath("/leaderboard");
    back(first ? "first" : "correct");
  }

  const evidence = String(form.get("evidence") ?? "").trim().slice(0, 6000);
  if (words(evidence) < c.minWords) back("short");
  await prisma.challengeSolve.upsert({
    where: { challengeId_userId: { challengeId: c.id, userId: user.id } },
    update: { status: "PENDING", evidence, attempts: { increment: 1 }, solvedAt: new Date() },
    create: { challengeId: c.id, userId: user.id, status: "PENDING", evidence, points: 0 },
  });
  await audit({ actorId: user.id, actorRole: user.role, action: "range.evidence_submitted", entity: "Challenge", entityId: c.id });
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  for (const a of admins) {
    await notify({ userId: a.id, title: "Evidence to verify on the Range", body: `${user.org?.name ?? user.name} answered "${c.title}".`, href: "/app/admin/range", kind: "ACTION", channels: ["IN_APP"] });
  }
  back("pending");
}

/** CEDA staff accept or return a piece of challenge evidence. */
export async function reviewEvidence(form: FormData) {
  const admin = await assertRole("ADMIN");
  const id = String(form.get("id"));
  const accept = form.get("accept") === "1";
  const s = await prisma.challengeSolve.findUniqueOrThrow({ where: { id }, include: { challenge: true } });
  if (s.status !== "PENDING") return;
  if (accept) {
    const first = (await prisma.challengeSolve.count({ where: { challengeId: s.challengeId, status: "SOLVED" } })) === 0;
    const points = solvePoints(s.challenge.points, first);
    await prisma.challengeSolve.update({ where: { id }, data: { status: "SOLVED", points, first, solvedAt: new Date() } });
    await notify({ userId: s.userId, title: `+${points} Index points`, body: `CEDA verified your evidence for "${s.challenge.title}".`, href: `/app/innovator/range/${s.challenge.slug}`, kind: "SUCCESS" });
  } else {
    await prisma.challengeSolve.update({ where: { id }, data: { status: "FAILED", points: 0 } });
    await notify({ userId: s.userId, title: "Evidence needs more work", body: `Add more detail to "${s.challenge.title}" and send it again.`, href: `/app/innovator/range/${s.challenge.slug}`, kind: "ACTION" });
  }
  await audit({ actorId: admin.id, actorRole: admin.role, action: accept ? "range.evidence_accepted" : "range.evidence_returned", entity: "ChallengeSolve", entityId: id });
  revalidatePath("/app/admin/range");
}

/** Books or releases a seat at an event. */
export async function toggleSeat(form: FormData) {
  const user = await assertRole("INNOVATOR");
  const slug = String(form.get("slug"));
  const e = await prisma.event.findUniqueOrThrow({ where: { slug }, include: { _count: { select: { attendees: true } } } });
  if (e.startsAt.getTime() < Date.now()) throw new Error("This event has already started");
  const seat = await prisma.eventSeat.findUnique({ where: { eventId_userId: { eventId: e.id, userId: user.id } } });
  if (seat) {
    await prisma.eventSeat.delete({ where: { id: seat.id } });
    await audit({ actorId: user.id, actorRole: user.role, action: "event.seat_released", entity: "Event", entityId: e.id });
  } else {
    if (e._count.attendees >= e.seats) throw new Error("This event is full");
    await prisma.eventSeat.create({ data: { eventId: e.id, userId: user.id } });
    await audit({ actorId: user.id, actorRole: user.role, action: "event.seat_booked", entity: "Event", entityId: e.id });
    await notify({ userId: user.id, title: `Seat booked: ${e.title}`, body: `See you in ${e.location}. Attending adds up to ${e.bonus} points to your Index.`, href: "/app/events", kind: "SUCCESS", channels: ["IN_APP", "EMAIL", "SMS"] });
  }
  revalidatePath("/events");
  revalidatePath("/app/events");
  revalidatePath("/app/innovator/profile");
}
