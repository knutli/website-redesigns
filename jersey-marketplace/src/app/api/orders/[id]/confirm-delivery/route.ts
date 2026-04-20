import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderTable, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [order] = await db.select().from(orderTable).where(eq(orderTable.id, id));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.buyerId !== session.user.id) return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (order.status !== "shipped") return NextResponse.json({ error: "Order not shipped" }, { status: 400 });

  await db.update(orderTable).set({
    status: "delivered",
    deliveredAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(orderTable.id, id));

  await db.insert(auditLog).values({
    actorId: session.user.id,
    action: "order.delivered",
    targetType: "order",
    targetId: id,
  });

  // TODO: trigger payout release to seller via Inngest

  return NextResponse.json({ ok: true });
}
