import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { report, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const admin = await requireAdmin(session);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { status } = (await req.json()) as { status: "resolved" | "dismissed" };
  if (!["resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await db.update(report).set({
    status,
    resolvedBy: admin.id,
    resolvedAt: new Date(),
  }).where(eq(report.id, id));

  await db.insert(auditLog).values({
    actorId: admin.id,
    action: `report.${status}`,
    targetType: "report",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
