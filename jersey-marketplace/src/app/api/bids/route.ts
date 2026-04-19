import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bid, listing } from "@/lib/db/schema";
import { and, count, eq } from "drizzle-orm";
import { minNextBid } from "@/lib/utils";
import { broadcastBid } from "@/lib/pusher";

const ANTI_SNIPE_MS = 60 * 1000;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.emailVerified) {
    return NextResponse.json({ error: "Verify your email before bidding" }, { status: 403 });
  }

  const body = (await req.json()) as { listingId: string; amount: number; maxAmount?: number };
  const amountMinor = Math.round(body.amount);

  const [l] = await db.select().from(listing).where(eq(listing.id, body.listingId));
  if (!l || l.status !== "live") {
    return NextResponse.json({ error: "Auction is not live" }, { status: 400 });
  }
  if (l.sellerId === session.user.id) {
    return NextResponse.json({ error: "You can't bid on your own listing" }, { status: 400 });
  }

  const now = Date.now();
  const effectiveEnd = (l.extendedUntil ?? l.endAt)?.getTime() ?? 0;
  if (!effectiveEnd || now >= effectiveEnd) {
    return NextResponse.json({ error: "Auction has ended" }, { status: 400 });
  }

  const min = minNextBid(l.currentPrice ?? l.startPrice ?? 0);
  if (amountMinor < min) {
    return NextResponse.json({ error: `Minimum bid is ${min}` }, { status: 400 });
  }

  await db.insert(bid).values({
    listingId: l.id,
    bidderId: session.user.id,
    amount: amountMinor,
    maxAmount: body.maxAmount ?? null,
    isProxy: Boolean(body.maxAmount),
  });

  const extendedUntil =
    effectiveEnd - now <= ANTI_SNIPE_MS ? new Date(now + ANTI_SNIPE_MS) : l.extendedUntil;

  await db
    .update(listing)
    .set({ currentPrice: amountMinor, extendedUntil, updatedAt: new Date() })
    .where(eq(listing.id, l.id));

  const [{ n }] = await db.select({ n: count() }).from(bid).where(eq(bid.listingId, l.id));

  await broadcastBid(l.id, {
    currentPrice: amountMinor,
    bidCount: n,
    extendedUntil: extendedUntil?.toISOString(),
  });

  return NextResponse.json({ ok: true, currentPrice: amountMinor, bidCount: n });
}
