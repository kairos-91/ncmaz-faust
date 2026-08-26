"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Check, Clipboard, Loader2, X } from "lucide-react";
import { uploadPaymentProof } from "./actions";

export function ReceiptPasteZone({
  onUploaded,
}: {
  onUploaded: (url: string | null) => void;
}) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setStatus("uploading");
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadPaymentProof(formData);

    if ("error" in result && result.error) {
      setError(result.error);
      setStatus("idle");
      setPreview(null);
      return;
    }

    setStatus("done");
    onUploaded(result.url ?? null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const item = Array.from(e.clipboardData.items).find((i) =>
      i.type.startsWith("image/"),
    );
    const file = item?.getAsFile();
    if (file) {
      e.preventDefault();
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setPreview(null);
    setStatus("idle");
    setError(null);
    onUploaded(null);
  };

  if (preview) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700">
          <Image
            src={preview}
            alt="Comprobante de pago"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1 text-sm">
          {status === "uploading" ? (
            <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Subiendo
              comprobante...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
              <Check className="h-3.5 w-3.5" /> Comprobante adjuntado
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Quitar comprobante"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={zoneRef}
        tabIndex={0}
        onPaste={handlePaste}
        onClick={() => zoneRef.current?.focus()}
        className="flex cursor-text flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-6 text-center outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800/50 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
      >
        <Clipboard className="h-5 w-5 text-neutral-400" />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Haz clic aquí y pega tu captura del comprobante (Ctrl+V)
        </p>
        <label className="cursor-pointer text-xs font-medium text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-300">
          o selecciona un archivo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
