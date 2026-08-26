"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { updateRestaurantLogo } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/lib/supabase/database.types";

export function CoverUploader({ restaurant }: { restaurant: Restaurant }) {
  const [coverUrl, setCoverUrl] = useState(restaurant.cover_url);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startTransition(async () => {
      const result = await updateRestaurantLogo(
        restaurant.id,
        "cover_url",
        formData,
      );
      if ("error" in result && result.error) setError(result.error);
      if ("url" in result && result.url) setCoverUrl(result.url);
    });
  };

  return (
    <div>
      <div
        className="relative flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 sm:h-36 dark:border-neutral-700 dark:bg-neutral-800"
        style={
          !coverUrl ? { backgroundColor: restaurant.theme_color } : undefined
        }
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt="Portada"
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-xs text-white/80">Sin portada</span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleChange(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Subiendo..." : "Cambiar portada"}
        </Button>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
