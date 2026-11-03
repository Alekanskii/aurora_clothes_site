import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReviewData } from "@/types/product";

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < Math.round(rating) ? "fill-gold-deep text-gold-deep" : "text-border"
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({
  reviews,
  averageRating,
}: {
  reviews: ReviewData[];
  averageRating: number;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Stars rating={averageRating} size={16} />
        <span className="text-sm text-stone">
          {reviews.length > 0
            ? `${averageRating.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
            : "No reviews yet"}
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-stone">
          Be the first to review this piece once you&apos;ve worn it in.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-6 last:border-b-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">{review.authorName}</span>
                <Stars rating={review.rating} />
              </div>
              <p className="text-sm leading-relaxed text-ink/80">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
