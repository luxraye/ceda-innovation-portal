import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({ where: { userId: session.sub }, orderBy: { createdAt: "desc" }, take: 12 }),
    prisma.notification.count({ where: { userId: session.sub, readAt: null } }),
  ]);
  return NextResponse.json({ items, unread });
}

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  await prisma.notification.updateMany({ where: { userId: session.sub, readAt: null }, data: { readAt: new Date() } });
  return NextResponse.json({ ok: true });
}
