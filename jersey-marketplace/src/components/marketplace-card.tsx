import Link from "next/link";
import { publicImageUrl } from "@/lib/storage";
import { formatNOK } from "@/lib/utils";

type Props = {
  id: string;
  title: string;
  club?: string | null;
  player?: string | null;
  size?: string | null;
  price: number | null;
  type: "auction" | "fixed";
  bidCount?: number;
  endAt?: Date | null;
  firstImage?: string | null;
  sellerHandle?: string | null;
  sellerName?: string | null;
  sellerRating?: number | null;
};

function timeLeft(end: Date) {
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "ended";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function MarketplaceCard({
  id,
  title,
  club,
  player,
  size,
  price,
  type,
  bidCount,
  endAt,
  firstImage,
  sellerHandle,
  sellerName,
  sellerRating,
}: Props) {
  const detail = [player, size].filter(Boolean).join(" · ");

  return (
    <Link href={`/l/${id}`} className="block">
      <article className="overflow-hidden rounded-md border border-border bg-card">
        {/* Image */}
        <div className="relative aspect-square bg-card">
          {firstImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={publicImageUrl(firstImage, { w: 600, h: 600, fit: "cover" })}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : null}
          {type === "auction" && endAt ? (
            <span className="absolute bottom-1.5 left-1.5 rounded-pill bg-background/70 px-[7px] py-[3px] text-[9px] font-semibold text-foreground backdrop-blur-sm">
              {timeLeft(endAt)}
            </span>
          ) : null}
        </div>

        {/* Body */}
        <div className="px-2.5 pb-3 pt-2.5">
          {/* Team */}
          <div className="text-xs font-semibold text-foreground line-clamp-1">
            {club ?? title}
          </div>
          {detail ? (
            <div className="mt-px text-[10px] text-text-tertiary line-clamp-1">{detail}</div>
          ) : null}

          {/* Seller */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-bg-raised" />
            <span className="text-[10px] text-text-tertiary line-clamp-1">
              {sellerHandle ? `@${sellerHandle}` : sellerName ?? "Seller"}
            </span>
            {sellerRating ? (
              <span className="ml-auto text-[10px] text-text-tertiary">
                ★ {sellerRating.toFixed(1)}
              </span>
            ) : null}
          </div>

          {/* Price */}
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {price ? formatNOK(price) : "—"}
            </span>
            {type === "auction" && bidCount ? (
              <span className="text-[10px] font-medium text-green-400">
                {bidCount} bids
              </span>
            ) : type === "fixed" ? (
              <span className="text-[10px] font-medium text-green-300">Buy Now</span>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
