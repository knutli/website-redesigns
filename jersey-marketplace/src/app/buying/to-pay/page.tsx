import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderTable, listing, jersey } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { formatNOK } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ToPayPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/buying/to-pay");

  const rows = await db
    .select({
      id: orderTable.id,
      title: jersey.title,
      gross: orderTable.grossAmount,
    })
    .from(orderTable)
    .innerJoin(listing, eq(listing.id, orderTable.listingId))
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .where(and(eq(orderTable.buyerId, s.user.id), eq(orderTable.status, "awaiting_payment")))
    .orderBy(desc(orderTable.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">To pay</h1>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          Nothing to pay — won auctions and checkouts in progress land here.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-muted-foreground">Order {r.id.slice(0, 8)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-semibold">{formatNOK(r.gross)}</div>
                  <Button asChild>
                    <Link href={`/checkout/${r.id}`}>Pay</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
