import { db } from "@/lib/db";
import { listing, jersey, jerseyImage, user as userTable } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { ApprovalReviewer } from "./approval-reviewer";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const queue = await db
    .select({
      listingId: listing.id,
      type: listing.type,
      startPrice: listing.startPrice,
      buyNowPrice: listing.buyNowPrice,
      reservePrice: listing.reservePrice,
      submittedAt: listing.submittedAt,
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
    })
    .from(listing)
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .innerJoin(userTable, eq(userTable.id, listing.sellerId))
    .where(eq(listing.status, "pending_review"))
    .orderBy(asc(listing.submittedAt));

  const items = await Promise.all(
    queue.map(async (q) => ({
      ...q,
      images: await db
        .select({ storageKey: jerseyImage.storageKey, order: jerseyImage.order })
        .from(jerseyImage)
        .where(eq(jerseyImage.jerseyId, q.jerseyId))
        .orderBy(asc(jerseyImage.order)),
    })),
  );

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Approval queue</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} pending · arrow keys scroll images, <kbd>A</kbd> approve, <kbd>R</kbd> reject
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          Queue is empty. Nice.
        </div>
      ) : (
        <ApprovalReviewer items={items} />
      )}
    </div>
  );
}
