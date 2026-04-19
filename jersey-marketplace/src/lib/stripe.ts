import Stripe from "stripe";
import { env } from "@/lib/env";
import { platformFee } from "@/lib/utils";

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2024-09-30.acacia" })
  : null;

export function requireStripe(): Stripe {
  if (!stripe) throw new Error("Stripe is not configured — see OUTSTANDING_SETUP.md");
  return stripe;
}

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
  return s.paymentIntents.create({
    amount: opts.grossAmountMinor,
    currency: opts.currency,
    application_fee_amount: platformFee(opts.grossAmountMinor),
    transfer_data: { destination: opts.destinationAccountId },
    automatic_payment_methods: { enabled: true },
    receipt_email: opts.buyerEmail,
    metadata: { orderId: opts.orderId },
  });
}
