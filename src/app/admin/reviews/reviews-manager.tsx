"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { averageRating, type Review } from "@/lib/reviews";
import { deleteReview, toggleReviewVisibility } from "./actions";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["reviewManager"];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-300 dark:text-neutral-700",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsManager({
  restaurantId,
  reviews,
  locale,
}: {
  restaurantId: string;
  reviews: Review[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.reviewManager };
  const avg = averageRating(reviews);

  return (
    <div className="space-y-4">
      {reviews.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <Stars rating={Math.round(avg)} />
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            {avg}
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-500">
            ({reviews.length})
          </span>
        </div>
      )}
      <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {reviews.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t.empty}
          </li>
        )}
        {reviews.map((review) => (
          <ReviewRow key={review.id} restaurantId={restaurantId} review={review} t={t} />
        ))}
      </ul>
    </div>
  );
}

function ReviewRow({
  restaurantId,
  review,
  t,
}: {
  restaurantId: string;
  review: Review;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {review.customer_name}
          </p>
          <Stars rating={review.rating} />
        </div>
        {review.comment && (
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {review.comment}
          </p>
        )}
        <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-600">
          {new Date(review.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              toggleReviewVisibility(restaurantId, review.id, !review.is_visible),
            )
          }
          className={
            review.is_visible
              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700"
              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }
        >
          {review.is_visible ? t.visible : t.hidden}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="text-xs font-medium text-red-500 hover:text-red-700"
          onClick={() => {
            if (!confirm(t.deleteConfirm(review.customer_name))) return;
            startTransition(() => deleteReview(restaurantId, review.id));
          }}
        >
          {t.delete}
        </button>
      </div>
    </li>
  );
}
