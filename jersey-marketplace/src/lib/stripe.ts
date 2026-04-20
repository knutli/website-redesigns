import Stripe from "stripe";
import { env } from "@/lib/env";
import { platformFee } from "@/lib/utils";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY)
  : null;

export function requireStripe(): Stripe {
  if (!stripe) throw new Error("Stripe is not configured — see OUTSTANDING_SETUP.md");
  return stripe;
}

const VIPPS_HEADER = { apiVersion: "2026-03-25.preview;vipps_preview=v1" as any };

export async function createConnectedAccount(opts: {
  email: string;
  country?: string;
}) {
  const s = requireStripe();
  return s.accounts.create({
    type: "express",
    country: opts.country ?? "NO",
    email: opts.email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
  });
}

export async function onboardingLink(accountId: string, returnUrl: string) {
  const s = requireStripe();
  return s.accountLinks.create({
    account: accountId,
    refresh_url: returnUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
}

export async function createCheckoutPaymentIntent(opts: {
  grossAmountMinor: number;
  currency: "nok" | "eur";
  destinationAccountId: string;
  orderId: string;
  buyerEmail: string;
}) {
  const s = requireStripe();
  return s.paymentIntents.create(
    {
      amount: opts.grossAmountMinor,
      currency: opts.currency,
      payment_method_types: ["card", "klarna", ...(opts.currency === "nok" ? ["vipps"] : [])],
      application_fee_amount: platformFee(opts.grossAmountMinor),
      transfer_data: { destination: opts.destinationAccountId },
      receipt_email: opts.buyerEmail,
      metadata: { orderId: opts.orderId },
    },
    opts.currency === "nok" ? VIPPS_HEADER : undefined,
  );
}

export async function createDirectPaymentIntent(opts: {
  amountMinor: number;
  currency: "nok" | "eur";
  orderId: string;
  buyerEmail: string;
}) {
  const s = requireStripe();
  return s.paymentIntents.create(
    {
      amount: opts.amountMinor,
      currency: opts.currency,
      payment_method_types: ["card", "klarna", ...(opts.currency === "nok" ? ["vipps"] : [])],
      receipt_email: opts.buyerEmail,
      metadata: { orderId: opts.orderId },
    },
    opts.currency === "nok" ? VIPPS_HEADER : undefined,
  );
}
