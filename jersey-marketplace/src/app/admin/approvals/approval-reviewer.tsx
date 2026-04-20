"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { publicImageUrl } from "@/lib/storage";
import { formatNOK } from "@/lib/utils";

const REJECTION_REASONS = [
  "Photos are blurry / too dark",
  "Photos don't show front and back",
  "Suspected counterfeit — need more proof",
  "Missing size / season / player info",
  "Price outside reasonable range",
  "Duplicate listing",
  "Prohibited item (not a jersey)",
  "Offensive or inappropriate content",
] as const;

type Item = {
  listingId: string;
  type: "auction" | "fixed";
  startPrice: number | null;
  buyNowPrice: number | null;
  reservePrice: number | null;
  jerseyId: string;
  title: string;
  club: string | null;
  season: string | null;
  player: string | null;
  size: string | null;
  condition: string | null;
  authenticity: string | null;
  description: string | null;
  sellerHandle: string | null;
  sellerName: string | null;
  images: { storageKey: string; order: number }[];
};

export function ApprovalReviewer({ items }: { items: Item[] }) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [freeText, setFreeText] = useState("");
  const [busy, setBusy] = useState(false);

  const item = items[idx];
  const images = item?.images ?? [];

  const advance = useCallback(() => {
    setImgIdx(0);
    setRejectOpen(false);
    setRejectReason("");
    setFreeText("");
    if (idx + 1 >= items.length) {
      router.refresh();
    } else {
      setIdx(idx + 1);
    }
  }, [idx, items.length, router]);

  const approve = useCallback(async () => {
    if (!item || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/listings/${item.listingId}/approve`, { method: "POST" });
      if (!res.ok) throw new Error("Approve failed");
      advance();
    } finally {
      setBusy(false);
    }
  }, [item, busy, advance]);

  const reject = useCallback(
    async (reason: string) => {
      if (!item || !reason || busy) return;
      setBusy(true);
      try {
        const res = await fetch(`/api/admin/listings/${item.listingId}/reject`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });
        if (!res.ok) throw new Error("Reject failed");
        advance();
      } finally {
        setBusy(false);
      }
    },
    [item, busy, advance],
  );

  const prevImg = useCallback(() => setImgIdx((i) => Math.max(0, i - 1)), []);
  const nextImg = useCallback(
    () => setImgIdx((i) => Math.min(images.length - 1, i + 1)),
    [images.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (rejectOpen) return;
      if (e.key === "ArrowLeft") prevImg();
      if (e.key === "ArrowRight") nextImg();
      if (e.key === "a" || e.key === "A") approve();
      if (e.key === "r" || e.key === "R") setRejectOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevImg, nextImg, approve, rejectOpen]);

  const priceLine = useMemo(() => {
    if (!item) return null;
    if (item.type === "auction") {
      return (
        <>
          Start {item.startPrice ? formatNOK(item.startPrice) : "—"}
          {item.reservePrice ? ` · Reserve ${formatNOK(item.reservePrice)}` : ""}
          {item.buyNowPrice ? ` · BIN ${formatNOK(item.buyNowPrice)}` : ""}
        </>
      );
    }
    return <>Price {item.buyNowPrice ? formatNOK(item.buyNowPrice) : "—"}</>;
  }, [item]);

  if (!item) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Image viewer */}
      <div className="space-y-3">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {images[imgIdx] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={publicImageUrl(images[imgIdx].storageKey, { w: 1600, h: 1600, fit: "contain" })}
              alt={`${item.title} — ${imgIdx + 1}`}
              className="h-full w-full object-contain"
            />
          ) : null}
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 backdrop-blur"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-2 py-0.5 text-xs">
                {imgIdx + 1} / {images.length}
              </div>
            </>
          ) : null}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.storageKey}
              type="button"
              onClick={() => setImgIdx(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === imgIdx ? "border-primary" : "border-transparent"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicImageUrl(img.storageKey, { w: 200, h: 200, fit: "cover" })}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Info + actions */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              {item.type} · {idx + 1} of {items.length}
            </div>
            <h2 className="mt-1 font-display text-2xl leading-tight">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{priceLine}</p>
          </div>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
            {item.club && (
              <>
                <dt className="text-muted-foreground">Club</dt>
                <dd>{item.club}</dd>
              </>
            )}
            {item.season && (
              <>
                <dt className="text-muted-foreground">Season</dt>
                <dd>{item.season}</dd>
              </>
            )}
            {item.player && (
              <>
                <dt className="text-muted-foreground">Player</dt>
                <dd>{item.player}</dd>
              </>
            )}
            {item.size && (
              <>
                <dt className="text-muted-foreground">Size</dt>
                <dd>{item.size}</dd>
              </>
            )}
            {item.condition && (
              <>
                <dt className="text-muted-foreground">Condition</dt>
                <dd>{item.condition}</dd>
              </>
            )}
            {item.authenticity && (
              <>
                <dt className="text-muted-foreground">Authenticity</dt>
                <dd>{item.authenticity}</dd>
              </>
            )}
            <dt className="text-muted-foreground">Seller</dt>
            <dd>{item.sellerHandle ? `@${item.sellerHandle}` : item.sellerName}</dd>
          </dl>

          {item.description ? (
            <div className="rounded-xl bg-muted p-3 text-sm">{item.description}</div>
          ) : null}

          {!rejectOpen ? (
            <div className="flex gap-2">
              <Button onClick={approve} disabled={busy} className="flex-1" size="lg">
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => setRejectOpen(true)}
                variant="outline"
                disabled={busy}
                className="flex-1"
                size="lg"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border p-3">
              <div className="text-sm font-medium">Rejection reason</div>
              <div className="flex flex-wrap gap-2">
                {REJECTION_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectReason(r)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      rejectReason === r ? "border-primary bg-primary/10" : "hover:bg-accent"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <Input
                placeholder="Or type your own…"
                value={freeText}
                onChange={(e) => {
                  setFreeText(e.target.value);
                  setRejectReason(e.target.value);
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => reject(rejectReason)}
                  disabled={!rejectReason || busy}
                  variant="destructive"
                  className="flex-1"
                >
                  Send rejection
                </Button>
                <Button variant="ghost" onClick={() => setRejectOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
