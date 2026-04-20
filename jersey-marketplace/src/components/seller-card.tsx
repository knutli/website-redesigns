"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  handle?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  saleCount?: number | null;
  memberSince?: number | null;
  isVerified?: boolean;
  isFollowed?: boolean;
};

export function SellerCard({
  handle,
  name,
  avatarUrl,
  rating,
  saleCount,
  memberSince,
  isVerified,
  isFollowed: initialFollowed = false,
}: Props) {
  const [followed, setFollowed] = useState(initialFollowed);
  const displayName = handle ? `@${handle}` : name ?? "Seller";
  const stats = [
    rating ? `★ ${rating.toFixed(1)}` : null,
    saleCount ? `${saleCount} sales` : null,
    memberSince ? `Since ${memberSince}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      {/* Avatar */}
      <Link href={`/u/${handle ?? ""}`}>
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-border bg-bg-raised">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm">
              {(name ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Link href={`/u/${handle ?? ""}`} className="text-sm font-semibold text-foreground">
            {displayName}
          </Link>
          {isVerified ? (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sage">
              <svg className="h-[9px] w-[9px]" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 5l2.5 2.5L8 3" />
              </svg>
            </span>
          ) : null}
        </div>
        {stats ? (
          <p className="mt-0.5 text-xs text-text-secondary">{stats}</p>
        ) : null}
      </div>

      {/* Follow button */}
      <Button
        variant={followed ? "soft" : "ghost"}
        size="compact"
        onClick={() => setFollowed(!followed)}
        className={cn(
          "shrink-0 text-xs",
          followed && "border-green-900 bg-green-900 text-green-300",
        )}
      >
        {followed ? "Following" : "Follow"}
      </Button>
    </div>
  );
}
