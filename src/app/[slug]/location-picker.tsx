"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, X } from "lucide-react";

export type LatLng = { lat: number; lng: number };

export function LocationPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (value: LatLng | null) => void;
}) {
  const [status, setStatus] = useState<"idle" | "locating">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerRef = useRef<Leaflet.Marker | null>(null);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setErrorMessage("Tu navegador no soporta geolocalización.");
      return;
    }
    setStatus("locating");
    setErrorMessage(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("idle");
      },
      (err) => {
        setStatus("idle");
        setErrorMessage(
          err.code === err.PERMISSION_DENIED
            ? "No diste permiso de ubicación. Puedes escribir tu dirección abajo."
            : "No pudimos obtener tu ubicación. Intenta de nuevo o escribe tu dirección.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Leaflet toca `window` apenas se importa, así que no puede vivir en un
  // import estático (rompe el paso de SSR de este client component) — se
  // carga en el navegador, dentro del efecto, solo cuando hace falta.
  useEffect(() => {
    if (!value || !mapContainerRef.current) return;
    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !mapContainerRef.current) return;
      const L = mod.default;

      if (!mapRef.current) {
        const icon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        const map = L.map(mapContainerRef.current).setView([value.lat, value.lng], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(map);
        const marker = L.marker([value.lat, value.lng], { draggable: true, icon }).addTo(
          map,
        );
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onChange({ lat: pos.lat, lng: pos.lng });
        });
        mapRef.current = map;
        markerRef.current = marker;
      } else {
        mapRef.current.setView([value.lat, value.lng]);
        markerRef.current?.setLatLng([value.lat, value.lng]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [value?.lat, value?.lng]);

  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-2">
      {!value ? (
        <button
          type="button"
          onClick={requestLocation}
          disabled={status === "locating"}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <LocateFixed className="h-4 w-4" />
          {status === "locating" ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
        </button>
      ) : (
        <div className="space-y-2">
          <div
            ref={mapContainerRef}
            className="h-48 w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700"
          />
          <div className="flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-500">
            <span>Arrastra el pin para ajustar tu ubicación exacta.</span>
            <button
              type="button"
              onClick={() => {
                mapRef.current?.remove();
                mapRef.current = null;
                markerRef.current = null;
                onChange(null);
              }}
              className="flex shrink-0 items-center gap-1 font-medium text-red-500 hover:text-red-700"
            >
              <X className="h-3.5 w-3.5" />
              Quitar
            </button>
          </div>
        </div>
      )}
      {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
    </div>
  );
}
