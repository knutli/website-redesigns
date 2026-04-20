"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNOK } from "@/lib/utils";
import { Loader2, CreditCard, Smartphone } from "lucide-react";

type Props = {
  orderId: string;
  amount: number;
  stripeConfigured: boolean;
};

export function CheckoutForm({ orderId, amount, stripeConfigured }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay(method: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push("/buying/ongoing");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  if (!stripeConfigured) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-sm text-text-tertiary">
          Seller hasn't completed Stripe onboarding yet. Payment will be available once they do.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary">Choose payment method</p>

      <button
        type="button"
        onClick={() => handlePay("card")}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-card-hover disabled:opacity-50"
      >
        <CreditCard className="h-5 w-5 text-text-tertiary" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Card</div>
          <div className="text-xs text-text-tertiary">Visa, Mastercard</div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => handlePay("vipps")}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-card-hover disabled:opacity-50"
      >
        <Smartphone className="h-5 w-5 text-text-tertiary" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Vipps MobilePay</div>
          <div className="text-xs text-text-tertiary">Pay with your phone</div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => handlePay("klarna")}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-card-hover disabled:opacity-50"
      >
        <div className="flex h-5 w-5 items-center justify-center text-xs font-bold text-text-tertiary">K</div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Klarna</div>
          <div className="text-xs text-text-tertiary">Pay later or in instalments</div>
        </div>
      </button>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <p className="text-center text-[11px] text-text-tertiary">
        Secure payment via Stripe. Your card details never touch our servers.
      </p>
    </div>
  );
}
