"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { publicImageUrl } from "@/lib/storage";

type Props = {
  images: { storageKey: string; order: number }[];
  alt: string;
};

export function ImageCarousel({ images, alt }: Props) {
  const [idx, setIdx] = useState(0);
  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx((i) => Math.min(images.length - 1, i + 1)), [], );

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-card">
        <div className="text-center">
          <div className="text-[64px]">👕</div>
          <p className="mt-2 text-sm text-text-tertiary">No photos available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-card" style={{ aspectRatio: "4/3" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={publicImageUrl(images[idx].storageKey, { w: 1200, h: 900, fit: "contain" })}
        alt={`${alt}, image ${idx + 1}`}
        className="h-full w-full object-contain"
      />

      {/* Desktop arrows */}
      {images.length > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/50 p-2 opacity-50 hover:opacity-100 md:block"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-background/50 p-2 opacity-50 hover:opacity-100 md:block"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}

      {/* Dot indicators */}
      {images.length > 1 ? (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                i === idx ? "w-[18px] bg-white" : "w-1.5 bg-white/30",
              )}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
