import Pusher from "pusher";
import { env } from "@/lib/env";

export const pusher =
  env.SOKETI_APP_ID && env.SOKETI_APP_KEY && env.SOKETI_APP_SECRET && env.SOKETI_HOST
    ? new Pusher({
        appId: env.SOKETI_APP_ID,
        key: env.SOKETI_APP_KEY,
        secret: env.SOKETI_APP_SECRET,
        host: env.SOKETI_HOST,
        port: String(env.SOKETI_PORT ?? 6001),
        useTLS: (env.SOKETI_PORT ?? 6001) === 443,
      })
    : null;

export function listingChannel(listingId: string) {
  return `presence-listing-${listingId}`;
}

export async function broadcastBid(listingId: string, payload: {
  currentPrice: number;
  bidCount: number;
  extendedUntil?: string;
}) {
  if (!pusher) return;
  await pusher.trigger(listingChannel(listingId), "bid.placed", payload);
}

export async function broadcastAuctionEnded(listingId: string, winnerId: string | null) {
  if (!pusher) return;
  await pusher.trigger(listingChannel(listingId), "auction.ended", { winnerId });
}
