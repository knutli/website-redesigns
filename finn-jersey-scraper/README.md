# finn-jersey-scraper

Crawl all jersey listings from a single Finn.no seller, extract structured fields with Claude, and download images locally.

## What it does

Given any Finn.no URL — either a seller profile (`https://www.finn.no/profile/ads/<id>`) or any single listing from that seller — it:

1. Resolves the seller's profile.
2. Enumerates every listing they have up.
3. Fetches each listing and pulls out the raw fields (title, description, price, Finn condition, posted date, location, image URLs).
4. Sends the title + description to Claude Haiku 4.5 for structured extraction (player, season `1996/97`, team, league, size `S/M/L`, type `home/away/...`, normalised condition, plus per-field confidence).
5. Downloads every image to `output/<sellerId>/<finnkode>/images/`.
6. Writes one `listing.json` per ad and a top-level `index.json` covering the whole seller.

## Setup

```bash
cd finn-jersey-scraper
pnpm install        # or npm install
cp .env.example .env
# put your ANTHROPIC_API_KEY in .env
```

## Run

```bash
# from a profile
pnpm scrape https://www.finn.no/profile/ads/1234567

# or from any single listing — we'll find the seller automatically
pnpm scrape https://www.finn.no/recommerce/forsale/item/123456789

# trial run, no images, no Claude calls
pnpm scrape <url> --limit 5 --no-images --no-extract
```

Output lands in `./output/<sellerId>/`:

```
output/
  1234567/
    index.json                      # everything in one file, easy to import
    412345678/
      listing.json
      images/
        01.jpg
        02.jpg
    412345679/
      ...
```

## Cost

About **$0.0015 per listing** on Claude Haiku 4.5 (system prompt is cached). Roughly **$0.75 per 500 listings**. Override with `CLAUDE_MODEL=claude-sonnet-4-6` if Haiku misses too many fields.

## Field mapping to your DB

The scraper produces human-readable values, not your DB's IDs. Mapping (do this on the import side):

| Your DB field | Scraper output |
|---|---|
| `description` | `description` (raw Finn text) |
| `playerId` | look up by `extracted.player` |
| `seasonId` | `extracted.season` (already `YYYY/YY`) |
| `leagueId` | look up by `extracted.league` |
| `teamId` | look up by `extracted.team` |
| `userId` | not in scrape — set per import run |
| `Size` | `extracted.size` (`S`/`M`/`L`/...) |
| `Condition` | `extracted.condition`, with `finnCondition` as fallback |
| `Images` | `images[].localPath` |
| `Type` | `extracted.type` (`home`/`away`/`third`/`goalkeeper`/`training`/`other`) |

Plus extras Finn surfaces: `priceNok`, `finnCondition`, `postedAt`, `location`, `seller` block.

## Confidence + manual review

Every extracted listing carries a `confidence` block. Listings with any `low` are reported at the end of a run — handle those manually before importing.

## Politeness

Default 1.5s between Finn requests. Configure with `REQUEST_DELAY_MS=2500` in `.env` if you'd prefer slower.
