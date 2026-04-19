import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { db } from "@/lib/db";
import { orderTable, sellerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 501 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await db
          .update(orderTable)
          .set({ status: "paid", paymentIntentId: pi.id, updatedAt: new Date() })
          .where(eq(orderTable.id, orderId));
      }
      break;
    }
    case "account.updated": {
      const acct = event.data.object as Stripe.Account;
      const payoutsEnabled = acct.payouts_enabled ?? false;
      await db
        .update(sellerProfile)
        .set({
          payoutsEnabled,
          kycStatus: payoutsEnabled ? "verified" : "pending",
          updatedAt: new Date(),
        })
        .where(eq(sellerProfile.stripeAccountId, acct.id));
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi = charge.payment_intent as string | null;
      if (pi) {
        await db
          .update(orderTable)
          .set({ status: "refunded", refundedAt: new Date(), updatedAt: new Date() })
          .where(eq(orderTable.paymentIntentId, pi));
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
