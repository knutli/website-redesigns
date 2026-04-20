"use client";

import { useEffect, useState, useCallback } from "react";
import { AuctionBlock } from "@/components/auction-block";

type Props = {
  listingId: string;
  type: "auction" | "fixed";
  initialPrice: number;
  startPrice?: number;
  endAt?: Date | null;
  initialBidCount: number;
  watcherCount?: number;
  isSeller?: boolean;
  isHighestBidder?: boolean;
  isOutbid?: boolean;
  status: "live" | "ended" | "upcoming";
};

export function LiveAuction({
  listingId,
  type,
  initialPrice,
  startPrice,
  endAt,
  initialBidCount,
  watcherCount: initialWatchers,
  isSeller,
  isHighestBidder: initialHighest,
  isOutbid: initialOutbid,
  status: initialStatus,
}: Props) {
  const [currentPrice, setCurrentPrice] = useState(initialPrice);
  const [bidCount, setBidCount] = useState(initialBidCount);
  const [watcherCount, setWatcherCount] = useState(initialWatchers ?? 0);
  const [extendedEnd, setExtendedEnd] = useState(endAt);
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_SOKETI_KEY) return;

    let pusherClient: any;

    async function connect() {
      const PusherJS = (await import("pusher-js")).default;
      pusherClient = new PusherJS(process.env.NEXT_PUBLIC_SOKETI_KEY!, {
        wsHost: process.env.NEXT_PUBLIC_SOKETI_HOST ?? "localhost",
        wsPort: Number(process.env.NEXT_PUBLIC_SOKETI_PORT ?? 6001),
        forceTLS: Number(process.env.NEXT_PUBLIC_SOKETI_PORT ?? 6001) === 443,
        disableStats: true,
        enabledTransports: ["ws", "wss"],
        authEndpoint: "/api/pusher/auth",
      });

      const channel = pusherClient.subscribe(`presence-listing-${listingId}`);

      channel.bind("bid.placed", (data: {
        currentPrice: number;
        bidCount: number;
        extendedUntil?: string;
      }) => {
        setCurrentPrice(data.currentPrice);
        setBidCount(data.bidCount);
        if (data.extendedUntil) setExtendedEnd(new Date(data.extendedUntil));
      });

      channel.bind("auction.ended", () => {
        setStatus("ended");
      });

      channel.bind("pusher:subscription_count", (data: { subscription_count: number }) => {
        setWatcherCount(data.subscription_count);
      });
    }

    connect();

    return () => {
      pusherClient?.disconnect();
    };
  }, [listingId]);

  return (
    <AuctionBlock
      listingId={listingId}
      type={type}
      currentPrice={currentPrice}
      startPrice={startPrice}
      endAt={extendedEnd}
      bidCount={bidCount}
      watcherCount={watcherCount}
      isSeller={isSeller}
      isHighestBidder={initialHighest}
      isOutbid={initialOutbid}
      status={status}
    />
  );
}
