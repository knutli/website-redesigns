import { request } from "undici";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15";

const DEFAULT_HEADERS: Record<string, string> = {
  "User-Agent": UA,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "nb-NO,nb;q=0.9,en;q=0.7",
  "Cache-Control": "no-cache",
};

const delayMs = Number(process.env.REQUEST_DELAY_MS ?? 1500);
let lastRequestAt = 0;

async function throttle() {
  const wait = lastRequestAt + delayMs - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

export async function fetchHtml(url: string, attempt = 1): Promise<string> {
  await throttle();
  const res = await request(url, {
    method: "GET",
    headers: DEFAULT_HEADERS,
    maxRedirections: 5,
  });
  if (res.statusCode === 429 || res.statusCode >= 500) {
    if (attempt >= 4) throw new Error(`GET ${url} failed: ${res.statusCode}`);
    const backoff = 2_000 * 2 ** (attempt - 1);
    await new Promise((r) => setTimeout(r, backoff));
    return fetchHtml(url, attempt + 1);
  }
  if (res.statusCode >= 400) {
    throw new Error(`GET ${url} failed: ${res.statusCode}`);
  }
  return await res.body.text();
}

export async function fetchBinary(url: string): Promise<Buffer> {
  await throttle();
  const res = await request(url, {
    method: "GET",
    headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
    maxRedirections: 5,
  });
  if (res.statusCode >= 400) {
    throw new Error(`GET ${url} failed: ${res.statusCode}`);
  }
  const chunks: Buffer[] = [];
  for await (const chunk of res.body) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}
