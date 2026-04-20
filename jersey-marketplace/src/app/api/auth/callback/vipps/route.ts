import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth, vippsExchangeCode, vippsUserInfo } from "@/lib/auth";
import { db } from "@/lib/db";
import { sellerProfile, user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { safeRedirect } from "@/lib/safe-redirect";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("vipps_state")?.value;
  const next = safeRedirect(jar.get("vipps_next")?.value, "/selling");
  if (!code || !state || !expected || state !== expected) {
    return NextResponse.redirect(new URL("/signin?error=vipps_state", req.url));
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.redirect(new URL("/signin?next=/selling", req.url));

  const token = await vippsExchangeCode(code);
  const info = await vippsUserInfo(token.access_token);

  await db
    .insert(sellerProfile)
    .values({
      userId: session.user.id,
      vippsSub: info.sub,
      vippsPhone: info.phone_number,
      vippsName: info.name,
    })
    .onConflictDoUpdate({
      target: sellerProfile.userId,
      set: {
        vippsSub: info.sub,
        vippsPhone: info.phone_number,
        vippsName: info.name,
        updatedAt: new Date(),
      },
    });

  await db
    .update(userTable)
    .set({
      vippsVerifiedAt: new Date(),
      primaryAuthProvider: "vipps",
    })
    .where(eq(userTable.id, session.user.id));

  const res = NextResponse.redirect(new URL(next, req.url));
  res.cookies.delete("vipps_state");
  res.cookies.delete("vipps_next");
  return res;
}
