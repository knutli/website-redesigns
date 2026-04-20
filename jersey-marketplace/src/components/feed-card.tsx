import Link from "next/link";
import { publicImageUrl } from "@/lib/storage";
import { formatNOK } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type RichProps = {
  variant: "rich";
  id: string;
  title: string;
  meta?: string;
  image?: string | null;
  price: number | null;
  type: "auction" | "fixed";
  watcherCount?: number;
  endAt?: Date | null;
  username: string;
  userAvatar?: string | null;
  actionText: string;
  timestamp: string;
  sold?: boolean;
  bidInfo?: string;
};

type CompactProps = {
  variant: "compact";
  thumbnail?: string | null;
  text: React.ReactNode;
  timestamp: string;
};

type Props = RichProps | CompactProps;

function timeLeft(end: Date) {
  const ms = end.getTime() - Date.now();
  if (ms <= 0) return "ended";
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function FeedCard(props: Props) {
  if (props.variant === "compact") return <CompactFeedCard {...props} />;
  return <RichFeedCard {...props} />;
}

function RichFeedCard({
  id,
  title,
  meta,
  image,
  price,
  type,
  watcherCount,
  endAt,
  username,
  userAvatar,
  actionText,
  timestamp,
  sold,
  bidInfo,
}: RichProps) {
  return (
    <article className="mx-3.5 overflow-hidden rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-start gap-2.5 px-4 pt-3.5">
        <div className="h-[34px] w-[34px] shrink-0 rounded-full border border-border bg-bg-raised" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-foreground">{username}</span>
            <span className="text-xs text-text-tertiary">{actionText}</span>
          </div>
        </div>
        <span className="shrink-0 text-[11px] text-text-tertiary">{timestamp}</span>
      </div>

      {/* Image */}
      <div className="relative mx-4 mt-3 overflow-hidden rounded-md" style={{ aspectRatio: "16/10" }}>
        {image ? (
          <Link href={`/l/${id}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicImageUrl(image, { w: 800, h: 500, fit: "cover" })}
              alt={title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </Link>
        ) : (
          <div className="h-full w-full bg-card-hover" />
        )}
        {sold ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/70" />
            <span className="absolute bottom-2.5 right-2.5 rounded-pill bg-red-400 px-3.5 py-[5px] text-[11px] font-semibold text-white">
              Sold
            </span>
          </>
        ) : null}
      </div>

      {/* Details */}
      <div className="px-4 pt-3">
        <h3 className="font-display text-lg text-foreground">
          <Link href={`/l/${id}`}>{title}</Link>
        </h3>
        {meta ? <p className="text-xs text-text-secondary">{meta}</p> : null}
        {bidInfo ? <p className="mt-1 text-xs text-text-secondary">{bidInfo}</p> : null}
      </div>

      {/* Action bar (active listings only) */}
      {!sold && price ? (
        <div className="mx-4 mt-2 flex items-center justify-between border-t border-border py-3.5">
          <div>
            <div className="text-[10px] uppercase tracking-badge text-text-tertiary">
              {type === "auction" ? "Current bid" : "Price"}
            </div>
            <div className="text-lg font-semibold tabular-nums text-foreground">
              {formatNOK(price)}
            </div>
          </div>
          <Button asChild size="sm" variant={type === "auction" ? "default" : "soft"}>
            <Link href={`/l/${id}`}>{type === "auction" ? "Place Bid" : "Buy Now"}</Link>
          </Button>
        </div>
      ) : null}

      {/* Footer stats */}
      <div className="flex gap-4 px-4 pb-3">
        {watcherCount ? (
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <svg className="h-[13px] w-[13px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z"/><circle cx="8" cy="8" r="2"/></svg>
            {watcherCount}
          </span>
        ) : null}
        {endAt ? (
          <span className="flex items-center gap-1 text-xs text-text-tertiary">
            <svg className="h-[13px] w-[13px]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/></svg>
            {timeLeft(endAt)}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function CompactFeedCard({ thumbnail, text, timestamp }: CompactProps) {
  return (
    <article className="mx-3.5 flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      {thumbnail ? (
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-sm bg-card-hover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicImageUrl(thumbnail, { w: 88, h: 88, fit: "cover" })}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-11 w-11 shrink-0 rounded-sm bg-card-hover" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-text-secondary">{text}</p>
        <p className="text-[11px] text-text-tertiary">{timestamp}</p>
      </div>
    </article>
  );
}
