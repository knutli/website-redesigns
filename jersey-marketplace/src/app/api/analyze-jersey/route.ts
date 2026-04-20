import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";

export type JerseyAnalysis = {
  title: string | null;
  club: string | null;
  season: string | null;
  player: string | null;
  size: string | null;
  condition: number | null;
  kitType: string | null;
  brand: string | null;
  description: string | null;
};

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI not configured" }, { status: 501 });
  }

  const form = await req.formData();
  const images = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (images.length === 0) {
    return NextResponse.json({ error: "At least one image required" }, { status: 400 });
  }

  const imageContent = await Promise.all(
    images.slice(0, 4).map(async (file) => {
      const buf = Buffer.from(await file.arrayBuffer());
      const base64 = buf.toString("base64");
      const mediaType = file.type === "image/png" ? "image/png"
        : file.type === "image/webp" ? "image/webp"
        : "image/jpeg";
      return {
        type: "image" as const,
        source: { type: "base64" as const, media_type: mediaType, data: base64 },
      };
    }),
  );

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [
            ...imageContent,
            {
              type: "text",
              text: `Analyze this football/soccer jersey. Return ONLY a JSON object with these fields (use null if uncertain):

{
  "title": "short display title, e.g. Manchester United Home '99",
  "club": "team/club name",
  "season": "season like 1998/99 or 2023/24",
  "player": "player name and number if visible, e.g. Beckham #7",
  "size": "size if visible on label (S/M/L/XL/XXL)",
  "condition": condition rating 1-10 integer (10=brand new with tags, 9=brand new no tags, 8=very good, 7=good, 6=ok, 5=usable, 4=poor, 3=very poor, 2=patchwork, 1=barely a jersey),
  "kitType": "Home" or "Away" or "Third" or "Training" or null,
  "brand": "manufacturer e.g. Nike, adidas, Puma",
  "description": "brief 1-2 sentence description of the jersey, noting any notable features, defects, or details visible"
}

JSON only, no markdown, no explanation.`,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI analysis failed" }, { status: 502 });
  }

  const data = (await res.json()) as { content?: { text?: string }[] };
  const raw = data.content?.[0]?.text?.trim();
  if (!raw) {
    return NextResponse.json({ error: "No analysis returned" }, { status: 502 });
  }

  try {
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned) as JerseyAnalysis;
    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 502 });
  }
}
