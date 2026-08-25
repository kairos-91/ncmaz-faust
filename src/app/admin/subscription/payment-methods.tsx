"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPORT_WHATSAPP = "584120000000";

type Method = {
  id: string;
  label: string;
  fields: { label: string; value: string }[];
};

const METHODS: Method[] = [
  {
    id: "pago-movil",
    label: "Pago Móvil",
    fields: [
      { label: "Banco", value: "Banco Nacional de Crédito (BNC)" },
      { label: "Teléfono", value: "0412-0000000" },
      { label: "Cédula/RIF", value: "J-00000000-0" },
    ],
  },
  {
    id: "transferencia",
    label: "Transferencia",
    fields: [
      { label: "Banco", value: "Banco Nacional de Crédito (BNC)" },
      { label: "Nº de cuenta", value: "0000-0000-00-0000000000" },
      { label: "Titular", value: "Levery, C.A." },
      { label: "RIF", value: "J-00000000-0" },
    ],
  },
  {
    id: "zelle",
    label: "Zelle",
    fields: [
      { label: "Correo", value: "pagos@levery.app" },
      { label: "Titular", value: "Levery LLC" },
    ],
  },
  {
    id: "binance",
    label: "Binance",
    fields: [
      { label: "Binance Pay ID", value: "000000000" },
      { label: "Red", value: "USDT (BEP20)" },
    ],
  },
  {
    id: "zinli",
    label: "Zinli",
    fields: [{ label: "Usuario/Teléfono", value: "+58 412-0000000" }],
  },
  {
    id: "wally",
    label: "Wally",
    fields: [{ label: "Usuario/Teléfono", value: "+58 412-0000000" }],
  },
];

export function PaymentMethods({
  restaurantName,
  planLabel,
  planPrice,
}: {
  restaurantName: string;
  planLabel: string;
  planPrice: string;
}) {
  const [activeId, setActiveId] = useState(METHODS[0].id);
  const active = METHODS.find((m) => m.id === activeId)!;

  const message = `Hola! Soy ${restaurantName} y ya realicé el pago del plan ${planLabel} (${planPrice}) por ${active.label}. Adjunto el comprobante.`;
  const whatsappHref = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-900 dark:text-white">
        Paga tu plan {planLabel} ({planPrice})
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Elige tu método de pago preferido, realiza el pago y notifícanos por
        WhatsApp para activar tu suscripción.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {METHODS.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setActiveId(method.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              activeId === method.id
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800",
            )}
          >
            {method.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
        {active.fields.map((field) => (
          <CopyField key={field.label} {...field} />
        ))}
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
      >
        Ya realicé el pago, notificar por WhatsApp
      </a>
    </div>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
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
