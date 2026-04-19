import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { randomUUID, randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jersey, jerseyImage, listing, sellerProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { r2 } from "@/lib/storage";
import { env } from "@/lib/env";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { inngest } from "@/lib/inngest";
import { detectAndTranslate } from "@/lib/translate";

function newPublicId() {
  // 8-char uppercase alphanumeric, e.g. "7F215554"
  return randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const destination = String(form.get("destination") ?? "locker");
  const title = String(form.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });

  // Sale listings require a verified seller (Vipps) + a Stripe account
  if (destination !== "locker") {
    const [sp] = await db
      .select()
      .from(sellerProfile)
      .where(eq(sellerProfile.userId, session.user.id));
    if (!sp?.vippsSub) {
      return NextResponse.json(
        { error: "Verify your identity with Vipps before you can list for sale." },
        { status: 403 },
      );
    }
  }

  const [j] = await db
    .insert(jersey)
    .values({
      ownerId: session.user.id,
      title,
      club: (form.get("club") as string) || null,
      season: (form.get("season") as string) || null,
      player: (form.get("player") as string) || null,
      size: (form.get("size") as string) || null,
      condition: (form.get("condition") as string) || null,
      description: (form.get("description") as string) || null,
      status: destination === "locker" ? "locker" : "pending",
    })
    .returning();

  // Upload images
  const images = form.getAll("images").filter((f): f is File => f instanceof File);
  if (r2 && env.R2_BUCKET) {
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const buf = Buffer.from(await file.arrayBuffer());
      const key = `jerseys/${j.id}/${randomUUID()}-${file.name}`;
      await r2.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: key,
          Body: buf,
          ContentType: file.type,
        }),
      );
      await db.insert(jerseyImage).values({ jerseyId: j.id, storageKey: key, order: i });
    }
  }

  // If this is a sale listing, create a pending_review listing row
  if (destination === "auction" || destination === "fixed") {
    const startPrice = numKr(form.get("startPrice"));
    const reservePrice = numKr(form.get("reservePrice"));
    const buyNowPrice = numKr(form.get("buyNowPrice"));
    const durationHours = Number(form.get("durationHours") ?? 72);

    const translation = j.description ? await detectAndTranslate(j.description) : null;

    const [l] = await db
      .insert(listing)
      .values({
        publicId: newPublicId(),
        jerseyId: j.id,
        sellerId: session.user.id,
        type: destination,
        status: "pending_review",
        startPrice,
        reservePrice,
        buyNowPrice,
        currentPrice: destination === "auction" ? startPrice : buyNowPrice,
        endAt:
          destination === "auction"
            ? new Date(Date.now() + durationHours * 3600 * 1000)
            : null,
        submittedAt: new Date(),
        sourceLanguage: translation?.sourceLanguage ?? null,
        descriptionTranslations: translation?.translations ?? null,
      })
      .returning();

    await inngest.send({ name: "listing/submitted", data: { listingId: l.id } });
  }

  return NextResponse.json({ id: j.id });
}

function numKr(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.round(n * 100);
}
