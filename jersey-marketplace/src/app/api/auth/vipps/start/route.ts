import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { isVippsConfigured, vippsAuthorizeUrl } from "@/lib/auth";

export async function GET(req: Request) {
  if (!isVippsConfigured()) {
    return NextResponse.json(
      { error: "Vipps Login is not configured — see OUTSTANDING_SETUP.md" },
      { status: 501 },
    );
  }
  const url = new URL(req.url);
  const next = url.searchParams.get("next") ?? "/selling";
  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(vippsAuthorizeUrl(state));
  res.cookies.set("vipps_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600 });
  res.cookies.set("vipps_next", next, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600 });
  return res;
}
