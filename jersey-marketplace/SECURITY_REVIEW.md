# Security review — Oase scaffold

**Date:** 2026-04-20
**Scope:** All code on branch `claude/review-plan-file-CmiuY` vs `origin/main`
**Reviewer:** Red-team pass (automated)
**Status:** Pre-deploy. No code changes made — findings only.

---

## Critical

### 1. Open redirect via Vipps `next` cookie
**Files:** `src/app/api/auth/vipps/start/route.ts`, `src/app/api/auth/callback/vipps/route.ts`

`/api/auth/vipps/start` accepts `?next=…` (unvalidated), stashes it in a cookie, and the callback does `NextResponse.redirect(new URL(next, req.url))`. Setting `next=//evil.com/confirm` sends the authenticated user to `https://evil.com/confirm` after legitimate Vipps auth. Prime phishing vector.

**Fix:** Whitelist `next` to same-origin relative paths only (`/^\//` and not `//`).

### 2. Open redirect via signin `?next=`
**File:** `src/app/signin/sign-in-form.tsx:38`

`router.push(next)` with the raw query param. Same pattern as above — attacker crafts `/signin?next=https://evil.com/oase.ai/confirm`.

**Fix:** Same — validate `next` starts with `/` and doesn't start with `//`.

### 3. Pusher/Soketi channel authz is wide open
**File:** `src/app/api/pusher/auth/route.ts`

Authorizes *any* authenticated user onto *any* `private-*` or `presence-*` channel. That includes other users' DMs, admin broadcast, or any auction channel. No per-channel ACL.

**Fix:** Parse the channel name and enforce ownership/membership. E.g. `presence-listing-{id}` → any signed-in user OK; `private-dm-{threadId}` → only thread participants; `private-admin-*` → admin only.

### 4. Bid endpoint: TOCTOU race + no rate limit + weak input validation
**File:** `src/app/api/bids/route.ts`

- Reads `currentPrice`, validates, inserts bid, updates listing in four non-transactional statements. Concurrent bidders both pass validation → last-writer-wins.
- No rate limit (plan said Redis token-bucket — never implemented).
- `amount` goes through `Math.round` with no type check. `NaN`, `Infinity`, negative floats pass some checks.
- `maxAmount` is unbounded.

**Fix:** Wrap in a DB transaction with `SELECT ... FOR UPDATE` on the listing row. Add Zod validation on request body. Add Redis rate-limit (token bucket per user per listing).

### 5. Unvalidated file uploads
**Files:** `src/app/api/jerseys/route.ts`, `src/app/api/wanted/route.ts`

- `file.name` flows into R2 object key → path traversal via `../`
- `ContentType: file.type` is attacker-supplied → can host `text/html`, `image/svg+xml` (SVG XSS), binaries on CDN
- No MIME whitelist, no per-file size cap, no count cap → `arrayBuffer()` on a 2 GB upload = memory DoS

**Fix:** Sanitize `file.name` (strip path segments, limit length), whitelist content types to `image/jpeg`, `image/png`, `image/webp`, `image/avif`, cap file size (e.g. 10 MB), cap count (e.g. 12 images).

---

## High

### 6. No rate limiting anywhere
**All API routes**

`REDIS_URL` is a required env var but no Redis client is instantiated. Plan's "Redis token bucket" is unimplemented. All endpoints unprotected: `/api/bids`, `/api/reports`, `/api/auth/*`, `/api/jerseys`, `/api/wanted`, `/api/pusher/auth`.

**Fix:** Create a `src/lib/rate-limit.ts` using Redis (ioredis or `@upstash/ratelimit`). Apply to auth, bids, reports, uploads, pusher auth.

### 7. HTML injection in outbound emails
**File:** `src/lib/email.ts`

Interpolates seller-controlled `title` and `url` into HTML templates without escaping. When we later email *buyers* with a seller-set title ("You won X"), a malicious seller plants HTML in that buyer's inbox.

**Fix:** HTML-escape all interpolated values, or switch to React Email (already in `package.json`) for type-safe templates.

### 8. Listing / Wanted detail pages don't filter by `status`
**Files:** `src/app/l/[id]/page.tsx`, `src/app/wanted/[id]/page.tsx`

Returns rows in any status — `pending_review`, `rejected`, `draft`. Anyone with a UUID views them and bumps the view counter.

**Fix:** Add `listing.status = 'live'` filter for public views (or allow `sold`/`ended` for historical browsing but not `draft`/`pending_review`/`rejected`). Let the owner and admins bypass the filter.

### 9. Age-13 compliance gap
**File:** `src/app/signin/sign-in-form.tsx`

Captures `birthDate`, checks age client-side, then **never sends it to the signup endpoint**. We don't store birth date, don't enforce age server-side. Trivially bypassed by calling `signUp.email()` directly.

**Fix:** Send `birthDate` to a custom signup endpoint that validates server-side and stores it on the user row. Alternatively, use Better Auth's `additionalFields` to capture and validate at registration time.

---

## Medium

### 10. Auction finalisation not transactional
**File:** `src/inngest/functions.ts`

Inserts the order and updates the listing in two separate statements. Crash between them = listing stuck in `live` with an orphan `awaiting_payment` order. No idempotency key on order insert if Inngest retries.

**Fix:** Wrap in `db.transaction()`. Use listing ID as an idempotency key (check for existing order before inserting).

### 11. Stripe webhook handlers don't gate by current status
**File:** `src/app/api/webhooks/stripe/route.ts`

`payment_intent.succeeded` unconditionally sets `paid`, even on an order that's already `shipped` or `refunded`. Webhook replays rewind state.

**Fix:** Gate each status change: only transition `awaiting_payment → paid`, `paid → refunded`, etc.

### 12. View-count spammable
**File:** `src/app/l/[id]/page.tsx`

Every request increments count. No dedup, no session/IP throttle. Seller reloads 10k times → artificially popular listing.

**Fix:** Dedup by session cookie or IP hash, or move to a separate analytics system (PostHog already planned).

### 13. Vipps OIDC hygiene
**File:** `src/lib/auth.ts`

No PKCE, no nonce, `id_token` never verified (we trust userinfo over HTTPS). Vipps sub not bound to session at authorize time.

**Fix:** Add PKCE (`code_challenge` + `code_verifier`) to the authorize/token flow. Verify `id_token` signature (Vipps publishes JWKS). Add a nonce.

### 14. No HTTP security headers
**File:** `next.config.ts` / `src/middleware.ts`

No CSP, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Plan lists these — not wired.

**Fix:** Add headers in `next.config.ts` or via middleware. Minimum: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

### 15. Shallow API input validation
**Files:** Various API routes

- `/api/reports`: no length cap on `details`, no enum check on `targetType`
- `/api/wanted`: `maxPrice` accepts `NaN`
- `/api/jerseys`: `destination` is a free-form string, field lengths uncapped

**Fix:** Add Zod schemas to all API request parsing. Validate enums, cap string lengths, reject non-finite numbers.

### 16. Prompt injection in translate.ts
**File:** `src/lib/translate.ts`

Seller description goes directly into the user turn. A crafted prompt can make Claude embed attacker text in the translations object. We render as text (not XSS), but phishing text lands on the listing under our "Auto-translated" disclaimer.

**Fix:** Validate that the returned `translations` object has only expected keys (`nb`, `en`, `sv`, `da`) and reasonable lengths. Consider stripping URLs / links from translated output. Add a system-level instruction to refuse injection attempts.

---

## Low

### 17. `publicId` is 32 bits
**File:** `src/app/api/jerseys/route.ts`

`randomBytes(4).toString("hex")` = 8 hex chars. Birthday collision at ~65k listings. Unique constraint throws; no retry loop.

**Fix:** Widen to 5–6 bytes or add retry-on-conflict logic.

### 18. Profile page `SELECT *`
**File:** `src/app/u/[handle]/page.tsx`

Selects the whole user row (email, birthDate, etc.). Not a leak today (server component only), but a one-line future change exposing `u` to a client component makes it one.

**Fix:** Select only the rendered fields.

### 19. `useSecureCookies` is production-only
**File:** `src/lib/auth.ts`

In any non-production env running over HTTPS (staging), cookies lose the Secure flag.

**Fix:** Key off presence of HTTPS in `BETTER_AUTH_URL`, not `NODE_ENV`.

### 20. Notifications route renders raw JSON
**File:** `src/app/notifications/page.tsx`

Renders `JSON.stringify(n.payload)` in `<pre>`. Fine for now; when we accept user-authored payload fields, whitelist what we display.

---

## What's correctly set up

- **Drizzle ORM everywhere** → SQL injection surface minimal
- **Stripe webhook signature verified** (`constructEvent` with signing secret)
- **Admin check centralised** (`admin-guard.ts`, used in approve + reject routes)
- **No `dangerouslySetInnerHTML`** — React auto-escapes in all pages
- **Email verification enforced server-side** before bidding (`/api/bids` checks `emailVerified`)
- **`.env.local` not committed**, secrets not in client bundles (confirmed: only `NEXT_PUBLIC_*` vars used client-side)
- **Better Auth + Argon2id** password hashing (Better Auth default)
- **Middleware gates protected routes** with session cookie check
- **Vipps state cookie** is `httpOnly`, `Secure`, `SameSite=Lax` with 10-min expiry

---

## Suggested fix priority

| Priority | Items | Effort |
|----------|-------|--------|
| **Before any preview URL** | #1 #2 open redirects, #3 channel authz, #5 upload validation | ~2h |
| **Before beta users** | #4 bid race/rate-limit, #6 rate limiting, #7 email escaping, #8 status filter, #9 age compliance, #14 security headers | ~4h |
| **Before launch** | #10 auction tx, #11 webhook state gates, #13 Vipps OIDC, #15 input validation, #16 translation validation, #17 publicId width | ~3h |
| **Housekeeping** | #12 #18 #19 #20 | ~1h |
