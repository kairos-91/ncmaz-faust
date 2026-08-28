"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { createReview } from "./actions";

export function WriteReviewButton({
  restaurantId,
  themeColor,
}: {
  restaurantId: string;
  themeColor: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

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
    setOpen(false);
  };

  if (sent) {
    return (
      <span className="basis-full rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
        ¡Gracias por tu reseña!
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border px-3 py-1.5 text-xs font-medium"
        style={{ borderColor: themeColor, color: themeColor }}
      >
        ✍️ Dejar reseña
      </button>

      {open && (
        <div className="basis-full space-y-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
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
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
