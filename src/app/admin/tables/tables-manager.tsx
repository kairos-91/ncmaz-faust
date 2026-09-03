"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import QRCodeStyling, { type DotType } from "qr-code-styling";
import { QrCode, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createTable, deleteTable, setTableOccupied, updateTable } from "./actions";
import type { RestaurantTable } from "@/lib/supabase/database.types";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["tablesManager"];
type QrT = Dictionary["qrCustomizer"];

export function TablesManager({
  restaurantId,
  tables,
  publicUrl,
  themeColor,
  restaurantLogoUrl,
  locale,
}: {
  restaurantId: string;
  tables: RestaurantTable[];
  publicUrl: string;
  themeColor: string;
  restaurantLogoUrl: string | null;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t = dict.tablesManager;
  const qrT = dict.qrCustomizer;
  const boundCreate = createTable.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);
  const [qrTable, setQrTable] = useState<RestaurantTable | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!isPending && !state?.error) formRef.current?.reset();
  }, [isPending, state]);

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {tables.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t.empty}
          </li>
        )}
        {tables.map((table) => (
          <TableRow
            key={table.id}
            restaurantId={restaurantId}
            table={table}
            t={t}
            onViewQr={() => setQrTable(table)}
          />
        ))}
      </ul>

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Label htmlFor="zone">{t.zoneLabel}</Label>
          <Input id="zone" name="zone" placeholder={t.zonePlaceholder} />
        </div>
        <div className="flex-1">
          <Label htmlFor="name">{t.nameLabel}</Label>
          <Input id="name" name="name" placeholder={t.namePlaceholder} required />
        </div>
        <div className="w-full sm:w-28">
          <Label htmlFor="capacity">{t.capacityLabel}</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            max={100}
            defaultValue={2}
            required
          />
        </div>
        <Button type="submit" disabled={isPending} className="shrink-0">
          {isPending ? t.adding : t.add}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      {qrTable && (
        <TableQrModal
          table={qrTable}
          publicUrl={publicUrl}
          themeColor={themeColor}
          restaurantLogoUrl={restaurantLogoUrl}
          t={t}
          qrT={qrT}
          onClose={() => setQrTable(null)}
        />
      )}
    </div>
  );
}

function TableRow({
  restaurantId,
  table,
  t,
  onViewQr,
}: {
  restaurantId: string;
  table: RestaurantTable;
  t: T;
  onViewQr: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSave = (formData: FormData) => {
    setIsSaving(true);
    startTransition(async () => {
      const result = await updateTable(restaurantId, table.id, null, formData);
      setIsSaving(false);
      if (result?.error) {
        setError(result.error);
      } else {
        setError(undefined);
        setEditing(false);
      }
    });
  };

  if (editing) {
    return (
      <li className="px-4 py-3">
        <form action={handleSave} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor={`zone-${table.id}`}>{t.zoneLabel}</Label>
            <Input id={`zone-${table.id}`} name="zone" defaultValue={table.zone} />
          </div>
          <div className="flex-1">
            <Label htmlFor={`name-${table.id}`}>{t.nameLabel}</Label>
            <Input id={`name-${table.id}`} name="name" defaultValue={table.name} required />
          </div>
          <div className="w-full sm:w-28">
            <Label htmlFor={`capacity-${table.id}`}>{t.capacityLabel}</Label>
            <Input
              id={`capacity-${table.id}`}
              name="capacity"
              type="number"
              min={1}
              max={100}
              defaultValue={table.capacity}
              required
            />
          </div>
          <div className="flex shrink-0 gap-2">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? t.saving : t.save}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setError(undefined);
                setEditing(false);
              }}
            >
              {t.cancel}
            </Button>
          </div>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          {table.name}
          {table.zone && (
            <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              {table.zone}
            </span>
          )}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {t.peopleSuffix(table.capacity)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              setTableOccupied(restaurantId, table.id, !table.is_occupied),
            )
          }
          className={
            table.is_occupied
              ? "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-400"
              : "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-400/10 dark:text-green-400"
          }
          title={table.is_occupied ? t.markAvailable : t.markOccupied}
        >
          {table.is_occupied ? t.occupied : t.available}
        </button>
        <button
          type="button"
          onClick={onViewQr}
          className="flex items-center gap-1 rounded-full border border-neutral-200 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <QrCode className="h-3.5 w-3.5" />
          {t.viewQr}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          {t.edit}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="text-xs font-medium text-red-500 hover:text-red-700"
          onClick={() => {
            if (!confirm(t.deleteConfirm(table.name))) return;
            startTransition(() => deleteTable(restaurantId, table.id));
          }}
        >
          {t.delete}
        </button>
      </div>
    </li>
  );
}

type ShapePreset = "square" | "rounded" | "dots" | "classy";

const SHAPE_DOT_TYPE: Record<ShapePreset, DotType> = {
  square: "square",
  rounded: "rounded",
  dots: "dots",
  classy: "classy-rounded",
};

function TableQrModal({
  table,
  publicUrl,
  themeColor,
  restaurantLogoUrl,
  t,
  qrT,
  onClose,
}: {
  table: RestaurantTable;
  publicUrl: string;
  themeColor: string;
  restaurantLogoUrl: string | null;
  t: T;
  qrT: QrT;
  onClose: () => void;
}) {
  const tableUrl = `${publicUrl}?table=${table.id}`;

  const [dotColor, setDotColor] = useState(themeColor || "#84cc16");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [shape, setShape] = useState<ShapePreset>("rounded");
  const [logoOption, setLogoOption] = useState<"none" | "restaurant" | "custom">(
    restaurantLogoUrl ? "restaurant" : "none",
  );
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const qrExportRef = useRef<QRCodeStyling | null>(null);

  const logoImage =
    logoOption === "restaurant"
      ? restaurantLogoUrl ?? undefined
      : logoOption === "custom"
        ? customLogo ?? undefined
        : undefined;

  const styleOptions = (scale: number) => ({
    qrOptions: { errorCorrectionLevel: "H" as const },
    imageOptions: { crossOrigin: "anonymous", margin: 6 * scale, imageSize: 0.35 },
    dotsOptions: { type: SHAPE_DOT_TYPE[shape], color: dotColor },
    cornersSquareOptions: {
      type: shape === "square" ? ("square" as const) : ("extra-rounded" as const),
    },
    cornersDotOptions: { type: shape === "square" ? ("square" as const) : ("dot" as const) },
    backgroundOptions: { color: bgColor },
    image: logoImage,
  });

  useEffect(() => {
    qrRef.current = new QRCodeStyling({
      width: 200,
      height: 200,
      type: "svg",
      data: tableUrl,
      margin: 8,
      ...styleOptions(1),
    });
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    }

    qrExportRef.current = new QRCodeStyling({
      width: 1024,
      height: 1024,
      type: "canvas",
      data: tableUrl,
      margin: 40,
      ...styleOptions(1024 / 200),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableUrl]);

  useEffect(() => {
    qrRef.current?.update(styleOptions(1));
    qrExportRef.current?.update(styleOptions(1024 / 200));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    { id: "square", label: qrT.shapeSquare },
    { id: "rounded", label: qrT.shapeRounded },
    { id: "dots", label: qrT.shapeDots },
    { id: "classy", label: qrT.shapeClassy },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {t.qrModalTitle(table.name)}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <div className="rounded-xl border border-neutral-100 bg-white p-3 dark:border-neutral-700">
            <div ref={containerRef} />
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-500">
          {t.qrHint}
        </p>

        <div className="mt-5 space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {qrT.dotColorLabel}
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
                {qrT.bgColorLabel}
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
              {qrT.shapeLabel}
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
              {qrT.logoLabel}
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
                {qrT.logoNone}
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
                  {qrT.logoRestaurant}
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
                {qrT.logoCustom}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() =>
              qrExportRef.current?.download({ name: `qr-mesa-${table.name}`, extension: "png" })
            }
          >
            {t.qrDownload}
          </Button>
          <Button type="button" className="flex-1" onClick={onClose}>
            {t.qrClose}
          </Button>
        </div>
      </div>
    </div>
  );
}
