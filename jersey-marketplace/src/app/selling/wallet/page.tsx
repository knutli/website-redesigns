import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNOK } from "@/lib/utils";

/**
 * Pseudo-wallet. Surfaces the seller's Stripe Connect balance directly —
 * we don't custody anything, the numbers come from Stripe.
 */

async function balanceFor(accountId: string) {
  if (!stripe) return null;
  return stripe.balance.retrieve({ stripeAccount: accountId });
}

export default async function WalletPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/selling/wallet");

  const [profile] = await db
    .select()
    .from(sellerProfile)
    .where(eq(sellerProfile.userId, s.user.id));

  if (!profile?.stripeAccountId) {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl">Wallet</h1>
        <Card className="border-dashed">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Finish Stripe onboarding to see your balance here.{" "}
            <a className="underline" href="/api/stripe/connect/start">
              Set up payouts
            </a>
            .
          </CardContent>
        </Card>
      </div>
    );
  }

  const balance = await balanceFor(profile.stripeAccountId);
  const available = balance?.available?.find((b) => b.currency === "nok")?.amount ?? 0;
  const pending = balance?.pending?.find((b) => b.currency === "nok")?.amount ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Wallet</h1>
        <p className="text-sm text-muted-foreground">
          Balance from your Stripe Connect account — we don't hold funds, Stripe does.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Available</div>
            <div className="font-display text-3xl">{formatNOK(available)}</div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" asChild>
                <a href="/api/stripe/payout/instant">Instant payout</a>
              </Button>
              <Button size="sm" variant="outline">
                Keep for fees
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Pending</div>
            <div className="font-display text-3xl">{formatNOK(pending)}</div>
            <div className="mt-3 text-xs text-muted-foreground">
              In the Stripe escrow window — will become available per Stripe's schedule.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
