import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import * as schema from "@/lib/db/schema";

const vippsBase =
  env.VIPPS_ENV === "prod"
    ? "https://api.vipps.no/access-management-1.0/access"
    : "https://apitest.vipps.no/access-management-1.0/access";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  appName: "Oase",

  // Email + password for buyers / bidders. Email verification is required
  // before a user can place a bid or check out (enforced at the API layer).
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    autoSignIn: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    // The Resend wiring lives in src/lib/email.ts — swap this callback to use it
    // once RESEND_API_KEY is set.
    sendVerificationEmail: async ({ user: u, url }) => {
      const { sendVerificationEmail } = await import("@/lib/email");
      await sendVerificationEmail({ to: u.email, url });
    },
  },

  // Vipps OAuth — used for seller identity verification. We expose this as a
  // generic OIDC provider because Vipps Login is OIDC-compliant.
  socialProviders: {
    // Better Auth lets us add arbitrary OIDC providers via `genericOAuth`.
    // This is the Vipps Login shape. When VIPPS_CLIENT_ID is not set, the
    // signin page hides the "Sign in with Vipps" button.
  },
  plugins: [
    // Keeping the plugin list ready — we add TOTP for optional 2FA, the
    // admin plugin for role checks, and Inngest webhook triggers once the
    // corresponding env vars are live. See OUTSTANDING_SETUP.md.
  ],

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30d
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },

  advanced: {
    useSecureCookies: env.NODE_ENV === "production",
  },
});

/**
 * Vipps Login endpoints (exposed separately because Better Auth's generic
 * OAuth plugin API varies per version — we keep our own thin wrapper so the
 * signin page can redirect to Vipps, and the callback route below does the
 * code-for-token exchange and writes a `seller_profile` row).
 *
 * When VIPPS_CLIENT_ID is unset the helpers below throw; the sign-in UI
 * checks `isVippsConfigured()` first and hides the button.
 */
export function isVippsConfigured() {
  return Boolean(env.VIPPS_CLIENT_ID && env.VIPPS_CLIENT_SECRET && env.VIPPS_SUBSCRIPTION_KEY);
}

export function vippsAuthorizeUrl(state: string) {
  if (!isVippsConfigured()) throw new Error("Vipps is not configured");
  const params = new URLSearchParams({
    client_id: env.VIPPS_CLIENT_ID!,
    response_type: "code",
    scope: "openid name phoneNumber address email",
    redirect_uri: env.VIPPS_REDIRECT_URI!,
    state,
  });
  return `${vippsBase}/oauth2/auth?${params.toString()}`;
}

export async function vippsExchangeCode(code: string) {
  if (!isVippsConfigured()) throw new Error("Vipps is not configured");
  const res = await fetch(`${vippsBase}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY!,
      Authorization:
        "Basic " +
        Buffer.from(`${env.VIPPS_CLIENT_ID}:${env.VIPPS_CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.VIPPS_REDIRECT_URI!,
    }),
  });
  if (!res.ok) throw new Error(`Vipps token exchange failed: ${res.status}`);
  return (await res.json()) as {
    access_token: string;
    id_token: string;
    expires_in: number;
    token_type: string;
  };
}

export async function vippsUserInfo(accessToken: string) {
  if (!isVippsConfigured()) throw new Error("Vipps is not configured");
  const res = await fetch(`${vippsBase}/userinfo`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Ocp-Apim-Subscription-Key": env.VIPPS_SUBSCRIPTION_KEY!,
    },
  });
  if (!res.ok) throw new Error(`Vipps userinfo failed: ${res.status}`);
  return (await res.json()) as {
    sub: string;
    name?: string;
    phone_number?: string;
    email?: string;
    address?: { street_address?: string; postal_code?: string; region?: string; country?: string };
  };
}

export type Session = typeof auth.$Infer.Session;
