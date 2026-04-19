# Outstanding setup — third-party accounts & actions

The scaffold is wired up for every service in the stack, but the runtime
won't actually talk to any of them until you do the things on this list.
Each entry tells you **(a) what to create / connect** and **(b) which env
vars to paste the resulting secrets into** (see `.env.example`).

When you finish an item, tick it off. Everything here is a one-time setup
except where marked.

---

## Blocking for local dev (you can't boot without these)

### 1. Railway project (app + Postgres + Redis)
- [ ] Create a Railway project: `oase`
- [ ] Add a **Postgres** plugin → copy the `DATABASE_URL` into `.env.local`
- [ ] Add a **Redis** plugin → copy the `REDIS_URL` into `.env.local`
- [ ] (Later) Add a service for this repo's `jersey-marketplace/` folder
      with the build/start commands from `railway.json`

### 2. Better Auth secret
- [ ] Generate a 32-byte random secret:
      `openssl rand -base64 32`
- [ ] Paste into `BETTER_AUTH_SECRET` in `.env.local`

---

## Blocking for seller sign-in (Vipps Login)

### 3. Vipps Login (identity-assured sign-in for sellers)
- [ ] Sign the AS up at <https://portal.vipps.no>
- [ ] Submit KYC for Vipps Login API access (takes a few days; expect to
      attach company registration + signatory ID)
- [ ] Create a **Vipps Login** sales unit. Set redirect URI to
      `https://oase.ai/api/auth/callback/vipps` (and a local one:
      `http://localhost:3000/api/auth/callback/vipps`)
- [ ] Copy Client ID / Client Secret / Subscription Key into:
      - `VIPPS_CLIENT_ID`
      - `VIPPS_CLIENT_SECRET`
      - `VIPPS_SUBSCRIPTION_KEY`
      - `VIPPS_ENV` (`test` or `prod`)

---

## Blocking for payments (Stripe Connect)

### 4. Stripe account for the platform (AS)
- [ ] Create a Stripe account under the AS's legal name + org number
- [ ] Complete Stripe's platform application (needed to use **Connect**)
- [ ] In Stripe Dashboard → Connect → Settings:
      - Enable **Express** accounts
      - Set platform branding (name "Oase", logo, support email)
      - Set the default payout country to **Norway**, currency **NOK**
- [ ] Activate payment methods: **Cards, Vipps MobilePay, Klarna**
- [ ] Copy keys into `.env.local`:
      - `STRIPE_SECRET_KEY` (restricted key scoped to Connect is fine later)
      - `STRIPE_PUBLISHABLE_KEY`
      - `STRIPE_WEBHOOK_SECRET` (created when you add the webhook in step 5)

### 5. Stripe webhook
- [ ] In Stripe Dashboard → Developers → Webhooks, add endpoint
      `https://oase.ai/api/webhooks/stripe` (or your Railway URL) and
      subscribe at least to:
      - `payment_intent.succeeded`
      - `payment_intent.payment_failed`
      - `account.updated` (Connect onboarding state)
      - `charge.refunded`
- [ ] Copy the signing secret into `STRIPE_WEBHOOK_SECRET`

---

## Blocking for image uploads

### 6. Cloudflare R2 + Image Resizing
- [ ] Create a Cloudflare account (use the AS's email)
- [ ] R2 → Create bucket: `oase-jersey-images`
- [ ] R2 → Manage R2 API Tokens → create a token with read/write on that bucket
- [ ] Copy into `.env.local`:
      - `R2_ACCOUNT_ID`
      - `R2_ACCESS_KEY_ID`
      - `R2_SECRET_ACCESS_KEY`
      - `R2_BUCKET=oase-jersey-images`
      - `R2_PUBLIC_URL` (the bucket's public URL or your custom domain)
- [ ] Enable **Cloudflare Image Resizing** on the zone that serves `R2_PUBLIC_URL`
      (Speed → Optimization → Image Resizing → On)

---

## Blocking for real-time auctions

### 7. Soketi (self-hosted, Pusher-compatible)
- [ ] On Railway, add a new service from the public `quay.io/soketi/soketi:1.6-16-alpine`
      image (or use their one-click template)
- [ ] Set env vars on the Soketi service:
      - `SOKETI_DEFAULT_APP_ID=oase`
      - `SOKETI_DEFAULT_APP_KEY=<random>`
      - `SOKETI_DEFAULT_APP_SECRET=<random>`
- [ ] Copy the same values into our app's `.env.local`:
      - `SOKETI_APP_ID`, `SOKETI_APP_KEY`, `SOKETI_APP_SECRET`
      - `SOKETI_HOST` (the Railway service's public hostname)
      - `SOKETI_PORT=443`
      - `NEXT_PUBLIC_SOKETI_KEY` (same as `SOKETI_APP_KEY`)
      - `NEXT_PUBLIC_SOKETI_HOST`
      - `NEXT_PUBLIC_SOKETI_PORT=443`

---

## Blocking for background jobs

### 8. Inngest
- [ ] Sign up at <https://inngest.com> (use AS email)
- [ ] Create an app `oase`
- [ ] Copy into `.env.local`:
      - `INNGEST_EVENT_KEY`
      - `INNGEST_SIGNING_KEY`

---

## Blocking for transactional email

### 9. Resend + domain verification
- [ ] Sign up at <https://resend.com>
- [ ] Add domain `oase.ai`, add the DNS records it asks for (TXT + MX +
      CNAMEs) at your DNS provider
- [ ] Wait for verification
- [ ] Create an API key → paste into `RESEND_API_KEY`
- [ ] Set `EMAIL_FROM="Oase <no-reply@oase.ai>"` in `.env.local`

---

## Non-blocking but do before launch

### 10. Domain swap (oase.ai)
- [ ] Decide when to cut the Webflow page over. Railway will give you a
      `*.up.railway.app` subdomain you can test against until then.
- [ ] When ready: point `oase.ai` (A/AAAA or CNAME) at Railway, keep
      Webflow up at a `legacy.oase.ai` subdomain if you want the old page
      preserved.

### 11. Monitoring & analytics
- [ ] **Sentry** — create project, copy DSN into `SENTRY_DSN`
- [ ] **Axiom** — create dataset `oase-logs`, copy token into
      `AXIOM_TOKEN` and `AXIOM_DATASET`
- [ ] **PostHog** — create project, copy `NEXT_PUBLIC_POSTHOG_KEY` and
      `NEXT_PUBLIC_POSTHOG_HOST`

### 12. Legal pages
- [ ] Terms of service (NO + EN)
- [ ] Privacy policy (GDPR — the AS is data controller)
- [ ] Shipping & returns policy
- [ ] These are stubbed at `/legal/*` — replace the placeholder copy before launch

### 13. Logo + brand palette
- [ ] Replace the placeholder warm-sand / deep-teal palette in
      `tailwind.config.ts` once you've picked the final brand colours
- [ ] Drop a real logo at `public/logo.svg`

### 14. Admin bootstrap
- [ ] After your first sign-in on the deployed app, run the provided
      SQL (see `scripts/make-admin.sql`) to promote your user to `role = 'admin'`

---

## Recurring

- [ ] Stripe Connect: respond to any KYC document requests for yourself
      as platform owner
- [ ] Vipps: renew API subscription if Vipps prompts (annual)
- [ ] Monitor Resend deliverability, Sentry alerts, Railway usage

---

## What you do NOT need to do

The scaffold already handles these — they're mentioned for clarity:
- Wiring the env vars into the code (already done, see `src/lib/env.ts`)
- Setting up Drizzle, migrations, and the schema (see `src/lib/db/`)
- Building the sign-in, upload, admin, and payment flows
- Configuring Tailwind, shadcn, theme toggle, sidebar + mobile drawer
