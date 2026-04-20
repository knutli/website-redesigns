"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const TYPES = [
  { value: "", label: "All" },
  { value: "auction", label: "Auctions" },
  { value: "fixed", label: "Buy Now" },
] as const;

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const SORTS = [
  { value: "", label: "Newest" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
  { value: "ending", label: "Ending soon" },
] as const;

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-pill border-[1.5px] px-3 py-[7px] text-xs font-medium transition-colors ${
        active
          ? "border-green-400 bg-green-400 text-white"
          : "border-border bg-card text-text-secondary hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function BrowseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const currentType = searchParams.get("type") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentSize = searchParams.get("size") ?? "";

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams],
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", query.trim());
  }

  const hasFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-3">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search club, player, season..."
            className="pl-9"
          />
        </div>
        <Button type="submit" size="default">
          Search
        </Button>
      </form>

      {/* Type + Sort pills */}
      <div className="scrollbar-hide flex gap-2 overflow-x-auto">
        {TYPES.map((t) => (
          <Pill
            key={t.value}
            label={t.label}
            active={currentType === t.value}
            onClick={() => setParam("type", t.value)}
          />
        ))}
        <div className="mx-1 w-px shrink-0 bg-border" />
        {SORTS.map((s) => (
          <Pill
            key={s.value}
            label={s.label}
            active={currentSort === s.value}
            onClick={() => setParam("sort", s.value)}
          />
        ))}
        <div className="mx-1 w-px shrink-0 bg-border" />
        <Pill
          label="Filters"
          active={showAdvanced}
          onClick={() => setShowAdvanced(!showAdvanced)}
        />
        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.push("/browse")}
            className="shrink-0 text-xs font-medium text-green-400"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {/* Advanced filters */}
      {showAdvanced ? (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-tertiary">Size</label>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((s) => (
                <Pill
                  key={s}
                  label={s}
                  active={currentSize === s}
                  onClick={() => setParam("size", currentSize === s ? "" : s)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary">Club</label>
              <Input
                placeholder="e.g. Arsenal"
                defaultValue={searchParams.get("club") ?? ""}
                onBlur={(e) => setParam("club", e.target.value.trim())}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary">Season</label>
              <Input
                placeholder="e.g. 1998/99"
                defaultValue={searchParams.get("season") ?? ""}
                onBlur={(e) => setParam("season", e.target.value.trim())}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary">Min price (NOK)</label>
              <Input
                type="number"
                placeholder="0"
                defaultValue={searchParams.get("minPrice") ?? ""}
                onBlur={(e) => setParam("minPrice", e.target.value.trim())}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-tertiary">Max price (NOK)</label>
              <Input
                type="number"
                placeholder="∞"
                defaultValue={searchParams.get("maxPrice") ?? ""}
                onBlur={(e) => setParam("maxPrice", e.target.value.trim())}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
