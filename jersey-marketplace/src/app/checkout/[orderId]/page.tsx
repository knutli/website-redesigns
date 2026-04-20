import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderTable, listing, jersey, sellerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { formatNOK } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { CheckoutForm } from "./checkout-form";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/buying/to-pay");

  const { orderId } = await params;
  const [order] = await db
    .select({
      id: orderTable.id,
      grossAmount: orderTable.grossAmount,
      shippingAmount: orderTable.shippingAmount,
      status: orderTable.status,
      buyerId: orderTable.buyerId,
      sellerId: orderTable.sellerId,
      listingId: orderTable.listingId,
      title: jersey.title,
      club: jersey.club,
    })
    .from(orderTable)
    .innerJoin(listing, eq(listing.id, orderTable.listingId))
    .innerJoin(jersey, eq(jersey.id, listing.jerseyId))
    .where(eq(orderTable.id, orderId));

  if (!order) return notFound();
  if (order.buyerId !== session.user.id) redirect("/buying/to-pay");
  if (order.status !== "awaiting_payment") redirect("/buying/ongoing");

  const [sp] = await db
    .select()
    .from(sellerProfile)
    .where(eq(sellerProfile.userId, order.sellerId));

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-lg">Checkout</h1>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div>
            <div className="font-semibold text-foreground">{order.title}</div>
            <div className="text-xs text-text-tertiary">{order.club}</div>
          </div>
          <div className="space-y-1 border-t border-border pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Item</span>
              <span className="tabular-nums text-foreground">{formatNOK(order.grossAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Shipping</span>
              <span className="tabular-nums text-foreground">
                {order.shippingAmount ? formatNOK(order.shippingAmount) : "Free"}
              </span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatNOK(order.grossAmount + (order.shippingAmount ?? 0))}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <CheckoutForm
        orderId={order.id}
        amount={order.grossAmount + (order.shippingAmount ?? 0)}
        stripeConfigured={Boolean(sp?.stripeAccountId)}
      />
    </div>
  );
}
