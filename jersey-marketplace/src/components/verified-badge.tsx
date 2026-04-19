import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary",
        className,
      )}
      title="Verified Collector"
    >
      <BadgeCheck className="h-3 w-3" />
      Verified
    </span>
  );
}
