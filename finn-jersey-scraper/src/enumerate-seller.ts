import * as cheerio from "cheerio";
import { fetchHtml } from "./fetch.js";
import { parseFinnkode, parseListingPage } from "./parse-listing.js";

/**
 * Resolve a profile URL + a Finn user ID from any Finn URL the user passes in.
 * Accepts a profile URL directly, or a single listing URL (we walk up to the seller).
 */
export async function resolveSellerProfileUrl(
  inputUrl: string,
): Promise<{ profileUrl: string; finnUserId: string | null }> {
  const u = new URL(inputUrl);
  if (u.pathname.includes("/profile/ads/") || u.searchParams.has("orgId")) {
    const pathMatch = u.pathname.match(/\/profile\/ads\/(\d+)/);
    const finnUserId =
      pathMatch?.[1] ?? u.searchParams.get("orgId") ?? null;
    return { profileUrl: inputUrl, finnUserId };
  }

  // Treat as listing URL — fetch, parse, return seller.
  const html = await fetchHtml(inputUrl);
  const raw = parseListingPage(inputUrl, html);
  if (!raw.seller.profileUrl) {
    throw new Error(
      `Could not find seller profile from listing ${inputUrl}. ` +
        "Pass a profile URL directly (e.g. https://www.finn.no/profile/ads/<id>).",
    );
  }
  return {
    profileUrl: raw.seller.profileUrl,
    finnUserId: raw.seller.finnUserId,
  };
}

/**
 * Enumerate all listing URLs on a seller's profile page, following pagination.
 * We accept any anchor whose href looks like a Finn listing.
 */
export async function enumerateSellerListingUrls(
  profileUrl: string,
): Promise<string[]> {
  const seen = new Set<string>();
  const urls: string[] = [];
  let page = 1;
  const maxPages = 50;

  while (page <= maxPages) {
    const u = new URL(profileUrl);
    if (page > 1) u.searchParams.set("page", String(page));
    const pageUrl = u.toString();
    if (seen.has(pageUrl)) break;
    seen.add(pageUrl);

    const html = await fetchHtml(pageUrl);
    const $ = cheerio.load(html);
    const before = urls.length;

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      if (!isListingUrl(href)) return;
      const abs = href.startsWith("http") ? href : `https://www.finn.no${href}`;
      const finnkode = parseFinnkode(abs);
      if (!finnkode) return;
      const canonical = `https://www.finn.no/recommerce/forsale/item/${finnkode}`;
      if (!urls.includes(canonical)) urls.push(canonical);
    });

    const added = urls.length - before;
    if (added === 0) break;
    page += 1;
  }

  return urls;
}

function isListingUrl(href: string): boolean {
  return (
    /\/recommerce\/forsale\/item\/\d+/.test(href) ||
    /finnkode=\d+/.test(href) ||
    /\/bap\/forsale\/ad\.html\?finnkode=\d+/.test(href)
  );
}
