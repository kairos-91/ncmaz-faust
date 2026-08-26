"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatBs, formatBsAmount, type BcvRate } from "@/lib/bcv-rate";
import { PaymentDetailsCard } from "@/components/payment-details-card";
import { ReceiptPasteZone } from "./receipt-paste-zone";

const SUPPORT_WHATSAPP = "584120000000";

type Method = {
  id: string;
  label: string;
  convertToVes?: boolean;
  fields: { label: string; value: string }[];
};

const METHODS: Method[] = [
  {
    id: "pago-movil",
    label: "Pago Móvil",
    convertToVes: true,
    fields: [
      { label: "Banco", value: "Banco Nacional de Crédito (BNC)" },
      { label: "Teléfono", value: "0412-0000000" },
      { label: "Cédula/RIF", value: "J-00000000-0" },
    ],
  },
  {
    id: "transferencia",
    label: "Transferencia",
    convertToVes: true,
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
  planPriceUsd,
  bcvRate,
}: {
  restaurantName: string;
  planLabel: string;
  planPrice: string;
  planPriceUsd: number;
  bcvRate: BcvRate | null;
}) {
  const [activeId, setActiveId] = useState(METHODS[0].id);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const active = METHODS.find((m) => m.id === activeId)!;

  const amountBs =
    active.convertToVes && bcvRate
      ? formatBs(planPriceUsd, bcvRate.rate)
      : null;

  const detailRows =
    active.convertToVes && bcvRate
      ? [
          ...active.fields,
          { label: "Monto (Bs)", value: formatBsAmount(planPriceUsd, bcvRate.rate) },
        ]
      : active.fields;

  const message = [
    `Hola! Soy ${restaurantName} y ya realicé el pago del plan ${planLabel} (${planPrice}${amountBs ? ` · ${amountBs}` : ""}) por ${active.label}.`,
    receiptUrl ? `Comprobante: ${receiptUrl}` : "Adjunto el comprobante.",
  ].join(" ");
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

      {active.convertToVes && (
        <div className="mt-4 rounded-xl border border-lime-200 bg-lime-50 p-4 dark:border-lime-400/20 dark:bg-lime-400/5">
          {bcvRate ? (
            <>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Monto a pagar (tasa BCV)
              </p>
              <p className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-white">
                {amountBs}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                Tasa BCV: Bs {bcvRate.rate.toFixed(2)} por USD
                {bcvRate.updatedAt &&
                  ` · actualizada ${new Date(bcvRate.updatedAt).toLocaleDateString("es-VE")}`}
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              No pudimos obtener la tasa BCV del día. Paga el equivalente en
              bolívares a la tasa oficial vigente y notifícanos el monto.
            </p>
          )}
        </div>
      )}

      <div className="mt-4">
        <PaymentDetailsCard rows={detailRows} />
      </div>

      <div className="mt-4">
        <ReceiptPasteZone onUploaded={setReceiptUrl} />
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
