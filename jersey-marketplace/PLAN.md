# Jersey Marketplace — Plan

A live-auction + fixed-price marketplace and community for jersey collectors,
inspired by Collecto's auction model with the social/community layer of
Reddit and the marketplace UX of Depop / Vinted. Mobile-first.

Working name: TBD (placeholder: "Trøye" — Norwegian for jersey). Bilingual
NB / EN from day one is recommended.

---

## 1. Feature inventory

### Public / unauthenticated
- Landing / activity feed (read-only preview, prompt to sign in for actions)
- Browse with filters, sort, search
- Public user profiles + their public collections
- Public auction / listing pages (view bids, time left, photos)
- About / FAQ / terms / shipping policy

### Authenticated user
- Profile customisation (avatar, banner, bio, favourite club, location, socials)
- Locker (private or showcase-only — no admin validation needed to add)
- Collections (curated sets users can pin to their profile)
- Wishlist (saved auctions/listings, alerts)
- Upload jersey flow (single upload → choose: Locker / Auction / Buy Now)
- Bidding on auctions (with proxy bid / max bid)
- Buy now checkout
- Buying dashboard: My Bids, To Pay, Paid (with shipment tracking)
- Selling dashboard: active listings, awaiting payment, ready to ship,
  sold history, payouts
- Direct messages (buyer ↔ seller, optional general DMs)
- Notifications (in-app + email + optional push): outbid, auction ending,
  won, sold, payment received, message, listing approved/rejected
- Reviews / ratings after completed transactions
- Reports (listing, user, message)
- Settings: account, payment methods, shipping addresses, notification
  preferences, privacy (locker public / private), language, delete account

### Live auction mechanics
- Real-time current price + bid count + bidder pseudonyms
- Anti-snipe: bid in last 60s extends auction by 60s
- Bid increments scaled by current price (e.g. <500kr → 25kr steps,
  500–2000 → 50, 2000+ → 100)
- Proxy / max bidding
- Optional reserve price + Buy-it-now on auction listings
- Server-authoritative time + bid validation (prevent client-side cheating)
- Cannot bid on own listing; must be signed in; account must be in good standing

### Admin
- Listing approval queue (auctions + buy-now). Locker uploads bypass.
- User moderation, ban, shadow-ban
- Report queue
- Featured listings / homepage curation
- Refund + dispute tools
- Basic analytics (DAU, GMV, active auctions)

---

## 2. Information architecture

Sidebar (desktop) / drawer + bottom nav (mobile):

```
[Logo]
─────────────
  Feed
  Browse
  Wishlist
  Locker
─────────────
  BUYING
    My Bids
    To Pay
    Paid
─────────────
  SELLING
    Seller Dashboard
    Awaiting Payment
    Ready to Ship
─────────────
  Settings
─────────────
  [+ Upload Jersey]   (primary CTA, sticky)
```

Mobile bottom nav (5 slots): Feed · Browse · **+ Upload (FAB)** · Wishlist · Profile.
Buying / Selling / Settings live behind the profile menu and a slide-in drawer.

---

## 3. UI direction

- Mobile-first, dense card feed, large tap targets
- Reddit-style activity feed: "X listed", "Y won an auction", "Z added to
  locker", with comments/reactions inline
- Depop / Vinted-style listing cards: square photo, price, time-left chip,
  bid count, seller avatar
- Modern aesthetic: high-contrast typography, generous whitespace,
  rounded-2xl cards, subtle motion on bid updates (price flash + count tick)
- Dark mode + light mode
- Component library: shadcn/ui (Radix + Tailwind), lucide icons
- Typography: Inter or Geist for UI, an editorial display font for hero

---

## 4. Recommended tech stack

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/ISR for SEO on listings, RSC for fast feeds, single deploy target |
| UI | **Tailwind CSS + shadcn/ui** | Mobile-first, fully customisable, no design lock-in |
| DB | **Postgres on Railway** (or Neon if we want serverless + branching) | Cheap, scalable, you already have Railway |
| ORM | **Drizzle ORM** | Type-safe, lightweight, great migrations; Prisma is a fine alt |
| Auth | **Better Auth** *(or WorkOS AuthKit)* — see decision below | Clerk works but ~$600/mo at 40k MAU; both alternatives are free at this scale |
| Payments | **Stripe Connect** *(with Vipps + Klarna enabled)* — see decision below | Built-in marketplace escrow + payouts + KYC; Dintero is solid for NO but Connect-style features need more glue |
| Real-time | **Ably** *(managed)* or **self-hosted Soketi on Railway** | Auctions need reliable pub/sub; Ably free tier (6M msg/mo) covers early stage |
| File storage | **Cloudflare R2** + **Cloudflare Images** | R2 has zero egress fees; Images handles resizing/variants on the fly |
| Search | **Postgres FTS** v1 → **Meilisearch** when filters get heavy | Avoid Algolia cost; Meili runs on Railway for ~$5/mo |
| Background jobs | **Inngest** (free tier generous) | Auction-end finalisation, email digests, payout reconciliation |
| Email | **Resend** + **React Email** | Cheap, devex |
| Hosting | App on **Vercel** or **Railway**; DB on Railway | Vercel = best Next.js DX; Railway = single bill, predictable cost |
| Monitoring | **Sentry** + **Axiom** (logs) | |
| Analytics | **PostHog** (self-host or cloud) | Funnels + session replay |

---

## 5. Data model (high level)

- `users` (auth provider id, handle, display_name, avatar, banner, bio,
  location, country, language, role, status, created_at)
- `seller_profiles` (user_id, payout_account_id, kyc_status, default_shipping)
- `addresses` (user_id, type, name, street, city, postcode, country)
- `jerseys` (id, owner_id, title, club, country, season, player, size,
  condition, authenticity, description, status: locker|draft|pending|live|sold|archived,
  visibility: public|private, created_at)
- `jersey_images` (jersey_id, storage_key, width, height, order)
- `listings` (id, jersey_id, type: auction|fixed, status, start_price,
  reserve_price, buy_now_price, current_price, end_at, extended_until,
  approved_by, approved_at, rejected_reason)
- `bids` (id, listing_id, bidder_id, amount, max_amount, placed_at,
  is_proxy, ip_hash)
- `orders` (id, listing_id, buyer_id, seller_id, amount, fee, status:
  awaiting_payment|paid|shipped|delivered|disputed|refunded, payment_intent_id,
  shipped_at, tracking_no, carrier)
- `wishlists` (user_id, listing_id)
- `collections` (user_id, name, slug, cover_image, is_public)
- `collection_items` (collection_id, jersey_id, position)
- `follows` (follower_id, followed_id)
- `messages` (thread_id, sender_id, body, attachments, created_at)
- `notifications` (user_id, kind, payload, read_at)
- `reports` (reporter_id, target_type, target_id, reason, status)
- `audit_log` (actor_id, action, target, before, after, at)

---

## 6. Real-time auction architecture

1. Client subscribes to `listing:{id}` channel on entering page
2. Bid placed → POST `/api/bids` → server validates (auth, not own listing,
   bid > current + min increment, listing live, account good standing)
3. On accept, server: writes bid in tx, updates `listings.current_price` +
   `extended_until` if anti-snipe, publishes `bid.placed` event
4. All subscribers receive the event and update UI optimistically
5. Auction-end is owned by Inngest scheduled job (not the client/timer):
   at `end_at`, job re-checks `extended_until`, finalises winner,
   creates `order` row in `awaiting_payment`, fires notifications

This pattern keeps state authoritative on the server and resilient to
disconnects, tab closes, and client clock drift.

---

## 7. Payment flow (Stripe Connect Express)

1. Sellers complete Stripe Express onboarding before their first listing
   is approved (KYC, payout account)
2. Buyer pays via PaymentIntent with `transfer_data[destination]` = seller
3. Platform fee taken automatically (configurable, e.g. 8%)
4. Funds held until shipped + delivered (manual capture or delayed transfer);
   seller marks "shipped" with tracking → after N days or buyer confirm,
   funds release
5. Disputes handled in admin tool, refund issues PaymentIntent refund

Vipps + Klarna are enabled as Stripe payment methods so Norwegian buyers
get familiar checkout.

---

## 8. Milestones

**M0 — Foundations (week 1)**
- Repo + Next.js + Tailwind + shadcn scaffolding
- Drizzle + Railway Postgres + initial schema
- Auth flow (Better Auth) + protected routes
- App shell: sidebar, mobile bottom nav, theme toggle

**M1 — Profile + Locker (week 2)**
- Public profile pages
- Settings (private)
- Image upload to R2 + variants via CF Images
- Locker CRUD (no validation)
- Collections

**M2 — Listings + Browse (week 3)**
- Upload-jersey wizard (locker / auction / fixed)
- Admin approval queue
- Browse page: filters (club, country, season, size, price, condition,
  type), sort, search
- Listing detail page

**M3 — Auctions live (week 4)**
- Real-time bidding via Ably
- Anti-snipe + proxy bid + increments
- Inngest auction-end job
- Wishlist + outbid notifications

**M4 — Payments + orders (week 5)**
- Stripe Connect onboarding
- Checkout (auction win + buy-now)
- Buying / Selling dashboards (To Pay / Paid / Awaiting Payment / Ready to Ship)
- Shipping + tracking
- Email notifications (Resend)

**M5 — Community (week 6)**
- Feed (activity ranking, follows, comments, reactions)
- DMs
- Reviews after completed orders
- Reports / moderation tools

**M6 — Polish + launch (week 7)**
- Bilingual NB / EN
- Performance pass (image budget, RSC streaming, edge caching)
- Sentry + PostHog wired
- Beta with a small slice of the 40k community → iterate

---

## 9. Open decisions for you

1. **Auth — Better Auth (free, self-hosted), WorkOS AuthKit (free up to
   1M MAU, hosted), or stick with Clerk (best DX, ~$600/mo at 40k MAU)?**
   My pick: **Better Auth** if we want zero auth bills; **WorkOS** if you
   want hosted-screens convenience.

2. **Payments — Stripe Connect (with Vipps + Klarna) or Dintero?**
   My pick: **Stripe Connect**. Dintero is great for plain checkout in
   Norway, but Connect's marketplace primitives (split payments, escrow,
   seller KYC, payouts) save weeks of work. We still get Vipps via Stripe.

3. **DB host — Railway or Neon?**
   My pick: **Railway** since you already have it; Neon is better only
   if we want preview-branch databases per PR.

4. **Hosting — Vercel or Railway for the app?**
   Vercel = best Next.js experience, generous free tier, but bandwidth +
   function compute can spike. Railway = predictable monthly cost, single
   bill alongside DB. My pick: **Vercel** for now, move to Railway/Fly
   only if Vercel cost surprises us.

5. **Repo layout — new repo or this branch?**
   Recommend a new top-level folder `jersey-marketplace/` in this repo on
   the `claude/jersey-marketplace-plan-1tK8Z` branch so it lives next to
   `morstol/`. Easy to extract to its own repo later.

6. **Branding** — name, colour palette, logo direction? Without these I'll
   ship neutral placeholders.

7. **Commission %** for seller fees — 8% is a common starting point.

8. **Shipping** — integrate Posten/Bring labels day-one, or have sellers
   buy their own and just paste tracking numbers? Latter is faster to ship.

9. **KYC threshold** — require Stripe Connect onboarding for *any* sale,
   or only above a value (e.g. >2000 kr)?

10. **Locker visibility default** — public showcase or private by default?

---

## 10. What I'll build first if you greenlight

The M0 + M1 slice: a deployable shell with auth, profile, settings, locker
upload, and the sidebar/bottom-nav navigation working end to end. Nothing
mocked — real DB, real auth, real image upload — so we have a foundation
to layer auctions onto without rework.
