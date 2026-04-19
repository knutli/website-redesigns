import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listing, jersey, sellerProfile } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNOK } from "@/lib/utils";

export default async function SellerDashboardPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/selling");

  const [profile] = await db
    .select()
    .from(sellerProfile)
    .where(eq(sellerProfile.userId, s.user.id));

  const items = await db
    .select({
      id: listing.id,
      title: jersey.title,
      status: listing.status,
      price: listing.currentPrice,
      type: listing.type,
    })
    .from(listing)
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .where(eq(listing.sellerId, s.user.id))
    .orderBy(desc(listing.createdAt));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Seller dashboard</h1>
          <p className="text-sm text-muted-foreground">
            8% commission · seller keeps 92% regardless of payment method
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">New listing</Link>
        </Button>
      </header>

      {!profile?.vippsSub ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 text-sm">
            <strong>Verify identity with Vipps</strong> — required before you can list.
            <div className="mt-2">
              <Button asChild size="sm">
                <a href="/api/auth/vipps/start?next=/selling">Verify with Vipps</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {profile?.vippsSub && !profile?.payoutsEnabled ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 text-sm">
            <strong>Set up payouts with Stripe</strong> — required to receive funds.
            <div className="mt-2">
              <Button asChild size="sm">
                <a href="/api/stripe/connect/start">Set up Stripe</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-2">
        <h2 className="font-medium">Your listings</h2>
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            No listings yet.
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((i) => (
              <Card key={i.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-medium">{i.title}</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      {i.type} · {i.status}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{i.price ? formatNOK(i.price) : "—"}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
