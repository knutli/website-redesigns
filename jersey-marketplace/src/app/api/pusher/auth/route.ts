import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

export async function POST(req: Request) {
  if (!pusher) return NextResponse.json({ error: "Realtime not configured" }, { status: 501 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const socketId = String(form.get("socket_id"));
  const channel = String(form.get("channel_name"));

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
