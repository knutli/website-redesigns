import { Star } from "lucide-react";

type ReviewItem = {
  rating: number;
  comment: string | null;
  reviewerHandle: string | null;
  reviewerName: string | null;
  createdAt: string;
};

export function ReviewList({ reviews }: { reviews: ReviewItem[] }) {
  if (reviews.length === 0) return null;

  return (
    <div className="px-4 pt-5">
      <h2 className="mb-3.5 font-display text-lg font-semibold tracking-tight text-foreground">
        Reviews ({reviews.length})
      </h2>
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="rounded-md border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {r.reviewerHandle ? `@${r.reviewerHandle}` : r.reviewerName ?? "Buyer"}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className={`h-3 w-3 ${s < r.rating ? "fill-green-400 text-green-400" : "text-text-tertiary"}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-text-tertiary">
                {new Date(r.createdAt).toLocaleDateString("nb-NO")}
              </span>
            </div>
            {r.comment ? (
              <p className="mt-1.5 text-sm text-text-secondary">{r.comment}</p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
