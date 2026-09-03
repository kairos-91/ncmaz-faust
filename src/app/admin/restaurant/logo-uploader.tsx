"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { updateRestaurantLogo } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LogoUploader({
  restaurant,
  t,
}: {
  restaurant: Restaurant;
  t: Dictionary["logoUploader"];
}) {
  const [logoUrl, setLogoUrl] = useState(restaurant.logo_url);
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
        "logo_url",
        formData,
      );
      if ("error" in result && result.error) setError(result.error);
      if ("url" in result && result.url) setLogoUrl(result.url);
    });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo"
            width={64}
            height={64}
            className="h-full w-full object-contain p-1"
            unoptimized
          />
        ) : (
          <span className="text-xs text-neutral-400">{t.placeholder}</span>
        )}
      </div>
      <div>
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
          {isPending ? t.uploading : t.change}
        </Button>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">{t.sizeHint}</p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
