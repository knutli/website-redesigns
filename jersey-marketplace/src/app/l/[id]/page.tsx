import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { listing, jersey, jerseyImage, user as userTable, bid } from "@/lib/db/schema";
import { and, count, desc, eq, ne, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { formatNOK } from "@/lib/utils";
import { publicImageUrl } from "@/lib/storage";
import { VerifiedBadge } from "@/components/verified-badge";
import { ShareButton } from "@/components/share-button";
import { SuspectedFakeButton } from "@/components/suspected-fake-button";
import { env } from "@/lib/env";
import Link from "next/link";

export const dynamic = "force-dynamic";

function daysSince(d: Date) {
  const ms = Date.now() - d.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: listing.id,
      publicId: listing.publicId,
      status: listing.status,
      type: listing.type,
      currentPrice: listing.currentPrice,
      buyNowPrice: listing.buyNowPrice,
      reservePrice: listing.reservePrice,
      endAt: listing.endAt,
      extendedUntil: listing.extendedUntil,
      viewCount: listing.viewCount,
      createdAt: listing.createdAt,
      descriptionTranslations: listing.descriptionTranslations,
      sourceLanguage: listing.sourceLanguage,
      jerseyId: jersey.id,
      title: jersey.title,
      club: jersey.club,
      season: jersey.season,
      player: jersey.player,
      size: jersey.size,
      condition: jersey.condition,
      description: jersey.description,
      sellerId: userTable.id,
      sellerHandle: userTable.handle,
      sellerName: userTable.name,
      sellerVerified: userTable.verifiedCollector,
    })
    .from(listing)
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .innerJoin(userTable, eq(userTable.id, listing.sellerId))
    .where(eq(listing.id, id));

  if (!row) return notFound();

  // Fire-and-forget view increment. Cheap, best-effort, no tracking.
  db.update(listing)
    .set({ viewCount: sql`${listing.viewCount} + 1` })
    .where(eq(listing.id, row.id))
    .catch(() => {});

  const images = await db
    .select({ storageKey: jerseyImage.storageKey, order: jerseyImage.order })
    .from(jerseyImage)
    .where(eq(jerseyImage.jerseyId, row.jerseyId));

  const [{ n }] = await db.select({ n: count() }).from(bid).where(eq(bid.listingId, id));

  // Cross-sell: other jerseys in the same size from different listings
  const crossSell = row.size
    ? await db
        .select({
          id: listing.id,
          title: jersey.title,
          price: listing.currentPrice,
          firstImage: jerseyImage.storageKey,
        })
        .from(listing)
        .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
        .leftJoin(
          jerseyImage,
          and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)),
        )
        .where(
          and(eq(listing.status, "live"), eq(jersey.size, row.size), ne(listing.id, row.id)),
        )
        .orderBy(desc(listing.createdAt))
        .limit(6)
    : [];

  const translations =
    (row.descriptionTranslations as Record<string, string> | null) ?? null;

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {images.map((img) => (
            <div key={img.storageKey} className="overflow-hidden rounded-lg bg-muted">
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
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase text-muted-foreground">
                  {row.type} · Annons-ID {row.publicId}
                </div>
                <ShareButton
                  title={row.title}
                  url={`${env.NEXT_PUBLIC_APP_URL}/l/${row.id}`}
                />
              </div>
              <h1 className="font-display text-3xl leading-tight">{row.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Seller{" "}
                <Link className="underline" href={`/u/${row.sellerHandle ?? ""}`}>
                  {row.sellerHandle ? `@${row.sellerHandle}` : row.sellerName}
                </Link>
                {row.sellerVerified ? <VerifiedBadge /> : null}
              </div>
              <div className="text-xs text-muted-foreground">
                {row.viewCount} views · Published {daysSince(row.createdAt)}
              </div>

              <div className="rounded-xl bg-muted p-3">
                <div className="text-xs text-muted-foreground">
                  {row.type === "auction" ? "Current bid" : "Price"}
                </div>
                <div className="font-display text-3xl">
                  {row.currentPrice ? formatNOK(row.currentPrice) : "—"}
                </div>
                {row.type === "auction" ? (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {n} bid{n === 1 ? "" : "s"}
                    </span>
                    {row.reservePrice ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">
                        Reserve {(row.currentPrice ?? 0) >= row.reservePrice ? "met" : "not met"}
                      </span>
                    ) : null}
                    <span className="ml-auto">
                      {row.endAt ? `Ends ${new Date(row.endAt).toLocaleString("nb-NO")}` : null}
                    </span>
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
                <div className="rounded-xl border p-3 text-sm">
                  {translations && row.sourceLanguage && row.sourceLanguage !== "en" ? (
                    <div className="mb-2 text-xs text-muted-foreground">
                      Auto-translated from {row.sourceLanguage.toUpperCase()}
                    </div>
                  ) : null}
                  {row.description}
                </div>
              ) : null}

              <SuspectedFakeButton listingId={row.id} />
            </CardContent>
          </Card>
        </aside>
      </div>

      {crossSell.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-display text-2xl">Other jerseys in size {row.size}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {crossSell.map((c) => (
              <Link key={c.id} href={`/l/${c.id}`}>
                <Card className="overflow-hidden">
                  <div className="aspect-square bg-muted">
                    {c.firstImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={publicImageUrl(c.firstImage, { w: 400, h: 400, fit: "cover" })}
                        alt={c.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <CardContent className="p-2">
                    <div className="text-xs font-medium line-clamp-1">{c.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.price ? formatNOK(c.price) : "—"}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
