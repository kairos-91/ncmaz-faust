"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import QRCodeStyling from "qr-code-styling";
import { QrCode, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createTable, deleteTable, setTableOccupied, updateTable } from "./actions";
import type { RestaurantTable } from "@/lib/supabase/database.types";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["tablesManager"];

export function TablesManager({
  restaurantId,
  tables,
  publicUrl,
  themeColor,
  locale,
}: {
  restaurantId: string;
  tables: RestaurantTable[];
  publicUrl: string;
  themeColor: string;
  locale: Locale;
}) {
  const t = getDictionary(locale).tablesManager;
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
          t={t}
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

function TableQrModal({
  table,
  publicUrl,
  themeColor,
  t,
  onClose,
}: {
  table: RestaurantTable;
  publicUrl: string;
  themeColor: string;
  t: T;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrExportRef = useRef<QRCodeStyling | null>(null);
  const tableUrl = `${publicUrl}?table=${table.id}`;

  useEffect(() => {
    const qr = new QRCodeStyling({
      width: 220,
      height: 220,
      type: "svg",
      data: tableUrl,
      margin: 8,
      qrOptions: { errorCorrectionLevel: "H" },
      dotsOptions: { type: "rounded", color: themeColor || "#f97316" },
      cornersSquareOptions: { type: "extra-rounded" },
      cornersDotOptions: { type: "dot" },
      backgroundOptions: { color: "#ffffff" },
    });
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      qr.append(containerRef.current);
    }
    qrExportRef.current = new QRCodeStyling({
      width: 1024,
      height: 1024,
      type: "canvas",
      data: tableUrl,
      margin: 40,
      qrOptions: { errorCorrectionLevel: "H" },
      dotsOptions: { type: "rounded", color: themeColor || "#f97316" },
      cornersSquareOptions: { type: "extra-rounded" },
      cornersDotOptions: { type: "dot" },
      backgroundOptions: { color: "#ffffff" },
    });
  }, [tableUrl, themeColor]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl dark:bg-neutral-900">
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
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-500">{t.qrHint}</p>
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
