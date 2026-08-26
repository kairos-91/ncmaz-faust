"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export type PaymentDetailRow = {
  label: string;
  value: string;
  /** Texto a copiar si difiere del que se muestra (ej. código de banco vs. nombre). */
  copyValue?: string;
};

export function PaymentDetailsCard({
  rows,
  copyAllText,
}: {
  rows: PaymentDetailRow[];
  /** Si se pasa, "Copiar todo" copia este texto en vez de armar uno con label: value. */
  copyAllText?: string;
}) {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    const text =
      copyAllText ??
      rows.map((r) => `${r.label}: ${r.copyValue ?? r.value}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 1500);
    } catch {
      // ignore: clipboard access denied
    }
  };

  return (
    <div className="space-y-2 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
      {rows.map((row) => (
        <CopyRow key={row.label} {...row} />
      ))}
      <button
        type="button"
        onClick={handleCopyAll}
        className="mt-1 flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        {copiedAll ? (
          <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        Copiar todo
      </button>
    </div>
  );
}

function CopyRow({ label, value, copyValue }: PaymentDetailRow) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore: clipboard access denied
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copiar ${label}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-700"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
