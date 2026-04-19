# Oase

Live-auction + fixed-price marketplace and community for jersey collectors.

- **Plan:** [`PLAN.md`](./PLAN.md)
- **Setup checklist (API keys etc.):** [`OUTSTANDING_SETUP.md`](./OUTSTANDING_SETUP.md)

## Stack

Next.js 15 (App Router, TS) · Tailwind + shadcn/ui · Postgres + Drizzle ·
Better Auth (email/password for buyers, Vipps Login for sellers) · Stripe
Connect · Soketi (Pusher-protocol real-time) · Cloudflare R2 + Image
Resizing · Inngest · Resend · All on Railway.

## Getting started

```bash
cd jersey-marketplace
cp .env.example .env.local
# Fill in the variables — see OUTSTANDING_SETUP.md
npm install
npm run db:push       # push the schema to your Postgres
npm run dev
```

Then open http://localhost:3000.

To promote yourself to admin after signing up, run the SQL in
`scripts/make-admin.sql` against your database.

## Project layout

```
src/
  app/
    (routes)             — feed, browse, locker, wishlist, settings, upload
    buying/               — My Bids, To Pay, Paid
    selling/              — Seller dashboard + shipping states
    admin/                — Admin dashboard + approval queue (2-click review)
    signin/               — Email sign-in / signup + Vipps CTA
    u/[handle]/           — Public profile + locker
    api/
      auth/[...all]       — Better Auth handler
      auth/vipps/*        — Vipps OIDC flow (seller identity verification)
      jerseys              — Jersey + image upload, listing creation
      admin/listings/*    — Approve / reject (admin only)
      bids                 — Place bid (server-authoritative)
      stripe/connect/*    — Stripe Express onboarding
      webhooks/stripe     — Stripe webhooks (PI + Connect account updates)
      pusher/auth         — Soketi presence/private channel auth
      inngest              — Inngest function handler
  components/
    app-shell.tsx         — Sidebar (desktop) + drawer (mobile). No bottom nav.
    sidebar-nav.tsx       — Shared nav items
    ui/                    — shadcn primitives
  lib/
    auth.ts                — Better Auth config + Vipps helpers
    auth-client.ts         — React client hooks
    db/                    — Drizzle schema + client
    env.ts                 — Zod-validated env
    storage.ts             — R2 + CF Image Resizing
    stripe.ts              — Connect + PaymentIntent helpers
    pusher.ts              — Soketi server client
    inngest.ts             — Inngest client + event types
    email.ts               — Resend helpers
    utils.ts               — fees, bid increments, formatters
  inngest/
    functions.ts           — Auction finalisation
scripts/
  make-admin.sql           — Promote your user to admin
```

## Business rules baked in

- **Commission:** 8% total, inclusive of Stripe fees. Seller always nets 92%.
  See `PLATFORM_FEE_BPS` in `src/lib/utils.ts`.
- **Currency:** NOK, stored in minor units (øre).
- **Minimum age:** 13 — enforced at signup in `sign-in-form.tsx`.
- **Seller identity:** Vipps Login required before any sale listing.
- **Listing review:** two-click approve / reject with canned reasons +
  free-text. Admin-only. Locker uploads bypass review.
- **Shipping v1:** buyer pays, seller pastes carrier + tracking number.
- **Navigation:** sidebar on desktop, drawer on mobile. **No bottom nav.**

## Deploying to Railway

1. Finish the checklist in [`OUTSTANDING_SETUP.md`](./OUTSTANDING_SETUP.md).
2. Create a Railway service pointing at this folder. Railway picks up
   `railway.json` and uses Nixpacks + `npm run build` / `npm run start`.
3. Add all env vars from `.env.example` to the Railway service.
4. Run `npm run db:push` once locally against the Railway Postgres to
   create the schema (or add a release command).
5. Point `oase.ai` DNS at the Railway service once you're ready to swap
   from Webflow.
