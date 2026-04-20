"use client";

import { cn } from "@/lib/utils";

type Props = {
  categories: string[];
  active: string;
  onChange: (cat: string) => void;
};

export function CategoryPills({ categories, active, onChange }: Props) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-3.5 pl-5 pr-3.5">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-pill border-[1.5px] px-4 py-[9px] text-sm font-medium transition-colors duration-150",
            active === cat
              ? "border-green-400 bg-green-400 text-white"
              : "border-border bg-card text-text-secondary hover:text-foreground",
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
