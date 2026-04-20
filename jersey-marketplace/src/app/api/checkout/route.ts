import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderTable, sellerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createCheckoutPaymentIntent, stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!stripe) return NextResponse.json({ error: "Payments not configured" }, { status: 501 });

  const { orderId, method } = (await req.json()) as { orderId: string; method: string };

  const [order] = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, orderId));

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.buyerId !== session.user.id) return NextResponse.json({ error: "Not your order" }, { status: 403 });
  if (order.status !== "awaiting_payment") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const [sp] = await db
    .select()
    .from(sellerProfile)
    .where(eq(sellerProfile.userId, order.sellerId));

  if (!sp?.stripeAccountId) {
    return NextResponse.json({ error: "Seller not onboarded" }, { status: 400 });
  }

  const pi = await createCheckoutPaymentIntent({
    grossAmountMinor: order.grossAmount + (order.shippingAmount ?? 0),
    currency: "nok",
    destinationAccountId: sp.stripeAccountId,
    orderId: order.id,
    buyerEmail: session.user.email,
  });

  // For card payments, return client secret for Stripe Elements
  // For redirect methods (Vipps, Klarna), Stripe handles the redirect
  if (pi.next_action?.redirect_to_url?.url) {
    return NextResponse.json({ redirectUrl: pi.next_action.redirect_to_url.url });
  }

  return NextResponse.json({
    clientSecret: pi.client_secret,
    paymentIntentId: pi.id,
  });
}
