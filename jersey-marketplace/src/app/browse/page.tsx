import { db } from "@/lib/db";
import { listing, jersey, jerseyImage } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { MarketplaceCard } from "@/components/marketplace-card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const rows = await db
    .select({
      id: listing.id,
      title: jersey.title,
      club: jersey.club,
      player: jersey.player,
      size: jersey.size,
      price: listing.currentPrice,
      type: listing.type,
      endAt: listing.endAt,
      firstImage: jerseyImage.storageKey,
    })
    .from(listing)
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .leftJoin(jerseyImage, and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)))
    .where(eq(listing.status, "live"))
    .orderBy(desc(listing.createdAt))
    .limit(48);

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-baseline justify-between px-1 pt-2">
        <h1 className="font-display text-lg">Browse</h1>
        <Link href="/browse" className="text-xs font-medium text-green-400">
          See all
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-text-tertiary">
          No live listings yet. Once sellers upload and admin approves, they show up here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-0">
          {rows.map((row) => (
            <MarketplaceCard
              key={row.id}
              id={row.id}
              title={row.title}
              club={row.club}
              player={row.player}
              size={row.size}
              price={row.price}
              type={row.type}
              endAt={row.endAt}
              firstImage={row.firstImage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
