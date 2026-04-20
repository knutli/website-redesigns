import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderTable, auditLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const shipSchema = z.object({
  carrier: z.string().min(1).max(100),
  trackingNo: z.string().min(1).max(200),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = shipSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Carrier and tracking number required" }, { status: 400 });

  const [order] = await db.select().from(orderTable).where(eq(orderTable.id, id));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.sellerId !== session.user.id) return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (order.status !== "paid") return NextResponse.json({ error: "Order not in paid status" }, { status: 400 });

  await db.update(orderTable).set({
    status: "shipped",
    carrier: parsed.data.carrier,
    trackingNo: parsed.data.trackingNo,
    shippedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(orderTable.id, id));

  await db.insert(auditLog).values({
    actorId: session.user.id,
    action: "order.shipped",
    targetType: "order",
    targetId: id,
    after: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
