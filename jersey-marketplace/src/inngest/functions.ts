import { inngest } from "@/lib/inngest";
import { db } from "@/lib/db";
import { listing, bid, orderTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { platformFee, sellerNet } from "@/lib/utils";
import { broadcastAuctionEnded } from "@/lib/pusher";

export const finaliseAuction = inngest.createFunction(
  { id: "finalise-auction" },
  { event: "auction/ended" },
  async ({ event, step }) => {
    const { listingId } = event.data as { listingId: string };

    const [l] = await db.select().from(listing).where(eq(listing.id, listingId));
    if (!l || l.status !== "live") return;

    const now = new Date();
    const effectiveEnd = l.extendedUntil ?? l.endAt;
    if (effectiveEnd && effectiveEnd > now) {
      await step.sleepUntil("wait-for-new-end", effectiveEnd);
    }

    // Wrap finalisation in a transaction for atomicity + idempotency
    const result = await db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(listing)
        .where(eq(listing.id, listingId))
        .for("update");

      if (!current || current.status !== "live") return null;

      const [winner] = await tx
        .select()
        .from(bid)
        .where(eq(bid.listingId, listingId))
        .orderBy(desc(bid.amount))
        .limit(1);

      if (!winner || (current.reservePrice && winner.amount < current.reservePrice)) {
        await tx.update(listing).set({ status: "ended" }).where(eq(listing.id, listingId));
        return { winnerId: null };
      }

      const gross = winner.amount;

      // Idempotency: check if order already exists for this listing
      const [existing] = await tx
        .select()
        .from(orderTable)
        .where(eq(orderTable.listingId, listingId));
      if (existing) return { winnerId: winner.bidderId };

      await tx.insert(orderTable).values({
        listingId,
        buyerId: winner.bidderId,
        sellerId: current.sellerId,
        grossAmount: gross,
        platformFeeAmount: platformFee(gross),
        sellerNetAmount: sellerNet(gross),
        status: "awaiting_payment",
      });

      await tx.update(listing).set({ status: "sold" }).where(eq(listing.id, listingId));
      return { winnerId: winner.bidderId };
    });

    await broadcastAuctionEnded(listingId, result?.winnerId ?? null);
  },
);

export const functions = [finaliseAuction];
