"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatNOK } from "@/lib/utils";

type BidItem = {
  username: string;
  avatarUrl?: string | null;
  amount: number;
  timestamp: string;
  isHighest?: boolean;
  isCurrentUser?: boolean;
};

type Props = {
  bids: BidItem[];
};

function timeAgo(ts: string) {
  const ms = Date.now() - new Date(ts).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function BidHistory({ bids }: Props) {
  const [showAll, setShowAll] = useState(false);
  if (bids.length === 0) return null;

  const visible = showAll ? bids : bids.slice(0, 5);

  return (
    <div className="px-4 pt-5">
      <h2 className="mb-3.5 font-display text-lg font-semibold tracking-tight text-foreground">
        Bid History
      </h2>
      <div>
        {visible.map((bid, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-2.5 py-2.5",
              i < visible.length - 1 && "border-b border-border",
            )}
          >
            {/* Avatar */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[13px]">
              {bid.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bid.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                bid.username.charAt(0).toUpperCase()
              )}
            </div>
            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">{bid.username}</div>
              <div className="text-[11px] text-text-tertiary">{timeAgo(bid.timestamp)}</div>
            </div>
            {/* Amount */}
            <div
              className={cn(
                "font-display text-sm font-bold tabular-nums",
                bid.isHighest ? "text-green-400" : "text-foreground",
              )}
            >
              {formatNOK(bid.amount)}
            </div>
          </div>
        ))}
      </div>
      {!showAll && bids.length > 5 ? (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="py-2.5 text-sm font-medium text-green-400"
        >
          Show all {bids.length} bids
        </button>
      ) : null}
    </div>
  );
}
