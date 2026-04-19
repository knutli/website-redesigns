import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { listing, jersey, jerseyImage, user as userTable, bid } from "@/lib/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { formatNOK } from "@/lib/utils";
import { publicImageUrl } from "@/lib/storage";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: listing.id,
      status: listing.status,
      type: listing.type,
      currentPrice: listing.currentPrice,
      buyNowPrice: listing.buyNowPrice,
      endAt: listing.endAt,
      extendedUntil: listing.extendedUntil,
      title: jersey.title,
      club: jersey.club,
      season: jersey.season,
      player: jersey.player,
      size: jersey.size,
      condition: jersey.condition,
      description: jersey.description,
      sellerHandle: userTable.handle,
      sellerName: userTable.name,
    })
    .from(listing)
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .innerJoin(userTable, eq(userTable.id, listing.sellerId))
    .where(eq(listing.id, id));

  if (!row) return notFound();

  const images = await db
    .select({ storageKey: jerseyImage.storageKey, order: jerseyImage.order })
    .from(jerseyImage)
    .innerJoin(jersey, eq(jersey.id, jerseyImage.jerseyId))
    .innerJoin(listing, eq(listing.jerseyId, jersey.id))
    .where(eq(listing.id, id));

  const [{ n }] = await db.select({ n: count() }).from(bid).where(eq(bid.listingId, id));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {images.map((img) => (
          <div key={img.storageKey} className="overflow-hidden rounded-2xl bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicImageUrl(img.storageKey, { w: 1200, h: 1200, fit: "contain" })}
              alt={row.title}
              className="w-full"
            />
          </div>
        ))}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="text-xs uppercase text-muted-foreground">{row.type}</div>
            <h1 className="font-display text-3xl leading-tight">{row.title}</h1>
            <div className="text-sm text-muted-foreground">
              Seller{" "}
              <Link
                className="underline"
                href={`/u/${row.sellerHandle ?? ""}`}
              >
                {row.sellerHandle ? `@${row.sellerHandle}` : row.sellerName}
              </Link>
            </div>

            <div className="rounded-xl bg-muted p-3">
              <div className="text-xs text-muted-foreground">
                {row.type === "auction" ? "Current bid" : "Price"}
              </div>
              <div className="font-display text-3xl">
                {row.currentPrice ? formatNOK(row.currentPrice) : "—"}
              </div>
              {row.type === "auction" ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  {n} bid{n === 1 ? "" : "s"} ·{" "}
                  {row.endAt ? `Ends ${new Date(row.endAt).toLocaleString("nb-NO")}` : null}
                </div>
              ) : null}
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {row.club && (
                <>
                  <dt className="text-muted-foreground">Club</dt>
                  <dd>{row.club}</dd>
                </>
              )}
              {row.season && (
                <>
                  <dt className="text-muted-foreground">Season</dt>
                  <dd>{row.season}</dd>
                </>
              )}
              {row.player && (
                <>
                  <dt className="text-muted-foreground">Player</dt>
                  <dd>{row.player}</dd>
                </>
              )}
              {row.size && (
                <>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd>{row.size}</dd>
                </>
              )}
              {row.condition && (
                <>
                  <dt className="text-muted-foreground">Condition</dt>
                  <dd>{row.condition}</dd>
                </>
              )}
            </dl>

            {row.description ? (
              <div className="rounded-xl border p-3 text-sm">{row.description}</div>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
