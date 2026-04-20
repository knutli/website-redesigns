import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { review, orderTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const reviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = reviewSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  const { orderId, rating, comment } = parsed.data;

  const [order] = await db.select().from(orderTable).where(eq(orderTable.id, orderId));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "delivered") {
    return NextResponse.json({ error: "Can only review delivered orders" }, { status: 400 });
  }
  if (order.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Not your order" }, { status: 403 });
  }

  const [r] = await db
    .insert(review)
    .values({
      orderId,
      reviewerId: session.user.id,
      revieweeId: order.sellerId,
      rating,
      comment: comment ?? null,
    })
    .onConflictDoNothing()
    .returning();

  if (!r) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });
  return NextResponse.json({ id: r.id });
}
