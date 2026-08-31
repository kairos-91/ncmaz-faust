"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProfileAvatar } from "./actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export function AvatarSection({
  email,
  avatarUrl,
  locale,
}: {
  email: string | null;
  avatarUrl: string | null;
  locale: Locale;
}) {
  const t = getDictionary(locale).profileMenu;
  const router = useRouter();
  const [avatar, setAvatar] = useState(avatarUrl);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initial = email?.[0]?.toUpperCase() ?? "?";

  const handleChange = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startUpload(async () => {
      const result = await updateProfileAvatar(formData);
      if ("error" in result && result.error) setError(result.error);
      if ("url" in result && result.url) {
        setAvatar(result.url);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex items-center gap-4">
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={64}
          height={64}
          unoptimized
          className="h-16 w-16 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-lime-100 text-xl font-semibold text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
          {initial}
        </span>
      )}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleChange(e.target.files?.[0])}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera className="h-4 w-4" />
          {isUploading ? t.uploadingPhoto : t.changePhoto}
        </Button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
