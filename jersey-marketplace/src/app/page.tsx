import Link from "next/link";
import { db } from "@/lib/db";
import { listing, jersey, jerseyImage, bid, user as userTable } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { FeedCard } from "@/components/feed-card";
import { Button } from "@/components/ui/button";
import { formatNOK } from "@/lib/utils";

export const dynamic = "force-dynamic";

function timeAgo(d: Date) {
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default async function FeedPage() {
  // Fetch recent live listings as feed items
  const recentListings = await db
    .select({
      id: listing.id,
      title: jersey.title,
      meta: jersey.player,
      size: jersey.size,
      condition: jersey.condition,
      price: listing.currentPrice,
      type: listing.type,
      endAt: listing.endAt,
      createdAt: listing.createdAt,
      firstImage: jerseyImage.storageKey,
      sellerHandle: userTable.handle,
      sellerName: userTable.name,
    })
    .from(listing)
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .innerJoin(userTable, eq(userTable.id, listing.sellerId))
    .leftJoin(jerseyImage, and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)))
    .where(eq(listing.status, "live"))
    .orderBy(desc(listing.createdAt))
    .limit(20);

  // Fetch recent bids as compact feed items
  const recentBids = await db
    .select({
      amount: bid.amount,
      placedAt: bid.placedAt,
      listingTitle: jersey.title,
      listingId: listing.id,
      bidderHandle: userTable.handle,
      bidderName: userTable.name,
      firstImage: jerseyImage.storageKey,
    })
    .from(bid)
    .innerJoin(listing, eq(listing.id, bid.listingId))
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .innerJoin(userTable, eq(userTable.id, bid.bidderId))
    .leftJoin(jerseyImage, and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)))
    .where(eq(listing.status, "live"))
    .orderBy(desc(bid.placedAt))
    .limit(10);

  const hasActivity = recentListings.length > 0 || recentBids.length > 0;

  // Interleave listings and bids by timestamp
  type FeedItem = { type: "listing"; data: (typeof recentListings)[0] } | { type: "bid"; data: (typeof recentBids)[0] };
  const items: FeedItem[] = [
    ...recentListings.map((d) => ({ type: "listing" as const, data: d, ts: d.createdAt })),
    ...recentBids.map((d) => ({ type: "bid" as const, data: d, ts: d.placedAt })),
  ].sort((a, b) => b.ts.getTime() - a.ts.getTime());

  if (!hasActivity) {
    return (
      <div className="space-y-6">
        <div className="mx-3.5 space-y-6 py-8 text-center">
          <div className="mx-auto max-w-sm space-y-3">
            <h2 className="font-display text-2xl text-foreground">Welcome to the collection</h2>
            <p className="text-sm text-text-secondary">
              The feed lights up once collectors start listing. Auctions, new locker adds, and
              community moments all show up here.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button asChild><Link href="/browse">Browse listings</Link></Button>
            <Button asChild variant="soft"><Link href="/wanted/new">Post a Wanted</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 pb-8">
      {items.map((item, i) => {
        if (item.type === "listing") {
          const d = item.data;
          const meta = [d.meta, d.size, d.condition].filter(Boolean).join(" · ");
          return (
            <FeedCard
              key={`l-${d.id}`}
              variant="rich"
              id={d.id}
              title={d.title}
              meta={meta}
              image={d.firstImage}
              price={d.price}
              type={d.type}
              endAt={d.endAt}
              username={d.sellerHandle ?? d.sellerName ?? "Seller"}
              actionText="listed a jersey"
              timestamp={timeAgo(d.createdAt)}
            />
          );
        }
        const d = item.data;
        const bidder = d.bidderHandle ?? d.bidderName ?? "Someone";
        return (
          <FeedCard
            key={`b-${d.listingId}-${i}`}
            variant="compact"
            thumbnail={d.firstImage}
            text={
              <>
                <strong className="text-foreground">{bidder}</strong>{" "}
                bid <strong className="text-green-300">{formatNOK(d.amount)}</strong>{" "}
                on {d.listingTitle}
              </>
            }
            timestamp={timeAgo(d.placedAt)}
          />
        );
      })}
    </div>
  );
}
