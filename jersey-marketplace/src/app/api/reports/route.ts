import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    targetType: string;
    targetId: string;
    kind?: "generic" | "fake";
    reason: string;
    details?: string;
  };

  if (!body.targetType || !body.targetId || !body.reason) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await db.insert(report).values({
    reporterId: session.user.id,
    targetType: body.targetType,
    targetId: body.targetId,
    kind: body.kind ?? "generic",
    reason: body.reason.slice(0, 200),
    details: body.details ?? null,
  });

  return NextResponse.json({ ok: true });
}
