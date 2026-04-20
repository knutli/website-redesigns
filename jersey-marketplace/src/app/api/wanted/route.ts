import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wanted, wantedImage } from "@/lib/db/schema";
import { r2 } from "@/lib/storage";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.redirect(new URL("/signin?next=/wanted/new", req.url));

  const form = await req.formData();
  const title = String(form.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  const maxPrice = form.get("maxPrice");
  const [w] = await db
    .insert(wanted)
    .values({
      userId: session.user.id,
      title,
      club: (form.get("club") as string) || null,
      season: (form.get("season") as string) || null,
      sizePref: (form.get("sizePref") as string) || null,
      player: (form.get("player") as string) || null,
      description: (form.get("description") as string) || null,
      maxPriceMinor: maxPrice ? Math.round(Number(maxPrice) * 100) : null,
    })
    .returning();

  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (r2 && env.R2_BUCKET && files.length) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const buf = Buffer.from(await file.arrayBuffer());
      const key = `wanted/${w.id}/${randomUUID()}-${file.name}`;
      await r2.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: key,
          Body: buf,
          ContentType: file.type,
        }),
      );
      await db.insert(wantedImage).values({ wantedId: w.id, storageKey: key, order: i });
    }
  }

  return NextResponse.json({ id: w.id });
}
