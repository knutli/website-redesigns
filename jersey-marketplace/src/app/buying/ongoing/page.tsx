import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderTable, listing, jersey } from "@/lib/db/schema";
import { and, eq, inArray, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { formatNOK } from "@/lib/utils";

export default async function OngoingPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/buying/ongoing");

  const rows = await db
    .select({
      id: orderTable.id,
      title: jersey.title,
      gross: orderTable.grossAmount,
      status: orderTable.status,
      trackingNo: orderTable.trackingNo,
      carrier: orderTable.carrier,
    })
    .from(orderTable)
    .innerJoin(listing, eq(listing.id, orderTable.listingId))
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .where(
      and(
        eq(orderTable.buyerId, s.user.id),
        inArray(orderTable.status, ["paid", "shipped"]),
      ),
    )
    .orderBy(desc(orderTable.updatedAt));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Ongoing</h1>
      <p className="text-sm text-muted-foreground">
        Paid orders in transit — both won auctions and buy-now purchases.
      </p>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          Nothing in transit right now.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs uppercase text-muted-foreground">
                    {r.status}
                    {r.carrier && r.trackingNo
                      ? ` · ${r.carrier} #${r.trackingNo}`
                      : null}
                  </div>
                </div>
                <div className="text-sm font-semibold">{formatNOK(r.gross)}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
