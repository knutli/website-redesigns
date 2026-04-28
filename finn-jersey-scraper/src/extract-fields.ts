import Anthropic from "@anthropic-ai/sdk";
import type { ExtractedFields, RawListing } from "./types.js";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-haiku-4-5";

const SYSTEM_PROMPT = `You extract structured fields from Norwegian-language football/sports jersey listings on Finn.no.

Return ONLY a JSON object matching this exact shape (no prose, no code fences):
{
  "player": string | null,        // Full name "Fornavn Etternavn" if a specific player name or nameset is mentioned, else null. Do NOT invent a name from a kit number alone.
  "season": string | null,        // Season normalised as "YYYY/YY" (e.g. "1996/97", "2003/04"). Single-year kits use "YYYY" (e.g. "2018"). null if unknown.
  "team": string | null,          // Club or national team name as commonly written in English or the team's own branding (e.g. "Manchester United", "Rosenborg", "Norway").
  "league": string | null,        // League the team plays in at the time of the kit, e.g. "Premier League", "Eliteserien", "La Liga", "International". null if uncertain.
  "size": "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | null,
  "type": "home" | "away" | "third" | "goalkeeper" | "training" | "other" | null,
  "condition": string | null,     // Short normalised description of wear, e.g. "Ny med tags", "Brukt - god stand", "Slitt".
  "confidence": {
    "player": "high" | "medium" | "low",
    "season": "high" | "medium" | "low",
    "team": "high" | "medium" | "low",
    "league": "high" | "medium" | "low",
    "size": "high" | "medium" | "low",
    "type": "high" | "medium" | "low"
  },
  "notes": string | null          // Free-text caveats: ambiguous size, alt season interpretation, etc. Keep brief or null.
}

Rules:
- Norwegian "hjemmedrakt" = home, "bortedrakt" = away, "tredjedrakt" = third, "keeperdrakt" = goalkeeper, "treningsdrakt" = training.
- Sizes: "Medium"/"M"/"str M" -> "M". Children's sizes (e.g. "152", "164") -> null with note.
- Season: "96/97", "1996-97", "sesong 1996/1997" all normalise to "1996/97".
- If only a year like "2003" appears AND it clearly refers to a kit, output "2003" (single-year). If the writer means 2003/04 (e.g. "season 2003"), prefer "2003/04" only when context confirms.
- Confidence "low" if you guessed; "high" only when the text states the value explicitly.
- Be conservative: prefer null + low confidence over hallucinating.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error("ANTHROPIC_API_KEY is not set in environment.");
    client = new Anthropic({ apiKey: key });
  }
  return client;
}

export async function extractFields(
  raw: Pick<RawListing, "title" | "description" | "finnCondition">,
): Promise<ExtractedFields> {
  const userText = [
    `TITLE: ${raw.title}`,
    raw.finnCondition ? `FINN_CONDITION_FIELD: ${raw.finnCondition}` : null,
    "",
    "DESCRIPTION:",
    raw.description || "(empty)",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userText }],
  });

  const textBlock = res.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text block");
  }
  return parseJsonStrict(textBlock.text);
}

function parseJsonStrict(text: string): ExtractedFields {
  // Strip ``` fences if the model added any despite the instruction.
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as ExtractedFields;
  return parsed;
}
