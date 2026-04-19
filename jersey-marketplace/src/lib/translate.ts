import { env } from "@/lib/env";

/**
 * Translate a listing description into the target languages we care about.
 * Called once at listing save time, and again if the seller edits their
 * description. Result is cached on the listing row in
 * `description_translations` (jsonb: { lang -> text }).
 *
 * Returns null when no API key is configured — the scaffold falls back to
 * showing the source description untranslated.
 */

const TARGETS = ["nb", "en", "sv", "da"] as const;
export type TargetLanguage = (typeof TARGETS)[number];

export async function detectAndTranslate(text: string): Promise<{
  sourceLanguage: string;
  translations: Record<string, string>;
} | null> {
  if (!env.ANTHROPIC_API_KEY || !text.trim()) return null;

  const system = `You are a translator for a jersey collector marketplace called Oase. Translate listing descriptions faithfully and briefly. Preserve jersey-specific terminology (e.g. "player issue", "authenticity", season notation). Output strictly JSON with shape { "source": "<two-letter lang>", "translations": { "nb": "...", "en": "...", "sv": "...", "da": "..." } } and nothing else.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.TRANSLATION_MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: `Translate the following listing description.\n\n${text}` }],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { content?: { text?: string }[] };
  const raw = data.content?.[0]?.text?.trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      source: string;
      translations: Record<string, string>;
    };
    return { sourceLanguage: parsed.source, translations: parsed.translations };
  } catch {
    return null;
  }
}
