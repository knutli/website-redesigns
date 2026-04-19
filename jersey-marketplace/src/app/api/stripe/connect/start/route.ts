import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { createConnectedAccount, onboardingLink, stripe } from "@/lib/stripe";
import { env } from "@/lib/env";

export async function GET() {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured — see OUTSTANDING_SETUP.md" },
      { status: 501 },
    );
  }
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.redirect(`${env.NEXT_PUBLIC_APP_URL}/signin?next=/selling`);

  const [sp] = await db
    .select()
    .from(sellerProfile)
    .where(eq(sellerProfile.userId, session.user.id));
  if (!sp?.vippsSub) {
    return NextResponse.redirect(
      `${env.NEXT_PUBLIC_APP_URL}/api/auth/vipps/start?next=/selling`,
    );
  }

  let stripeAccountId = sp.stripeAccountId;
  if (!stripeAccountId) {
    const acct = await createConnectedAccount({ email: session.user.email, country: "NO" });
    stripeAccountId = acct.id;
    await db
      .update(sellerProfile)
      .set({ stripeAccountId, kycStatus: "pending" })
      .where(eq(sellerProfile.userId, session.user.id));
  }

  const link = await onboardingLink(stripeAccountId, `${env.NEXT_PUBLIC_APP_URL}/selling`);
  return NextResponse.redirect(link.url);
}
