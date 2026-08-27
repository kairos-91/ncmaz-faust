"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { averageRating, type Review } from "@/lib/reviews";
import { createReview } from "./actions";

function Stars({
  rating,
  size = "h-4 w-4",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            size,
            n <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-300 dark:text-neutral-700",
          )}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({
  restaurantId,
  reviews,
  themeColor,
}: {
  restaurantId: string;
  reviews: Review[];
  themeColor: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const avg = averageRating(reviews);
  const visible = showAll ? reviews : reviews.slice(0, 5);

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError("Ingresa tu nombre");
    if (rating === 0) return setError("Selecciona una calificación");
    setSending(true);
    const result = await createReview(restaurantId, {
      customerName: name,
      rating,
      comment,
    });
    setSending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
    setFormOpen(false);
  };

  return (
    <section
      id="resenas"
      className="mt-12 scroll-mt-6 border-t border-neutral-100 pt-8 dark:border-neutral-800"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Reseñas
          </h2>
          {reviews.length > 0 ? (
            <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <Stars rating={avg} />
              <span className="font-medium text-neutral-900 dark:text-white">
                {avg}
              </span>
              <span>
                ({reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"})
              </span>
            </div>
          ) : (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Aún no hay reseñas.
            </p>
          )}
        </div>
        {!formOpen && !sent && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Escribir reseña
          </button>
        )}
      </div>

      {sent && (
        <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-400">
          ¡Gracias por tu reseña!
        </p>
      )}

      {formOpen && (
        <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <div>
            <p className="mb-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Tu calificación
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${n} estrellas`}
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      n <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-300 dark:text-neutral-700",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Cuéntanos tu experiencia (opcional)"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={sending}
              onClick={submit}
              className="rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: themeColor }}
            >
              {sending ? "Enviando..." : "Publicar reseña"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {reviews.length > 0 && (
        <ul className="mt-4 space-y-4">
          {visible.map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-neutral-100 p-3 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {review.customer_name}
                </p>
                <Stars rating={review.rating} size="h-3.5 w-3.5" />
              </div>
              {review.comment && (
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  {review.comment}
                </p>
              )}
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-600">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      {reviews.length > 5 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-3 text-xs font-medium text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
        >
          Ver todas ({reviews.length})
        </button>
      )}
    </section>
  );
}
