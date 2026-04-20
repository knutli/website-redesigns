import { db } from "@/lib/db";
import { listing, jersey, jerseyImage } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatNOK } from "@/lib/utils";
import { publicImageUrl } from "@/lib/storage";

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

export default async function BrowsePage() {
  const rows = await db
    .select({
      id: listing.id,
      title: jersey.title,
      club: jersey.club,
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
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Browse</h1>
        <p className="text-sm text-muted-foreground">Live auctions and buy-now listings.</p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No live listings yet. Once sellers upload and admin approves, they show up here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((row) => (
            <Link key={row.id} href={`/l/${row.id}`}>
              <Card className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  {row.firstImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={publicImageUrl(row.firstImage, { w: 600, h: 600, fit: "cover" })}
                      alt={row.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <CardContent className="p-3">
                  <div className="text-sm font-medium line-clamp-1">{row.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{row.club}</div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">
                      {row.price ? formatNOK(row.price) : "—"}
                    </div>
                    {row.type === "auction" && row.endAt ? (
                      <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-medium text-orange-900 dark:bg-orange-950 dark:text-orange-200">
                        {timeLeft(row.endAt)}
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {row.type}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
