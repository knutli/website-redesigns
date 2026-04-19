import { Inngest } from "inngest";
import { env } from "@/lib/env";

export const inngest = new Inngest({
  id: "oase",
  eventKey: env.INNGEST_EVENT_KEY,
  signingKey: env.INNGEST_SIGNING_KEY,
});

/**
 * Event types — the actual function handlers live in src/inngest/functions.ts.
 */
export type Events = {
  "auction/ended": { data: { listingId: string } };
  "listing/submitted": { data: { listingId: string } };
  "listing/approved": { data: { listingId: string } };
  "listing/rejected": { data: { listingId: string; reason: string } };
  "order/paid": { data: { orderId: string } };
  "order/shipped": { data: { orderId: string } };
};
