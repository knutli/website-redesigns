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
- **Discover → Collections** — curated collections surface as their own
  browseable layer, not just personal profile decoration
- **Discover → Wanted** — public list of active Wanted posts
- Public user profiles + their public collections + public locker
- Public auction / listing pages (view bids, time left, photos, view count,
  public Annons-ID, days-since-published, share, "Suspected fake?" flag)
- About / FAQ / terms / shipping policy

### Authenticated user
- Profile customisation (avatar, banner, bio, favourite club, location, socials)
- **Verified Collector badge** — trust signal applied by admin based on
  criteria TBD (e.g. a minimum number of positive reviews, hand-verified
  identity, verified high-value authenticated collections). Shown next to
  the handle on listings, profiles, messages, bids. Nominations can be
  automated once we have the signal, but the final flip is a manual admin
  action in the dashboard
- Locker — **public by default**, toggle individual jerseys or the whole
  locker to private in settings
- Collections (curated sets users can pin to their profile)
- **Wishlist** — saved auctions and fixed listings, with outbid /
  ending-soon / price-drop alerts. _Private to the user._
- **Wanted** — separate from Wishlist. Public "I'm looking for X" posts
  (club, era, size, max price, notes + optional reference photos). Each
  Wanted has its own detail page and feeds matching-listing alerts to the
  author plus a badge on matching new listings ("3 people want this").
  Users get a personal **My Wanted** view; Wanted posts also surface in
  Discover
- Upload jersey flow (single upload → choose: Locker / Auction / Buy Now)
- Bidding on auctions (with proxy bid / max bid)
- Buy-now checkout
- **My Bids** — active bidding activity (outbid, leading, won-unpaid)
- **My Purchases** — `To pay` / `Ongoing` / `Completed`. "Ongoing" merges
  won-auctions-awaiting-delivery with buy-now-awaiting-delivery
- Selling dashboard: active listings, awaiting payment, ready to ship,
  sold history, payouts, **pseudo-wallet** (Stripe Connect balance)
- Saved payment methods (card / Vipps / Klarna) for **fast checkout** +
  auto-charge on auction win
- Direct messages (buyer ↔ seller, plus **Ask-a-question** threads
  pinned to listings — M5)
- Notifications (in-app + email + optional push): outbid, auction ending,
  won, sold, payment received, message, listing approved/rejected,
  matching-listing for your Wanted posts, suspected-fake verdict
- Reviews / ratings after completed transactions
- Reports (listing, user, message) + prominent **Suspected fake?** flow
  distinct from generic Report. Feeds a dedicated admin authenticity queue
- Settings: account, payment methods, shipping addresses, notification
  preferences, privacy (locker public / private), **language + currency**,
  delete account

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
- **Browse card for auctions shows both current bid and time remaining.**
  We deliberately deviate from "countdown only until you open it" — buyers
  scanning a feed benefit from the number being visible

### Listing detail extras (v1)
- View counter ("41 views") — cheap social-proof signal
- Share button (native share sheet on mobile, copy-link fallback)
- Public Annons-ID (e.g. `7F215554`) for support / moderation reference
- "Published N days ago"
- Auto-translated descriptions with a visible "Auto-translated from
  {lang}" disclaimer — single LLM call at listing save + when the source
  description changes; cached per target language
- Cross-sell rail at the bottom — "Other jerseys in size M" /
  "More from this club". Recommendation by shared attributes (size,
  club, era)
- Follow seller + Visit profile CTAs on the listing card
- Reserve-price indicator chip (auctions only)
- **Suspected fake?** report CTA — visually distinct from generic report

### Admin
- Listing approval queue (auctions + buy-now). Locker uploads bypass.
- **Two-click review flow** — admin scrolls the jersey's images (arrow keys /
  swipe / click), then either **Approve** (one click, listing goes live) or
  **Reject** (one click opens a short menu of frequent reasons + free-text
  field). Decision is written to `listings.rejected_reason` /
  `approved_by` / `approved_at` and an in-app + email notification fires to
  the seller. Next item loads automatically so the reviewer can stay in flow.
- **Authenticity queue** — "Suspected fake?" reports feed a separate queue
  with its own workflow (take down, request more photos, mark verified)
- **Verified Collector nominations** — review and flip the badge
- User moderation, ban, shadow-ban
- Report queue
- Featured listings / homepage curation + Collections curation
- Refund + dispute tools
- Basic analytics (DAU, GMV, active auctions, Wanted-match conversion)

---

## 2. Information architecture

**No bottom nav.** Sidebar on desktop, slide-in drawer (hamburger) on mobile —
same structure in both. A persistent top bar holds quick actions across
breakpoints.

### Top bar (both desktop and mobile)

```
[logo]    [search]         ♡  🔔  💬   [avatar/menu]
                         wish  notif  msgs
```

On mobile the top bar is sticky and also includes a hamburger on the left
that opens the drawer.

### Sidebar / drawer

```
[Oase]
─────────────
  Feed
  Browse
  DISCOVER
    Collections
    Wanted
  Wishlist
  Locker
─────────────
  BUYING
    My Bids
    Purchases
      To pay
      Ongoing
      Completed
─────────────
  SELLING
    Seller Dashboard
    Awaiting Payment
    Ready to Ship
    Wallet         ← Stripe Connect balance (pseudo-wallet)
─────────────
  Settings
─────────────
  [+ Create listing]   (primary CTA, sticky)
  [+ Create wanted]    (secondary CTA, sticky — on mobile drawer these two
                        sit at the top of the drawer instead)
```

The drawer mirrors the desktop sidebar exactly so the IA is identical
across breakpoints. On mobile drawers the two Create CTAs sit at the top
of the drawer for thumb reach; on desktop they sit at the bottom of the
sidebar.

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
| Auth | **Better Auth** | Self-hosted, Argon2id, 2FA, email verify. Buyers/bidders: email + password. Sellers: **Vipps Login** (Norway identity verification) |
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
- Optional TOTP 2FA for buyers; sellers verified via Vipps (identity-assured)
- **Seller identity:** Vipps Login required before a user can list anything
  for sale. In Norway (launch market) Vipps gives us name + phone + verified
  identity tied to BankID. Once we expand to EU, we add equivalent identity
  providers (e.g. iDIN, BankID.se, FranceConnect) per market
- **Buyer / bidder:** email + password with verified email. 2FA optional
- Stripe webhooks verified with signing secret; idempotency keys on all writes
- No card data touches our servers — all via Stripe Elements / Checkout
- Audit log for auth + admin + refund events
- Secrets in Railway env vars, never in client bundles
- Content Security Policy, HSTS, frame-ancestors none

---

## 5. Data model (high level)

- `users` (id, auth_id, handle, display_name, avatar, banner, bio, location,
  country, **language, preferred_currency**, role, status,
  **verified_collector, verified_collector_at**, email_verified_at,
  **birth_date**, created_at)
- `seller_profiles` (user_id, vipps_sub, vipps_phone, vipps_name,
  stripe_account_id, kyc_status, payouts_enabled,
  default_shipping_address_id)
- `addresses` (user_id, type, name, street, city, postcode, country)
- `jerseys` (id, owner_id, title, club, country, season, player, size,
  condition, authenticity, description,
  status: locker|draft|pending|live|sold|archived,
  visibility: public|private, created_at)
- `jersey_images` (jersey_id, storage_key, width, height, order)
- `listings` (id, jersey_id, **public_id** (e.g. 7F215554), type:
  auction|fixed, status, start_price, reserve_price, buy_now_price,
  current_price, end_at, extended_until, approved_by, approved_at,
  rejected_reason, **view_count**, **description_translations jsonb**
  {lang → text}, **source_language**)
- `bids` (id, listing_id, bidder_id, amount, max_amount, placed_at,
  is_proxy, ip_hash)
- `orders` (id, listing_id, buyer_id, seller_id, gross_amount,
  platform_fee_amount, seller_net_amount, shipping_amount, status:
  awaiting_payment|paid|shipped|delivered|disputed|refunded,
  payment_intent_id, shipping_address_id, shipped_at, tracking_no,
  carrier, delivered_at, refunded_at)
- `saved_payment_methods` (id, user_id, stripe_payment_method_id, type:
  card|vipps|klarna, brand, last4, is_default, created_at) — powers
  fast-checkout + auction-win auto-charge
- `credit_ledger` (id, user_id, delta_minor, reason, order_id?, expires_at?,
  created_at) — M5 store credit. Non-withdrawable by default; optional
  withdraw goes through normal Stripe payout flow
- `wishlists` (user_id, listing_id, created_at)
- **`wanted`** (id, user_id, title, club, country, season, size_pref,
  player, description, max_price_minor, status: active|fulfilled|archived,
  created_at) — reverse-marketplace posts
- `wanted_image` (id, wanted_id, storage_key, order) — optional
  reference photos
- `collections` (id, user_id, name, slug, cover_image, is_public, created_at)
- `collection_items` (collection_id, jersey_id, position)
- `follows` (follower_id, followed_id, created_at)
- `message_thread` (id, order_id?, listing_id?, kind: dm|qa, created_at)
  — `kind=qa` are Ask-a-question threads pinned to a listing (M5)
- `thread_participant` (thread_id, user_id, last_read_at)
- `message` (id, thread_id, sender_id, body, attachments, created_at)
- **`listing_question`** (M5) — public Q&A variant (question + answer
  pair, visible on the listing). _Decision pending:_ do we expose
  questions publicly (Vinted-style) or keep them private DM-backed
  (Depop-style)? Default: private DM-backed with kind=qa in messages
- `notifications` (user_id, kind, payload, read_at, created_at)
- `reports` (id, reporter_id, target_type, target_id, kind: generic|fake,
  reason, details, status, resolved_by, resolved_at)
- `audit_log` (actor_id, action, target, before, after, at)
- **`listing_view`** — simple counter on `listings.view_count` (no
  separate table for v1). Increment from the server on RSC render,
  throttled per session to avoid double-count

### Post-launch (not in v1 schema)
- `offer` / `counter_offer` — Negotiate / offers system, deferred to its
  own milestone. Needs its own state machine (offer → counter → accept
  → expiry → link to checkout) and affects listing status
- `oase_wallet_*` — full top-up wallet via BaaS. Revisit via Swan.io
  post-launch if users ask for it
- **Jersey Artifact Cards** — turn each jersey into a collectible digital
  card with a rarity grade. AI assigns a rarity score based on
  era + condition + scarcity + player significance. Rare jerseys get
  holographic card effects (CSS/WebGL shimmer on tilt/scroll). Cards can
  be shared as images, shown in profile, and used as social proof in
  listings. Inspired by Pokémon card aesthetics applied to jersey
  collecting. Own milestone post-launch

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

## 7. Payments, fees, and wallet

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

Shipping: **v1 = buyer pays**, added at checkout. Seller buys their own
label and pastes the tracking number + carrier into the order. Posten /
Bring label API integration is a later milestone.

### Fast checkout + auction-win auto-charge (v1 — M4)

Buyers save a payment method (card / Vipps / Klarna) via Stripe Setup
Intents. That token is stored against `saved_payment_methods`. When a
user wins an auction:

1. Inngest `auction/ended` job finalises the winner.
2. We create a `PaymentIntent` with `confirm=true` and `off_session=true`
   against the buyer's default saved method.
3. On success, the order skips "To pay" and lands in "Ongoing".
4. On failure (SCA required, expired card, insufficient funds), order
   falls back to "To pay" and the buyer is notified to pay manually.

This gives buyers the "it just works" UX of a wallet without us
custodying funds or needing an EMI licence.

### Pseudo-wallet on Selling dashboard (v1 — M4)

The sellers' `Wallet` view surfaces their Stripe connected-account
balance straight from the Stripe API:

- **Available** — payable out now
- **Pending** — inside the Stripe escrow window
- **On hold** — tied up in disputes

Buttons: "Instant payout" (Stripe's fast-payouts feature, if eligible)
and "Keep for fees" (no-op, just closes the sheet). Nothing lives in our
database — we're surfacing Stripe's balance, not custodying funds.

### Oase Credits — store credit (v1.5 — M5)

Sellers can earn credits (referrals, return-pack bonuses, admin goodwill)
that spend on-site. Tracked in `credit_ledger` as signed minor-unit
deltas. Non-withdrawable by default; optional withdraw-to-bank path
pushes funds through normal Stripe payout and reduces the ledger.
Because the credits aren't cash-redeemable on demand, this generally
sits outside the e-money definition.

### Full top-up wallet (post-launch, maybe)

Real Collecto-style wallet (top up → hold balance → bid → pay) needs a
BaaS partner or an EMI licence. Ongoing KYC/AML obligations, fund
segregation, compliance cost. Revisit via **Swan.io** (Nordic-focused
BaaS) post-launch if users actually ask for it.

---

## 8. Milestones

**M0 — Foundations (week 1)**
- Repo + Next.js + Tailwind + shadcn scaffolding
- Drizzle + Railway Postgres + initial schema
- Better Auth flow + protected routes (email/password for buyers, Vipps for sellers)
- App shell: sidebar + mobile drawer (no bottom nav), theme toggle
- Deployed to Railway (app + DB) behind a preview URL

**M1 — Profile + Locker (week 2)**
- Public profile pages
- Settings (private)
- Image upload to R2 + CF resizing
- Locker CRUD (public by default, no validation)
- Collections

**M2 — Listings + Browse + Discover (week 3)**
- Upload-jersey wizard (locker / auction / fixed)
- **Create Wanted flow** + `/wanted` browse + `/wanted/mine`
- Admin approval queue (listings) + Verified Collector flip
- Browse page: filters (club, country, season, size, price, condition,
  type), sort, search (Postgres FTS)
- **Discover → Collections** surface (public browseable collections)
- Listing detail page with: public Annons-ID, view counter, share,
  "Published N days ago", reserve chip, **Suspected fake?** report,
  cross-sell rail, auto-translated descriptions (LLM call at save time,
  cached per language)
- Currency switcher (NOK default; detect locale; later EUR/SEK/DKK when
  we expand)
- Top bar: heart / bell / messages icons wired up (counts are best-effort
  in M2, real counts in M5)

**M3 — Auctions live (week 4)**
- Soketi on Railway, channel auth
- Real-time bidding
- Anti-snipe + proxy bid + increments
- Inngest auction-end job
- Wishlist + outbid notifications
- **Wanted-match alerts** — when a live listing matches a Wanted post
  (club + size + era), notify the Wanted author and badge the listing
- Presence ("X watching")

**M4 — Payments + orders + pseudo-wallet (week 5)**
- Stripe Connect Express onboarding
- **Saved payment methods** (Setup Intents) + fast checkout + auction-win
  auto-charge
- Checkout (auction win + buy-now) with Vipps + Klarna + cards
- Buying (**My Bids**) + Purchases (**To pay / Ongoing / Completed**)
- Selling dashboard + **Wallet** view (Stripe Connect balance)
- Shipping tracking input (manual carrier + tracking_no)
- Email notifications (Resend)
- Refund flow in admin

**M5 — Community + credits (week 6)**
- Feed (activity ranking, follows, comments, reactions)
- DMs (Soketi-powered, typing indicators)
- **Ask-a-question** threads on listings (DM-backed with `kind=qa`)
- Reviews after completed orders
- Reports / moderation tools + **authenticity queue** for suspected-fakes
- **Oase Credits** — store-credit ledger, earn + spend on-site

**M6 — Polish + launch (week 7)**
- Bilingual NB / EN
- Performance pass (image budget, RSC streaming, edge caching)
- Sentry + PostHog wired
- Beta with a slice of the community → iterate

**Later (post-launch):**
- **Negotiate / offers** — buyer offer + seller counter flow on
  buy-now (and on auctions before the first bid). Own milestone — it's
  a whole sub-state-machine that touches listing status, checkout, and
  expiry timers
- **Full top-up wallet** — revisit via Swan.io BaaS if users ask. Needs
  KYC/AML, fund segregation
- Posten / Bring label API integration
- Meilisearch migration once filters get heavy
- Mobile push notifications (web push first, native app later)
- **Stripe Connect V2 migration** — we're on V1 (`accounts.create({type:'express'})`
  + snapshot webhooks + custom checkout UI). Migrate to V2 (`v2.core.accounts`
  + thin events + hosted Checkout Sessions) before going live in production.
  Not urgent — V1 has a long runway — but cleaner long-term.

---

## 9. Decisions locked in

- **Name:** Oase
- **Domain:** `oase.ai` (currently a Webflow static page — we'll swap DNS when
  Railway deploy is ready)
- **Legal:** Operated by our AS. The AS is **platform operator and merchant
  of record** for all transactions.
- **Launch market:** Norway first. Rapid EU expansion right after.
- **Auth:**
  - Buyers / bidders: Better Auth email + password with verified email
  - Sellers: Vipps Login (Norway identity check via BankID). Equivalent
    identity providers added per EU market at expansion
- **Payments:** Stripe Connect (Express) — Vipps MobilePay, Klarna, cards
- **Commission:** **8% total, inclusive of Stripe fees.** Seller always gets 92%.
  Commission-only for now. **Subscriptions and ads are a later revenue lever**,
  not in v1.
- **KYC:** Required for any sale (no threshold) — Stripe Express does the KYC,
  Vipps confirms identity at sign-in
- **Minimum age:** 13
- **Locker visibility default:** public
- **Shipping v1:** **buyer pays**, added at checkout. Seller pastes tracking
  number + carrier. Posten / Bring label API integration is a later milestone
- **Navigation:** sidebar on desktop, slide-in drawer on mobile. **No bottom nav.**
  Persistent top bar with heart / bell / messages / avatar across breakpoints.
  Two primary CTAs: **Create listing** and **Create wanted**
- **Wanted** is a first-class feature, distinct from Wishlist — reverse
  marketplace, public, with matching-listing alerts
- **Discover** has its own Collections surface + Wanted surface
- **Verified Collector** badge, flipped by admin
- **Language + currency** switch in settings (NOK default)
- **Payments:** fast-checkout via saved Stripe PMs + auction-win
  auto-charge. Pseudo-wallet on Selling surfaces Stripe Connect balance.
  Oase Credits (M5) are store-credit, non-withdrawable by default
- **Negotiate / offers** — deferred post-launch
- **Admin review:** two-click approve/reject with scrollable image viewer
  and canned rejection reasons + free-text. Separate **authenticity
  queue** fed by "Suspected fake?" reports
- **Real-time:** Soketi from day one
- **Images:** Cloudflare R2 + CF Image Resizing
- **Hosting:** everything on Railway
- **Repo:** `jersey-marketplace/` folder in this repo

## 10. Still open (can resolve as we go)

- Brand palette + logo direction (placeholder: warm sand + deep teal)
- Display font choice for hero / editorial moments
- Minimum account age (in days since signup) before a user can list for sale,
  as an anti-fraud signal — separate from the age-13 minimum
- Which EU identity providers to onboard first at expansion (iDIN NL,
  BankID SE, FranceConnect, itsme BE are candidates)
- **Verified Collector criteria** — draft proposal: ≥ 10 completed sales
  with ≥ 4.8 rating, identity verified via Vipps, no open reports in 90
  days. Admin flips manually until we automate
- **Ask-a-question UX** — default is private DM-backed threads pinned to
  the listing (Depop-style). Revisit if users want public Q&A (Vinted-style)
- **Auto-translation provider** — Claude API (likely) or OpenAI. Pick
  the one with the better price/latency on short bursts; both work.
  Decided: Claude (we have the SDK + same vendor as the build assistant)
- **Currencies at launch** — v1 displays NOK everywhere. Currency switch
  UI ships but only NOK is active until EU expansion flips on EUR + SEK + DKK

---

## 11. Build order

The M0 + M1 slice first: a deployable Oase shell on Railway with Better
Auth (email for buyers, Vipps for sellers), profile, settings, locker
upload, and the sidebar + mobile drawer navigation working end to end.
Real DB, real auth, real image upload — no mocks — so we have a
foundation to layer auctions onto without rework.

See [`OUTSTANDING_SETUP.md`](./OUTSTANDING_SETUP.md) for the list of
third-party accounts / keys / actions you need to complete before the
scaffold can actually boot against live services.
