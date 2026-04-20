import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wishlist, listing, jersey, jerseyImage } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { MarketplaceCard } from "@/components/marketplace-card";

export default async function WishlistPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/profile/wishlist");

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
    .from(wishlist)
    .innerJoin(listing, eq(listing.id, wishlist.listingId))
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .leftJoin(jerseyImage, and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)))
    .where(eq(wishlist.userId, s.user.id))
    .orderBy(desc(wishlist.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-text-secondary hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl">Wishlist</h1>
      </div>
      <p className="text-sm text-text-secondary">
        Saved listings. You'll get alerts when you're outbid or an auction is ending soon.
      </p>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-text-tertiary">
          Nothing saved yet. Tap the bookmark icon on any listing to add it here.
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
