"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function QrCard({
  publicUrl,
  t,
}: {
  publicUrl: string;
  t: Pick<Dictionary["dashboard"], "qrTitle" | "qrHint">;
}) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center">
      <div className="rounded-xl border border-neutral-100 bg-white p-3 dark:border-neutral-700">
        <QRCodeSVG value={publicUrl} size={112} />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          {t.qrTitle}
        </p>
        <Link
          href={publicUrl}
          target="_blank"
          className="break-all text-sm text-neutral-600 underline dark:text-neutral-400"
        >
          {publicUrl}
        </Link>
        <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
          {t.qrHint}
        </p>
      </div>
    </div>
  );
}
