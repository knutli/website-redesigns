import { db } from "@/lib/db";
import { listing, jersey, jerseyImage } from "@/lib/db/schema";
import { and, desc, asc, eq, gte, lte, ilike, sql } from "drizzle-orm";
import { MarketplaceCard } from "@/components/marketplace-card";
import { BrowseFilters } from "./browse-filters";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    type?: string;
    club?: string;
    size?: string;
    season?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  }>;
};

export default async function BrowsePage({ searchParams }: Props) {
  const params = await searchParams;

  const conditions = [eq(listing.status, "live")];

  if (params.q) {
    conditions.push(
      sql`to_tsvector('simple', coalesce(${jersey.title}, '') || ' ' || coalesce(${jersey.club}, '') || ' ' || coalesce(${jersey.player}, '') || ' ' || coalesce(${jersey.season}, '')) @@ plainto_tsquery('simple', ${params.q})`,
    );
  }
  if (params.type && (params.type === "auction" || params.type === "fixed")) {
    conditions.push(eq(listing.type, params.type));
  }
  if (params.club) {
    conditions.push(ilike(jersey.club, `%${params.club}%`));
  }
  if (params.size) {
    conditions.push(eq(jersey.size, params.size));
  }
  if (params.season) {
    conditions.push(ilike(jersey.season, `%${params.season}%`));
  }
  if (params.condition) {
    conditions.push(ilike(jersey.condition, `%${params.condition}%`));
  }
  if (params.minPrice) {
    conditions.push(gte(listing.currentPrice, Number(params.minPrice) * 100));
  }
  if (params.maxPrice) {
    conditions.push(lte(listing.currentPrice, Number(params.maxPrice) * 100));
  }

  const orderBy = params.sort === "price-asc"
    ? asc(listing.currentPrice)
    : params.sort === "price-desc"
      ? desc(listing.currentPrice)
      : params.sort === "ending"
        ? asc(listing.endAt)
        : desc(listing.createdAt);

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
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(60);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between px-1 pt-2">
        <h1 className="font-display text-lg">Browse</h1>
        <span className="text-xs text-text-tertiary">{rows.length} listings</span>
      </div>

      <BrowseFilters />

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-text-tertiary">
          No listings match your filters. Try loosening them — the right shirt is out there.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
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
