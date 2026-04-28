import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchHtml } from "./fetch.js";
import {
  enumerateSellerListingUrls,
  resolveSellerProfileUrl,
} from "./enumerate-seller.js";
import { extractFields } from "./extract-fields.js";
import { downloadImages } from "./download-images.js";
import { parseListingPage } from "./parse-listing.js";
import type { ScrapedListing } from "./types.js";

export interface RunOptions {
  inputUrl: string;
  outputDir: string;
  skipImages: boolean;
  skipExtract: boolean;
  limit: number | null;
}

export async function run(opts: RunOptions): Promise<void> {
  const { profileUrl, finnUserId } = await resolveSellerProfileUrl(
    opts.inputUrl,
  );
  console.log(
    `Seller profile: ${profileUrl}${finnUserId ? ` (id ${finnUserId})` : ""}`,
  );

  const listingUrls = await enumerateSellerListingUrls(profileUrl);
  console.log(`Found ${listingUrls.length} listings.`);

  const sellerSlug = finnUserId ?? slugify(profileUrl);
  const sellerDir = join(opts.outputDir, sellerSlug);
  await mkdir(sellerDir, { recursive: true });

  const target = opts.limit
    ? listingUrls.slice(0, opts.limit)
    : listingUrls;

  // Sequential through fetchHtml's built-in throttle keeps us polite to Finn.
  // Image downloads run inside each listing in series for the same reason.
  const all: ScrapedListing[] = [];
  let idx = 0;
  for (const url of target) {
    idx += 1;
    console.log(`[${idx}/${target.length}] ${url}`);
    try {
      const scraped = await scrapeOne(url, sellerDir, opts);
      all.push(scraped);
      await writeFile(
        join(sellerDir, scraped.finnkode || `unknown-${idx}`, "listing.json"),
        JSON.stringify(scraped, null, 2),
        "utf8",
      );
    } catch (err) {
      console.warn(`  ! failed: ${(err as Error).message}`);
    }
  }

  // Index file with everything for easy import on the marketplace side.
  await writeFile(
    join(sellerDir, "index.json"),
    JSON.stringify(
      {
        sellerProfileUrl: profileUrl,
        finnUserId,
        scrapedAt: new Date().toISOString(),
        count: all.length,
        listings: all,
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `\nDone. Wrote ${all.length} listings to ${sellerDir}.`,
  );
  const lowConf = all.filter((l) =>
    Object.values(l.extracted.confidence ?? {}).some((c) => c === "low"),
  );
  if (lowConf.length) {
    console.log(
      `${lowConf.length} listing(s) have low-confidence fields — review before import.`,
    );
  }
}

async function scrapeOne(
  url: string,
  sellerDir: string,
  opts: RunOptions,
): Promise<ScrapedListing> {
  const html = await fetchHtml(url);
  const raw = parseListingPage(url, html);

  const listingDir = join(sellerDir, raw.finnkode || hash(url));
  await mkdir(listingDir, { recursive: true });

  const extracted = opts.skipExtract
    ? emptyExtraction()
    : await extractFields(raw);

  const images = opts.skipImages
    ? []
    : await downloadImages(raw.imageUrls, join(listingDir, "images"));

  return { ...raw, extracted, images };
}

function emptyExtraction() {
  return {
    player: null,
    season: null,
    team: null,
    league: null,
    size: null,
    type: null,
    condition: null,
    confidence: {
      player: "low",
      season: "low",
      team: "low",
      league: "low",
      size: "low",
      type: "low",
    },
    notes: "skipped",
  } as const;
}

function slugify(s: string): string {
  return s.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
