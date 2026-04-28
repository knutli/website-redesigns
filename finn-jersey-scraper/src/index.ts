import "dotenv/config";
import { Command } from "commander";
import { run } from "./orchestrator.js";

const program = new Command();
program
  .name("finn-jersey-scraper")
  .description(
    "Crawl all jersey listings from a Finn.no seller, extract structured fields, download images.",
  )
  .argument(
    "<url>",
    "Finn URL — either a profile (https://www.finn.no/profile/ads/<id>) or any single listing from the seller you want to crawl.",
  )
  .option("-o, --output <dir>", "Output directory", "output")
  .option("--no-images", "Skip image downloads")
  .option("--no-extract", "Skip Claude field extraction (raw fields only)")
  .option(
    "-l, --limit <n>",
    "Stop after N listings (useful for trial runs)",
    (v) => parseInt(v, 10),
  )
  .action(async (url: string, opts: Record<string, unknown>) => {
    try {
      await run({
        inputUrl: url,
        outputDir: String(opts.output ?? "output"),
        skipImages: opts.images === false,
        skipExtract: opts.extract === false,
        limit: typeof opts.limit === "number" ? opts.limit : null,
      });
    } catch (err) {
      console.error(`\nError: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
