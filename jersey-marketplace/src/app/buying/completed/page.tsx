import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderTable, listing, jersey } from "@/lib/db/schema";
import { and, eq, inArray, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { formatNOK } from "@/lib/utils";

export default async function CompletedPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/buying/completed");

  const rows = await db
    .select({
      id: orderTable.id,
      title: jersey.title,
      gross: orderTable.grossAmount,
      status: orderTable.status,
      deliveredAt: orderTable.deliveredAt,
    })
    .from(orderTable)
    .innerJoin(listing, eq(listing.id, orderTable.listingId))
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .where(
      and(
        eq(orderTable.buyerId, s.user.id),
        inArray(orderTable.status, ["delivered", "refunded"]),
      ),
    )
    .orderBy(desc(orderTable.deliveredAt));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Completed</h1>
      <p className="text-sm text-muted-foreground">
        Delivered and refunded orders. Leave a review from the order detail.
      </p>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          Nothing completed yet.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs uppercase text-muted-foreground">{r.status}</div>
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
