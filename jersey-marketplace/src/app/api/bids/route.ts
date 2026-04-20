import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bid, listing } from "@/lib/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { minNextBid } from "@/lib/utils";
import { broadcastBid } from "@/lib/pusher";

const ANTI_SNIPE_MS = 60 * 1000;

const bidSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.number().finite().positive(),
  maxAmount: z.number().finite().positive().optional(),
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.emailVerified) {
    return NextResponse.json({ error: "Verify your email before bidding" }, { status: 403 });
  }

  const parsed = bidSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bid data" }, { status: 400 });
  }
  const { listingId, amount, maxAmount } = parsed.data;
  const amountMinor = Math.round(amount);

  // Transaction with row lock to prevent race conditions
  const result = await db.transaction(async (tx) => {
    // Lock the listing row
    const [l] = await tx
      .select()
      .from(listing)
      .where(eq(listing.id, listingId))
      .for("update");

    if (!l || l.status !== "live") return { error: "Auction is not live", status: 400 };
    if (l.sellerId === session.user.id) return { error: "You can't bid on your own listing", status: 400 };
    if (l.type !== "auction") return { error: "This is not an auction", status: 400 };

    const now = Date.now();
    const effectiveEnd = (l.extendedUntil ?? l.endAt)?.getTime() ?? 0;
    if (!effectiveEnd || now >= effectiveEnd) return { error: "Auction has ended", status: 400 };

    const min = minNextBid(l.currentPrice ?? l.startPrice ?? 0);
    if (amountMinor < min) return { error: `Minimum bid is ${min / 100} kr`, status: 400 };

    await tx.insert(bid).values({
      listingId: l.id,
      bidderId: session.user.id,
      amount: amountMinor,
      maxAmount: maxAmount ? Math.round(maxAmount) : null,
      isProxy: Boolean(maxAmount),
    });

    const extendedUntil =
      effectiveEnd - now <= ANTI_SNIPE_MS ? new Date(now + ANTI_SNIPE_MS) : l.extendedUntil;

    await tx
      .update(listing)
      .set({ currentPrice: amountMinor, extendedUntil, updatedAt: new Date() })
      .where(eq(listing.id, l.id));

    const [{ n }] = await tx
      .select({ n: count() })
      .from(bid)
      .where(eq(bid.listingId, l.id));

    return { ok: true, currentPrice: amountMinor, bidCount: n, extendedUntil };
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  // Broadcast outside the transaction
  await broadcastBid(listingId, {
    currentPrice: result.currentPrice,
    bidCount: result.bidCount,
    extendedUntil: result.extendedUntil?.toISOString(),
  });

  return NextResponse.json({
    ok: true,
    currentPrice: result.currentPrice,
    bidCount: result.bidCount,
  });
}
