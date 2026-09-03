"use client";

import { useRef, useState, useTransition, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { updateRestaurantCoverPosition, updateRestaurantLogo } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Restaurant } from "@/lib/supabase/database.types";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type Position = { x: number; y: number };

const POSITION_RE = /^(\d{1,3}(?:\.\d+)?)% (\d{1,3}(?:\.\d+)?)%$/;

function parsePosition(value: string): Position {
  const match = POSITION_RE.exec(value);
  if (!match) return { x: 50, y: 50 };
  return { x: Number(match[1]), y: Number(match[2]) };
}

function formatPosition(position: Position): string {
  return `${position.x.toFixed(1)}% ${position.y.toFixed(1)}%`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function CoverUploader({
  restaurant,
  t,
}: {
  restaurant: Restaurant;
  t: Dictionary["coverUploader"];
}) {
  const [coverUrl, setCoverUrl] = useState(restaurant.cover_url);
  const [savedPosition, setSavedPosition] = useState(() =>
    parsePosition(restaurant.cover_position),
  );
  const [position, setPosition] = useState(savedPosition);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOrigin = useRef<{ pointerX: number; pointerY: number; position: Position } | null>(
    null,
  );

  const handleChange = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const formData = new FormData();
    formData.set("file", file);
    startUpload(async () => {
      const result = await updateRestaurantLogo(restaurant.id, "cover_url", formData);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if (!("url" in result && result.url)) return;
      setCoverUrl(result.url);
      // Una imagen nueva no tiene relación con el offset guardado para
      // la anterior — la volvemos a centrar (y lo persistimos, para que
      // el menú público no muestre esta portada recién subida recortada
      // con la posición de la portada vieja).
      const centered = { x: 50, y: 50 };
      setPosition(centered);
      setSavedPosition(centered);
      await updateRestaurantCoverPosition(restaurant.id, formatPosition(centered));
    });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!coverUrl) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { pointerX: e.clientX, pointerY: e.clientY, position };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragOrigin.current.pointerX;
    const deltaY = e.clientY - dragOrigin.current.pointerY;
    setPosition({
      x: clamp(dragOrigin.current.position.x - (deltaX / rect.width) * 100, 0, 100),
      y: clamp(dragOrigin.current.position.y - (deltaY / rect.height) * 100, 0, 100),
    });
  };

  const endDrag = () => {
    dragOrigin.current = null;
    setDragging(false);
  };

  const dirty = position.x !== savedPosition.x || position.y !== savedPosition.y;

  const savePosition = () => {
    setError(null);
    startSaving(async () => {
      const result = await updateRestaurantCoverPosition(
        restaurant.id,
        formatPosition(position),
      );
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setSavedPosition(position);
    });
  };

  const cancelPosition = () => setPosition(savedPosition);

  return (
    <div>
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn(
          "relative flex h-28 w-full touch-none items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 sm:h-36 dark:border-neutral-700 dark:bg-neutral-800",
          coverUrl && (dragging ? "cursor-grabbing" : "cursor-grab"),
        )}
        style={!coverUrl ? { backgroundColor: restaurant.theme_color } : undefined}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={t.alt}
            fill
            draggable={false}
            className="select-none object-cover"
            style={{ objectPosition: `${position.x}% ${position.y}%` }}
            unoptimized
          />
        ) : (
          <span className="text-xs text-white/80">{t.noCover}</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
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
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? t.uploading : t.change}
        </Button>
        {coverUrl && dirty && (
          <>
            <Button type="button" size="sm" disabled={isSaving} onClick={savePosition}>
              {isSaving ? t.savingPosition : t.savePosition}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onClick={cancelPosition}
            >
              {t.cancelPosition}
            </Button>
          </>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">{t.sizeHint}</p>
      {coverUrl && (
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.repositionHint}
        </p>
      )}
    </div>
  );
}
