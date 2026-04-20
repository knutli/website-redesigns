import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pusher } from "@/lib/pusher";
import { db } from "@/lib/db";
import { threadParticipant } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: Request) {
  if (!pusher) return NextResponse.json({ error: "Realtime not configured" }, { status: 501 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const socketId = String(form.get("socket_id"));
  const channel = String(form.get("channel_name"));

  // ACL: check channel permissions
  if (channel.startsWith("private-admin")) {
    const admin = await requireAdmin(session);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (channel.startsWith("private-dm-")) {
    const threadId = channel.replace("private-dm-", "");
    const [participant] = await db
      .select()
      .from(threadParticipant)
      .where(
        and(eq(threadParticipant.threadId, threadId), eq(threadParticipant.userId, session.user.id)),
      );
    if (!participant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // presence-listing-* channels: any authenticated user can join (they're viewing the auction)
  // private-user-* channels: only the owner
  if (channel.startsWith("private-user-")) {
    const userId = channel.replace("private-user-", "");
    if (userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (channel.startsWith("presence-")) {
    const authResponse = pusher.authorizeChannel(socketId, channel, {
      user_id: session.user.id,
      user_info: { name: session.user.name ?? "Anonymous" },
    });
    return NextResponse.json(authResponse);
  }

  const authResponse = pusher.authorizeChannel(socketId, channel);
  return NextResponse.json(authResponse);
}
