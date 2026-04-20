"use client";

import { useState } from "react";
import { Heart, Eye, Users } from "lucide-react";
import { formatNOK, minNextBid, bidIncrement } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  listingId: string;
  type: "auction" | "fixed";
  currentPrice: number;
  startPrice?: number;
  endAt?: Date | null;
  bidCount: number;
  watcherCount?: number;
  uniqueBidders?: number;
  isSeller?: boolean;
  isHighestBidder?: boolean;
  isOutbid?: boolean;
  status?: "live" | "ended" | "upcoming";
};

function formatTime(end: Date) {
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "0h 0m 0s";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

export function AuctionBlock(props: Props) {
  if (props.type === "fixed") return <BuyNowBlock price={props.currentPrice} />;
  return <AuctionBidBlock {...props} />;
}

function BuyNowBlock({ price }: { price: number }) {
  return (
    <div className="mx-4 mt-4 rounded-lg border border-border bg-card p-5">
      <div className="text-[10px] font-medium uppercase tracking-badge text-text-tertiary">
        Price
      </div>
      <div className="font-display text-2xl tabular-nums text-foreground">
        {formatNOK(price)}
      </div>
      <Button variant="soft" className="mt-4 w-full rounded-md py-3.5 text-base">
        Buy Now
      </Button>
      <p className="mt-2 text-center text-[11px] text-text-tertiary">
        Secure checkout via Vipps
      </p>
    </div>
  );
}

function AuctionBidBlock({
  listingId,
  currentPrice,
  startPrice,
  endAt,
  bidCount,
  watcherCount,
  uniqueBidders,
  isSeller,
  isHighestBidder,
  isOutbid,
  status = "live",
}: Props) {
  const min = minNextBid(currentPrice || startPrice || 0);
  const increment = bidIncrement(currentPrice || startPrice || 0);
  const [bidVal, setBidVal] = useState(String(min / 100));

  const ended = status === "ended";
  const upcoming = status === "upcoming";

  return (
    <div className="mx-4 mt-4 rounded-lg border border-border bg-card p-5">
      {/* Bid + time row */}
      <div className="flex justify-between">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-badge text-text-tertiary">
            {ended ? "Final price" : upcoming ? "Starting bid" : "Current bid"}
          </div>
          <div className="font-display text-2xl tabular-nums tracking-tight text-foreground">
            {formatNOK(currentPrice || startPrice || 0)}
          </div>
          {isHighestBidder && !ended ? (
            <p className="text-xs font-medium text-green-400">You are the highest bidder</p>
          ) : null}
          {isOutbid && !ended ? (
            <p className="text-xs font-medium text-red-300">You have been outbid</p>
          ) : null}
        </div>
        {endAt ? (
          <div className="text-right">
            <div className="text-[10px] font-medium uppercase tracking-badge text-text-tertiary">
              {ended ? "Ended" : upcoming ? "Starts in" : "Time remaining"}
            </div>
            <div className="font-display text-lg tabular-nums tracking-tight text-foreground">
              {ended ? "—" : formatTime(endAt)}
            </div>
            <div className="mt-0.5 text-[11px] text-text-tertiary">
              {ended ? `Ended ${endAt.toLocaleDateString("nb-NO")}` : `Ends ${endAt.toLocaleDateString("nb-NO", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
            </div>
          </div>
        ) : null}
      </div>

      {/* Stats row */}
      {(bidCount > 0 || (watcherCount && watcherCount > 0)) ? (
        <div className="mt-4 flex gap-5 border-t border-border pt-3">
          {bidCount > 0 ? (
            <span className="flex items-center gap-[5px] text-xs text-text-secondary">
              <Heart className="h-3.5 w-3.5 text-text-tertiary" />
              {bidCount} bids
            </span>
          ) : null}
          {watcherCount && watcherCount > 0 ? (
            <span className="flex items-center gap-[5px] text-xs text-text-secondary">
              <Eye className="h-3.5 w-3.5 text-text-tertiary" />
              {watcherCount} watching
            </span>
          ) : null}
          {uniqueBidders && uniqueBidders > 0 ? (
            <span className="flex items-center gap-[5px] text-xs text-text-secondary">
              <Users className="h-3.5 w-3.5 text-text-tertiary" />
              {uniqueBidders} bidders
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Bid input */}
      {!ended && !upcoming && !isSeller ? (
        <>
          <div className="mt-4 flex gap-2">
            <input
              type="number"
              value={bidVal}
              onChange={(e) => setBidVal(e.target.value)}
              placeholder={isOutbid ? "Raise your bid..." : "Your bid..."}
              className="flex-1 rounded-md border-[1.5px] border-border-light bg-background px-3.5 py-3 font-display text-lg font-semibold tabular-nums text-foreground placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-text-tertiary focus:border-green-400 focus:outline-none"
              aria-label="Enter your bid amount"
              inputMode="numeric"
              min={min / 100}
            />
            <Button className="rounded-md px-6 py-3">Bid</Button>
          </div>
          <p className="mt-2 text-[11px] text-text-tertiary">
            Minimum next bid: {formatNOK(min)} · Bid increments: {formatNOK(increment)}
          </p>
        </>
      ) : null}

      {isSeller && !ended ? (
        <Button variant="outline" className="mt-4 w-full rounded-md">
          Edit Listing
        </Button>
      ) : null}
    </div>
  );
}
