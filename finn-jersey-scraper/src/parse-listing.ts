import * as cheerio from "cheerio";
import type { RawListing, SellerRef } from "./types.js";

export function parseFinnkode(url: string): string | null {
  const m =
    url.match(/finnkode=(\d+)/i) ??
    url.match(/\/item\/(\d+)/) ??
    url.match(/\/(\d{8,12})(?:\?|$|\/)/);
  return m ? m[1]! : null;
}

function findJsonLd($: cheerio.CheerioAPI): unknown[] {
  const out: unknown[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const txt = $(el).contents().text();
    if (!txt) return;
    try {
      const data = JSON.parse(txt);
      if (Array.isArray(data)) out.push(...data);
      else out.push(data);
    } catch {
      // ignore malformed JSON-LD
    }
  });
  return out;
}

function findNextData($: cheerio.CheerioAPI): unknown {
  const txt = $("script#__NEXT_DATA__").contents().text();
  if (!txt) return null;
  try {
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

function deepFindFirst<T>(
  obj: unknown,
  predicate: (node: unknown) => node is T,
  maxDepth = 12,
): T | null {
  const seen = new WeakSet<object>();
  const stack: { node: unknown; depth: number }[] = [{ node: obj, depth: 0 }];
  while (stack.length) {
    const { node, depth } = stack.pop()!;
    if (predicate(node)) return node;
    if (depth >= maxDepth) continue;
    if (node && typeof node === "object") {
      if (seen.has(node as object)) continue;
      seen.add(node as object);
      for (const v of Object.values(node as Record<string, unknown>)) {
        stack.push({ node: v, depth: depth + 1 });
      }
    }
  }
  return null;
}

function isProduct(n: unknown): n is Record<string, unknown> {
  if (!n || typeof n !== "object") return false;
  const t = (n as Record<string, unknown>)["@type"];
  if (typeof t === "string") return t === "Product" || t === "Offer";
  if (Array.isArray(t)) return t.includes("Product");
  return false;
}

function pickPriceNok(jsonld: unknown[]): number | null {
  for (const node of jsonld) {
    const offer = deepFindFirst(node, (n): n is Record<string, unknown> => {
      if (!n || typeof n !== "object") return false;
      const t = (n as Record<string, unknown>)["@type"];
      return t === "Offer" || t === "AggregateOffer";
    });
    if (!offer) continue;
    const p = offer["price"] ?? offer["lowPrice"];
    if (p == null) continue;
    const num = typeof p === "string" ? Number(p) : (p as number);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function dedupe(arr: string[]): string[] {
  return Array.from(new Set(arr));
}

export function parseListingPage(url: string, html: string): RawListing {
  const $ = cheerio.load(html);
  const jsonld = findJsonLd($);
  const next = findNextData($);

  // Title
  const product = jsonld.find(isProduct) as Record<string, unknown> | undefined;
  const title =
    (product?.["name"] as string | undefined) ??
    $('meta[property="og:title"]').attr("content") ??
    $("h1").first().text().trim() ??
    "";

  // Description
  const description =
    (product?.["description"] as string | undefined) ??
    $('meta[property="og:description"]').attr("content") ??
    $('[data-testid="description"]').text().trim() ??
    $('section[aria-label*="eskriv"]').text().trim() ??
    "";

  // Price
  const priceNok = pickPriceNok(jsonld);

  // Images: prefer JSON-LD, fall back to og:image and gallery <img> tags.
  const ldImgs: string[] = [];
  if (product) {
    const img = product["image"];
    if (typeof img === "string") ldImgs.push(img);
    else if (Array.isArray(img))
      ldImgs.push(...img.filter((x): x is string => typeof x === "string"));
  }
  const ogImgs = $('meta[property="og:image"]')
    .map((_, el) => $(el).attr("content"))
    .get()
    .filter((x): x is string => typeof x === "string" && x.length > 0);
  const galleryImgs = $('img[src*="finncdn"], img[srcset*="finncdn"]')
    .map((_, el) => $(el).attr("src") ?? $(el).attr("srcset")?.split(" ")[0])
    .get()
    .filter((x): x is string => typeof x === "string" && x.length > 0);
  const imageUrls = dedupe([...ldImgs, ...ogImgs, ...galleryImgs])
    .map(normaliseFinnImage)
    .filter((u): u is string => !!u);

  // Seller (best-effort across surfaces).
  const seller = extractSeller($, next);

  // Finn condition + posted date + location: dt/dd pairs, defs, or labelled rows.
  const finnCondition = pickDefinitionValue($, [
    "tilstand",
    "condition",
  ]);
  const postedAt =
    pickDefinitionValue($, ["sist endret", "lagt til", "publisert"]) ?? null;
  const location =
    pickDefinitionValue($, ["sted", "område"]) ??
    $('[data-testid="address"]').text().trim() ??
    null;

  const finnkode = parseFinnkode(url) ?? extractFinnkodeFromHtml($) ?? "";

  return {
    finnkode,
    url,
    title,
    description: description.trim(),
    priceNok,
    finnCondition,
    postedAt,
    location: location && location.length ? location : null,
    imageUrls,
    seller,
  };
}

function extractFinnkodeFromHtml($: cheerio.CheerioAPI): string | null {
  const txt = $('body').text();
  const m = txt.match(/FINN-?kode[:\s]*(\d{6,12})/i);
  return m ? m[1]! : null;
}

function pickDefinitionValue(
  $: cheerio.CheerioAPI,
  labels: string[],
): string | null {
  let result: string | null = null;
  $("dt").each((_, dt) => {
    const label = $(dt).text().trim().toLowerCase();
    if (labels.some((l) => label.includes(l))) {
      const dd = $(dt).next("dd");
      const v = dd.text().trim();
      if (v) {
        result = v;
        return false;
      }
    }
    return undefined;
  });
  return result;
}

function normaliseFinnImage(u: string): string | null {
  if (!u) return null;
  // Upgrade thumbnails to full-size by stripping the dynamic size segment.
  // Examples: https://images.finncdn.no/dynamic/480w/<path>.jpg -> /dynamic/1600w/<path>.jpg
  const big = u.replace(
    /\/dynamic\/\d+[wxh]?(?:\/\d+[wxh]?)?\//,
    "/dynamic/1600w/",
  );
  if (big.startsWith("//")) return "https:" + big;
  return big;
}

function extractSeller(
  $: cheerio.CheerioAPI,
  next: unknown,
): SellerRef {
  // Try __NEXT_DATA__ first — most reliable, fields like sellerId / userId / contactName.
  const fromNext = deepFindFirst(next, (n): n is Record<string, unknown> => {
    if (!n || typeof n !== "object") return false;
    const o = n as Record<string, unknown>;
    return (
      ("sellerId" in o || "userId" in o) &&
      ("name" in o || "contactName" in o || "displayName" in o)
    );
  });

  let finnUserId: string | null = null;
  let displayName: string | null = null;
  let profileUrl: string | null = null;

  if (fromNext) {
    finnUserId =
      str(fromNext["sellerId"]) ?? str(fromNext["userId"]) ?? null;
    displayName =
      str(fromNext["name"]) ??
      str(fromNext["contactName"]) ??
      str(fromNext["displayName"]) ??
      null;
  }

  // Fall back to a profile/ads link in the DOM.
  const link = $(
    'a[href*="/profile/ads/"], a[href*="/recommerce/forsale/private"], a[href*="orgId="]',
  )
    .first()
    .attr("href");
  if (link) {
    profileUrl = link.startsWith("http") ? link : `https://www.finn.no${link}`;
    const m =
      link.match(/\/profile\/ads\/(\d+)/) ??
      link.match(/orgId=(\d+)/) ??
      link.match(/userId=(\d+)/);
    if (m && !finnUserId) finnUserId = m[1]!;
  }

  if (!displayName) {
    displayName =
      $('[data-testid="contact-seller-name"], [data-testid="seller-name"]')
        .first()
        .text()
        .trim() || null;
  }

  if (!profileUrl && finnUserId) {
    profileUrl = `https://www.finn.no/profile/ads/${finnUserId}`;
  }

  return { finnUserId, displayName, profileUrl };
}

function str(x: unknown): string | null {
  return typeof x === "string" && x.length > 0 ? x : null;
}
