import { inngest } from "@/lib/inngest";
import { db } from "@/lib/db";
import { listing, bid, orderTable, user as userTable } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { platformFee, sellerNet } from "@/lib/utils";
import { broadcastAuctionEnded } from "@/lib/pusher";

/**
 * Auction finalisation. Triggered by a scheduled event emitted when a
 * listing goes live; re-checks extended_until before closing so anti-snipe
 * works even across function restarts.
 */
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
      // Anti-snipe extended the auction; re-schedule.
      await step.sleepUntil("wait-for-new-end", effectiveEnd);
    }

    const [winner] = await db
      .select()
      .from(bid)
      .where(eq(bid.listingId, listingId))
      .orderBy(desc(bid.amount))
      .limit(1);

    if (!winner || (l.reservePrice && winner.amount < l.reservePrice)) {
      await db.update(listing).set({ status: "ended" }).where(eq(listing.id, listingId));
      await broadcastAuctionEnded(listingId, null);
      return;
    }

    const gross = winner.amount;
    await db.insert(orderTable).values({
      listingId,
      buyerId: winner.bidderId,
      sellerId: l.sellerId,
      grossAmount: gross,
      platformFeeAmount: platformFee(gross),
      sellerNetAmount: sellerNet(gross),
      status: "awaiting_payment",
    });

    await db.update(listing).set({ status: "sold" }).where(eq(listing.id, listingId));

    await broadcastAuctionEnded(listingId, winner.bidderId);
  },
);

export const functions = [finaliseAuction];
