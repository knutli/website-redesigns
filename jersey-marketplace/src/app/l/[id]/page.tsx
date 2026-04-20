import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Share2, Bookmark } from "lucide-react";
import { db } from "@/lib/db";
import { listing, jersey, jerseyImage, user as userTable, bid } from "@/lib/db/schema";
import { and, count, desc, eq, ne, sql } from "drizzle-orm";
import { ImageCarousel } from "@/components/image-carousel";
import { AuctionBlock } from "@/components/auction-block";
import { SellerCard } from "@/components/seller-card";
import { ShirtDetailsGrid } from "@/components/shirt-details-grid";
import { VerificationSection } from "@/components/verification-section";
import { BidHistory } from "@/components/bid-history";
import { SimilarItems } from "@/components/similar-items";
import { StickyBottomBar } from "@/components/sticky-bottom-bar";

export const dynamic = "force-dynamic";

function timeLeft(end: Date) {
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "ended";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
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
      startPrice: listing.startPrice,
      buyNowPrice: listing.buyNowPrice,
      reservePrice: listing.reservePrice,
      endAt: listing.endAt,
      viewCount: listing.viewCount,
      createdAt: listing.createdAt,
      sourceLanguage: listing.sourceLanguage,
      jerseyId: jersey.id,
      title: jersey.title,
      club: jersey.club,
      season: jersey.season,
      player: jersey.player,
      size: jersey.size,
      condition: jersey.condition,
      authenticity: jersey.authenticity,
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

  db.update(listing)
    .set({ viewCount: sql`${listing.viewCount} + 1` })
    .where(eq(listing.id, row.id))
    .catch(() => {});

  const images = await db
    .select({ storageKey: jerseyImage.storageKey, order: jerseyImage.order })
    .from(jerseyImage)
    .where(eq(jerseyImage.jerseyId, row.jerseyId))
    .orderBy(jerseyImage.order);

  const [{ n: bidCount }] = await db
    .select({ n: count() })
    .from(bid)
    .where(eq(bid.listingId, id));

  const recentBids = await db
    .select({
      amount: bid.amount,
      placedAt: bid.placedAt,
      bidderHandle: userTable.handle,
      bidderName: userTable.name,
    })
    .from(bid)
    .innerJoin(userTable, eq(userTable.id, bid.bidderId))
    .where(eq(bid.listingId, id))
    .orderBy(desc(bid.amount))
    .limit(20);

  const crossSell = row.size
    ? await db
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
        .where(and(eq(listing.status, "live"), eq(jersey.size, row.size), ne(listing.id, row.id)))
        .orderBy(desc(listing.createdAt))
        .limit(10)
    : [];

  const meta = [
    row.player,
    row.size ? `Size ${row.size}` : null,
    row.condition ? `${row.condition} condition` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const isEnded = row.status === "ended" || row.status === "sold";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Detail nav */}
      <nav className="flex items-center justify-between px-4 pb-2.5 pt-2">
        <Link
          href="/browse"
          className="flex items-center gap-1.5 text-sm font-medium text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </Link>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Share" className="text-text-secondary">
            <Share2 className="h-[22px] w-[22px]" />
          </button>
          <button type="button" aria-label="Save" className="text-text-secondary">
            <Bookmark className="h-[22px] w-[22px]" />
          </button>
        </div>
      </nav>

      {/* Hero image carousel */}
      <ImageCarousel images={images} alt={row.title} />

      {/* Title block */}
      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl tracking-tight text-foreground">{row.title}</h1>
        {meta ? <p className="mt-1.5 text-sm text-text-secondary">{meta}</p> : null}
      </div>

      {/* Auction / Buy Now */}
      <div data-auction-block>
        <AuctionBlock
          listingId={row.id}
          type={row.type}
          currentPrice={row.currentPrice ?? row.startPrice ?? 0}
          startPrice={row.startPrice ?? undefined}
          endAt={row.endAt}
          bidCount={bidCount}
          status={isEnded ? "ended" : "live"}
        />
      </div>

      {/* Seller */}
      <SellerCard
        handle={row.sellerHandle}
        name={row.sellerName}
        isVerified={row.sellerVerified}
      />

      {/* Shirt details */}
      <ShirtDetailsGrid
        team={row.club}
        season={row.season}
        player={row.player}
        size={row.size}
        condition={row.condition}
        authenticity={row.authenticity}
      />

      {/* Verification */}
      <VerificationSection
        steps={[
          {
            text: row.sellerVerified
              ? `AI analysis confirmed as genuine ${row.season ?? ""} ${row.club ?? ""} shirt.`
              : "AI verification pending.",
            completed: !!row.sellerVerified,
          },
          { text: "Expert review by Oase authentication team.", completed: false },
          {
            text: row.sellerVerified
              ? "Seller verified via BankID."
              : "Seller identity not yet verified.",
            completed: !!row.sellerVerified,
          },
        ]}
      />

      {/* Description */}
      {row.description ? (
        <div className="px-4 pt-5">
          <h2 className="mb-3.5 font-display text-lg font-semibold tracking-tight text-foreground">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-sm text-text-secondary" style={{ lineHeight: 1.65 }}>
            {row.description}
          </p>
        </div>
      ) : null}

      {/* Bid history */}
      <BidHistory
        bids={recentBids.map((b, i) => ({
          username: b.bidderHandle ?? b.bidderName ?? "Bidder",
          amount: b.amount,
          timestamp: b.placedAt.toISOString(),
          isHighest: i === 0,
        }))}
      />

      {/* Similar items */}
      <SimilarItems
        items={crossSell.map((c) => ({
          id: c.id,
          title: c.club ?? c.title,
          detail: [c.player, c.size].filter(Boolean).join(" · "),
          price: c.price,
          type: c.type,
          timeRemaining: c.type === "auction" && c.endAt ? timeLeft(c.endAt) : undefined,
          firstImage: c.firstImage,
        }))}
      />

      {/* Sticky bottom bar */}
      <StickyBottomBar
        price={row.currentPrice ?? row.startPrice ?? row.buyNowPrice ?? 0}
        type={row.type}
        status={isEnded ? "ended" : "live"}
      />
    </div>
  );
}
