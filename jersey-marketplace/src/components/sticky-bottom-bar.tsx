"use client";

import { formatNOK } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  price: number;
  type: "auction" | "fixed";
  status: "live" | "ended" | "upcoming" | "sold";
  isHighestBidder?: boolean;
};

export function StickyBottomBar({ price, type, status, isHighestBidder }: Props) {
  const sold = status === "ended" || status === "sold";

  const label = sold
    ? "Sold for"
    : isHighestBidder
      ? "Your bid (highest)"
      : type === "auction"
        ? "Current bid"
        : "Price";

  function scrollToBid() {
    document.querySelector("[data-auction-block]")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      (document.querySelector("[data-bid-input]") as HTMLInputElement)?.focus();
    }, 400);
  }

  return (
    <div className="sticky bottom-0 z-[100] border-t border-border bg-bg-raised/95 px-4 pb-7 pt-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[10px] font-medium uppercase tracking-badge text-text-tertiary">
            {label}
          </div>
          <div className={`font-display text-xl font-bold tabular-nums tracking-tight ${sold ? "text-text-secondary" : "text-foreground"}`}>
            {formatNOK(price)}
          </div>
        </div>
        <Button
          size="lg"
          className="rounded-md px-8 py-3.5 text-base"
          disabled={sold || status === "upcoming"}
          onClick={!sold ? scrollToBid : undefined}
        >
          {sold ? "Sold" : type === "auction" ? "Place Bid" : "Buy Now"}
        </Button>
      </div>
    </div>
  );
}
