"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCodeStyling, { type DotType } from "qr-code-styling";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ShapePreset = "square" | "rounded" | "dots" | "classy";

const SHAPE_DOT_TYPE: Record<ShapePreset, DotType> = {
  square: "square",
  rounded: "rounded",
  dots: "dots",
  classy: "classy-rounded",
};

export function QrCard({
  publicUrl,
  slug,
  themeColor,
  restaurantLogoUrl,
  t,
}: {
  publicUrl: string;
  slug: string;
  themeColor: string;
  restaurantLogoUrl: string | null;
  t: Pick<Dictionary["dashboard"], "qrTitle" | "qrHint"> & Dictionary["qrCustomizer"];
}) {
  const [dotColor, setDotColor] = useState(themeColor || "#f97316");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [shape, setShape] = useState<ShapePreset>("rounded");
  const [logoOption, setLogoOption] = useState<"none" | "restaurant" | "custom">(
    restaurantLogoUrl ? "restaurant" : "none",
  );
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const logoImage =
    logoOption === "restaurant"
      ? restaurantLogoUrl ?? undefined
      : logoOption === "custom"
        ? customLogo ?? undefined
        : undefined;

  useEffect(() => {
    qrRef.current = new QRCodeStyling({
      width: 220,
      height: 220,
      type: "svg",
      data: publicUrl,
      margin: 8,
      qrOptions: { errorCorrectionLevel: "H" },
      imageOptions: { crossOrigin: "anonymous", margin: 6, imageSize: 0.35 },
      dotsOptions: { type: SHAPE_DOT_TYPE[shape], color: dotColor },
      cornersSquareOptions: {
        type: shape === "square" ? "square" : "extra-rounded",
      },
      cornersDotOptions: { type: shape === "square" ? "square" : "dot" },
      backgroundOptions: { color: bgColor },
      image: logoImage,
    });
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    }
    // Solo se crea una vez, con los valores iniciales; los cambios
    // posteriores de color/forma/logo los aplica el efecto de abajo con
    // .update() en la misma instancia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicUrl]);

  useEffect(() => {
    qrRef.current?.update({
      dotsOptions: { type: SHAPE_DOT_TYPE[shape], color: dotColor },
      cornersSquareOptions: {
        type: shape === "square" ? "square" : "extra-rounded",
      },
      cornersDotOptions: { type: shape === "square" ? "square" : "dot" },
      backgroundOptions: { color: bgColor },
      image: logoImage,
    });
  }, [shape, dotColor, bgColor, logoImage]);

  const handleCustomLogo = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCustomLogo(typeof reader.result === "string" ? reader.result : null);
      setLogoOption("custom");
    };
    reader.readAsDataURL(file);
  };

  const shapeOptions: { id: ShapePreset; label: string }[] = [
    { id: "square", label: t.shapeSquare },
    { id: "rounded", label: t.shapeRounded },
    { id: "dots", label: t.shapeDots },
    { id: "classy", label: t.shapeClassy },
  ];

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row">
      <div className="flex shrink-0 flex-col items-center gap-3">
        <div className="rounded-xl border border-neutral-100 bg-white p-3 dark:border-neutral-700">
          <div ref={containerRef} />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => qrRef.current?.download({ name: `qr-${slug}`, extension: "png" })}
        >
          {t.download}
        </Button>
      </div>

      <div className="flex-1 space-y-4">
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{t.qrTitle}</p>
          <Link
            href={publicUrl}
            target="_blank"
            className="break-all text-sm text-neutral-600 underline dark:text-neutral-400"
          >
            {publicUrl}
          </Link>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{t.qrHint}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {t.dotColorLabel}
            </label>
            <input
              type="color"
              value={dotColor}
              onChange={(e) => setDotColor(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {t.bgColorLabel}
            </label>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-lg border border-neutral-200 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {t.shapeLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {shapeOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setShape(opt.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  shape === opt.id
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            {t.logoLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLogoOption("none")}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                logoOption === "none"
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {t.logoNone}
            </button>
            {restaurantLogoUrl && (
              <button
                type="button"
                onClick={() => setLogoOption("restaurant")}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  logoOption === "restaurant"
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {t.logoRestaurant}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCustomLogo(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                logoOption === "custom"
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {t.logoCustom}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
