"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export function QrCard({ publicUrl }: { publicUrl: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:flex-row sm:items-center">
      <div className="rounded-xl border border-neutral-100 p-3">
        <QRCodeSVG value={publicUrl} size={112} />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-900">
          Tu menú digital
        </p>
        <Link
          href={publicUrl}
          target="_blank"
          className="break-all text-sm text-neutral-600 underline"
        >
          {publicUrl}
        </Link>
        <p className="mt-1 text-xs text-neutral-600">
          Imprime este código QR y colócalo en tus mesas.
        </p>
      </div>
    </div>
  );
}
