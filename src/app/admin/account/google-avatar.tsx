"use client";

import { useState } from "react";
import Image from "next/image";

export function GoogleAvatar({
  avatarUrl,
  initial,
}: {
  avatarUrl: string | null;
  initial: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!avatarUrl || broken) {
    return (
      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-lime-100 text-xl font-semibold text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
        {initial}
      </span>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt=""
      width={64}
      height={64}
      unoptimized
      onError={() => setBroken(true)}
      className="h-16 w-16 shrink-0 rounded-full object-cover"
    />
  );
}
