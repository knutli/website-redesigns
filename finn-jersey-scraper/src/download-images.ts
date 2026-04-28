import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchBinary } from "./fetch.js";

export async function downloadImages(
  urls: string[],
  destDir: string,
): Promise<{ url: string; localPath: string }[]> {
  await mkdir(destDir, { recursive: true });
  const results: { url: string; localPath: string }[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]!;
    const ext = guessExt(url);
    const filename = `${String(i + 1).padStart(2, "0")}${ext}`;
    const localPath = join(destDir, filename);
    try {
      const buf = await fetchBinary(url);
      await writeFile(localPath, buf);
      results.push({ url, localPath });
    } catch (err) {
      console.warn(`  ! image failed: ${url} (${(err as Error).message})`);
    }
  }
  return results;
}

function guessExt(url: string): string {
  const path = url.split("?")[0] ?? "";
  const m = path.match(/\.(jpe?g|png|webp|gif)$/i);
  return m ? `.${m[1]!.toLowerCase()}` : ".jpg";
}
