import Link from "next/link";
import { publicImageUrl } from "@/lib/storage";
import { formatNOK } from "@/lib/utils";

type Item = {
  id: string;
  title: string;
  detail?: string;
  price: number | null;
  bidCount?: number;
  type: "auction" | "fixed";
  timeRemaining?: string;
  firstImage?: string | null;
};

type Props = {
  items: Item[];
};

export function SimilarItems({ items }: Props) {
  if (items.length < 3) return null;

  return (
    <div className="pt-5">
      <div className="flex items-baseline justify-between px-5 pb-3">
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Similar Shirts
        </h2>
        <Link href="/browse" className="text-xs font-medium text-green-400">
          See all
        </Link>
      </div>
      <div className="scrollbar-hide flex gap-2.5 overflow-x-auto px-4 pb-5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/l/${item.id}`}
            className="w-[140px] shrink-0 overflow-hidden rounded-md border border-border bg-card"
          >
            <div className="relative aspect-square bg-card-hover">
              {item.firstImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicImageUrl(item.firstImage, { w: 280, h: 280, fit: "cover" })}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : null}
              {item.type === "auction" && item.timeRemaining ? (
                <span className="absolute bottom-[5px] left-[5px] rounded-pill bg-background/70 px-1.5 py-0.5 text-[9px] font-semibold text-foreground backdrop-blur-sm">
                  {item.timeRemaining}
                </span>
              ) : null}
            </div>
            <div className="px-2.5 pb-2.5 pt-2">
              <div className="font-display text-[11px] font-semibold tracking-tight text-foreground line-clamp-1">
                {item.title}
              </div>
              {item.detail ? (
                <div className="mt-px text-[9px] text-text-tertiary line-clamp-1">{item.detail}</div>
              ) : null}
              <div className="mt-[5px] font-display text-xs font-bold tabular-nums text-foreground">
                {item.price ? formatNOK(item.price) : "—"}
              </div>
              {item.type === "auction" && item.bidCount ? (
                <div className="mt-px text-[9px] font-medium text-green-400">
                  {item.bidCount} bids
                </div>
              ) : item.type === "fixed" ? (
                <div className="mt-px text-[9px] font-medium text-green-300">Buy Now</div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
