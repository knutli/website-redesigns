# Oase — Plan

**Oase** is a live-auction + fixed-price marketplace and community for
jersey collectors. Inspired by Collecto's auction model with the community
feel of Reddit and the marketplace UX of Depop / Vinted. Mobile-first.
Bilingual NB / EN from day one.

*Navn: "Oase" — an oasis for jersey collectors.*

---

## 1. Feature inventory

### Public / unauthenticated
- Landing / activity feed (read-only preview, prompt to sign in for actions)
- Browse with filters, sort, search
- Public user profiles + their public collections + public locker
- Public auction / listing pages (view bids, time left, photos)
- About / FAQ / terms / shipping policy

### Authenticated user
- Profile customisation (avatar, banner, bio, favourite club, location, socials)
- Locker — **public by default**, user can toggle individual jerseys or the
  whole locker to private in settings
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
- Cannot bid on own listing; must be signed in; account must be in good
  standing (email verified, no active bans)

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
[Oase]
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
- Brand palette TBD — placeholder is a warm sand / deep teal pairing that
  nods to the "oasis" name

---

## 4. Locked tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | SSR/ISR for SEO on listings, RSC for fast feeds |
| UI | **Tailwind CSS + shadcn/ui + lucide icons** | Mobile-first |
| Database | **Postgres on Railway** | Single bill, predictable cost |
| ORM | **Drizzle ORM** | Type-safe TS ORM, lightweight, no separate engine |
| Cache / rate limit / queue bus | **Redis on Railway** | For rate limits, session extras, Soketi presence |
| Auth | **Better Auth** | Self-hosted, Argon2id, 2FA, OAuth (Google + Apple), email verify, session rotation |
| Payments | **Stripe Connect (Express)** with Vipps + Klarna + cards | Destination charges, split payouts, escrow, KYC handled by Stripe |
| Real-time | **Soketi** (self-hosted on Railway) | Pusher-protocol compatible, MIT. Gives us bidirectional channels for auctions, presence, DMs, typing indicators |
| File storage | **Cloudflare R2** (storage) + **Cloudflare Image Resizing** (transforms at edge) | $0 egress, global CDN, on-the-fly resizing |
| Search | **Postgres FTS** initially → **Meilisearch on Railway** once filters get heavy | |
| Background jobs | **Inngest** | Auction-end finalisation, email digests, payout release, reminders |
| Email | **Resend** + **React Email** | Transactional |
| Hosting | **Everything on Railway** (app, Postgres, Redis, Soketi, Meilisearch) | Single dashboard, single bill |
| Monitoring | **Sentry** + **Axiom** (logs) | |
| Analytics | **PostHog** | Funnels + session replay |

### Security posture (auth + payments)
- Argon2id password hashing; no pepper, strong KDF params
- Session cookies: `httpOnly`, `Secure`, `SameSite=Lax`, rotated on privilege change
- CSRF protection on all state-changing routes
- Rate limiting on signin / signup / password-reset / bidding (Redis token bucket)
- Email verification required before bidding or listing
- Optional TOTP 2FA; strongly nudged for sellers before KYC
- OAuth: Google + Apple (Vipps Login if available)
- Stripe webhooks verified with signing secret; idempotency keys on all writes
- No card data touches our servers — all via Stripe Elements / Checkout
- Audit log for auth + admin + refund events
- Secrets in Railway env vars, never in client bundles
- Content Security Policy, HSTS, frame-ancestors none

---

## 5. Data model (high level)

- `users` (id, auth_id, handle, display_name, avatar, banner, bio, location,
  country, language, role, status, email_verified_at, created_at)
- `seller_profiles` (user_id, stripe_account_id, kyc_status, default_shipping_address_id)
- `addresses` (user_id, type, name, street, city, postcode, country)
- `jerseys` (id, owner_id, title, club, country, season, player, size,
  condition, authenticity, description,
  status: locker|draft|pending|live|sold|archived,
  visibility: public|private, created_at)
- `jersey_images` (jersey_id, storage_key, width, height, order)
- `listings` (id, jersey_id, type: auction|fixed, status, start_price,
  reserve_price, buy_now_price, current_price, end_at, extended_until,
  approved_by, approved_at, rejected_reason)
- `bids` (id, listing_id, bidder_id, amount, max_amount, placed_at,
  is_proxy, ip_hash)
- `orders` (id, listing_id, buyer_id, seller_id, gross_amount,
  platform_fee_amount, seller_net_amount, status: awaiting_payment|paid|
  shipped|delivered|disputed|refunded, payment_intent_id, shipped_at,
  tracking_no, carrier)
- `wishlists` (user_id, listing_id)
- `collections` (user_id, name, slug, cover_image, is_public)
- `collection_items` (collection_id, jersey_id, position)
- `follows` (follower_id, followed_id)
- `messages` (thread_id, sender_id, body, attachments, created_at)
- `notifications` (user_id, kind, payload, read_at)
- `reports` (reporter_id, target_type, target_id, reason, status)
- `audit_log` (actor_id, action, target, before, after, at)

---

## 6. Real-time auction architecture (Soketi)

1. Client authenticates a Pusher channel subscription via our `/api/pusher/auth`
   endpoint (Better Auth session required for private/presence channels)
2. Client subscribes to `presence-listing-{id}` channel on entering an auction page
3. Bid placed → POST `/api/bids` → server validates:
   - authenticated session
   - email verified, account in good standing
   - not the listing's owner
   - listing status = live, not past `extended_until`
   - bid ≥ current_price + minimum increment
   - Redis rate limit not exceeded
4. On accept, server writes bid in a DB transaction, updates
   `listings.current_price` and `extended_until` if within anti-snipe window,
   then publishes `bid.placed` to the listing's channel
5. All subscribers receive the event and update optimistically
6. Auction-end is owned by an **Inngest scheduled job**, never the client:
   at `end_at`, the job re-checks `extended_until`, finalises the winner,
   creates an `orders` row in `awaiting_payment`, fires notifications,
   and publishes `auction.ended`

Soketi also gives us:
- presence channels → "12 people watching this auction" badge
- DM typing indicators
- admin broadcast channel for site-wide announcements

---

## 7. Payments & fees

**Platform fee: 8% of the sale price, total — inclusive of Stripe's processing
fees.** The seller always receives 92% of the sale price regardless of payment
method. Stripe's processing fee comes out of our 8% cut, so our real net after
Stripe varies slightly by payment method (cards ~5.5%, Vipps ~5.75%, Klarna
~4.7%), but the seller's number is simple and predictable.

Implementation (Stripe Connect, destination charges):
1. Sellers complete Stripe Express onboarding the first time they list an
   auction or buy-now item (KYC + payout account). Locker uploads don't
   trigger this. Onboarding required for **any** sale — no threshold.
2. Buyer pays via a `PaymentIntent` with `transfer_data[destination]` set
   to the seller's connected account and `application_fee_amount` set to
   `gross_amount * 0.08`, rounded to the minor unit.
3. Funds held until shipping confirmed — seller marks "shipped" with
   tracking number, buyer confirms delivery or 7-day timer elapses, then
   funds release via transfer to the seller.
4. Refunds + disputes flow through our admin tool and issue
   `PaymentIntent` refunds; platform fee is reversed.

Supported methods: Cards, **Vipps MobilePay**, Klarna. All enabled as
Stripe payment methods — no separate integration.

Shipping: **v1 = sellers buy their own labels and paste tracking numbers**
into the order. **Posten / Bring label API integration is a later milestone.**

---

## 8. Milestones

**M0 — Foundations (week 1)**
- Repo + Next.js + Tailwind + shadcn scaffolding
- Drizzle + Railway Postgres + initial schema
- Better Auth flow + protected routes
- App shell: sidebar, mobile bottom nav, theme toggle
- Deployed to Railway (app + DB) behind a preview URL

**M1 — Profile + Locker (week 2)**
- Public profile pages
- Settings (private)
- Image upload to R2 + CF resizing
- Locker CRUD (public by default, no validation)
- Collections

**M2 — Listings + Browse (week 3)**
- Upload-jersey wizard (locker / auction / fixed)
- Admin approval queue
- Browse page: filters (club, country, season, size, price, condition,
  type), sort, search (Postgres FTS)
- Listing detail page

**M3 — Auctions live (week 4)**
- Soketi on Railway, channel auth
- Real-time bidding
- Anti-snipe + proxy bid + increments
- Inngest auction-end job
- Wishlist + outbid notifications
- Presence ("X watching")

**M4 — Payments + orders (week 5)**
- Stripe Connect Express onboarding
- Checkout (auction win + buy-now) with Vipps + Klarna + cards
- Buying / Selling dashboards (To Pay / Paid / Awaiting Payment / Ready to Ship)
- Shipping tracking input (manual carrier + tracking_no)
- Email notifications (Resend)
- Refund flow in admin

**M5 — Community (week 6)**
- Feed (activity ranking, follows, comments, reactions)
- DMs (Soketi-powered, typing indicators)
- Reviews after completed orders
- Reports / moderation tools

**M6 — Polish + launch (week 7)**
- Bilingual NB / EN
- Performance pass (image budget, RSC streaming, edge caching)
- Sentry + PostHog wired
- Beta with a slice of the community → iterate

**Later (post-launch):**
- Posten / Bring label API integration
- Meilisearch migration once filters get heavy
- Mobile push notifications (web push first, native app later)

---

## 9. Decisions locked in

- **Name:** Oase
- **Auth:** Better Auth (self-hosted, Argon2id, 2FA optional, Google + Apple OAuth)
- **Payments:** Stripe Connect (Express) — Vipps, Klarna, cards
- **Commission:** **8% total, inclusive of Stripe fees.** Seller always gets 92%.
- **KYC:** Required for any sale (no threshold)
- **Locker visibility default:** public
- **Shipping v1:** seller pastes tracking number + carrier; Posten integration later
- **Real-time:** Soketi from day one
- **Images:** Cloudflare R2 + CF Image Resizing
- **Hosting:** everything on Railway
- **Repo:** `jersey-marketplace/` folder in this repo, on branch
  `claude/jersey-marketplace-plan-1tK8Z`

## 10. Still open (can resolve as we go)

- Brand palette + logo direction (placeholder: warm sand + deep teal)
- 2FA — required for sellers or just nudged?
- Display font choice for hero / editorial moments
- Minimum account age before a user can list for sale (anti-fraud signal)
- Whether buyers or sellers pay shipping by default (buyer pays, added at checkout, is standard)

---

## 11. Build order if you greenlight

The M0 + M1 slice first: a deployable Oase shell on Railway with Better
Auth, profile, settings, locker upload, and the sidebar/bottom-nav
navigation working end to end. Real DB, real auth, real image upload —
no mocks — so we have a foundation to layer auctions onto without rework.
