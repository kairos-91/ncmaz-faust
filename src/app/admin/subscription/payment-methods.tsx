"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatBs, formatBsAmount, type BcvRate } from "@/lib/bcv-rate";
import {
  PAYMENT_METHOD_META,
  buildPagoMovilLine,
  enabledPaymentMethods,
  type PaymentMethodId,
  type PaymentMethodValues,
} from "@/lib/payment-methods";
import { bankLabel } from "@/lib/venezuelan-banks";
import { formatPlanPrice, type SubscriptionPlan } from "@/lib/subscription-plans";
import {
  PaymentDetailsCard,
  type PaymentDetailRow,
} from "@/components/payment-details-card";
import {
  ConfirmPaymentFields,
  type ConfirmPaymentValues,
} from "@/components/confirm-payment-fields";
import { createSubscriptionPayment, uploadPaymentProof } from "./actions";

const SUPPORT_WHATSAPP = "584120000000";

export function PaymentMethods({
  restaurantId,
  restaurantName,
  plan,
  platformPaymentMethods,
  bcvRate,
}: {
  restaurantId: string;
  restaurantName: string;
  plan: SubscriptionPlan;
  platformPaymentMethods: PaymentMethodValues;
  bcvRate: BcvRate | null;
}) {
  const methods = enabledPaymentMethods(platformPaymentMethods);
  const [methodId, setMethodId] = useState<PaymentMethodId | null>(
    methods[0] ?? null,
  );
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmPaymentValues>({
    bankPaidFrom: "",
    reference: "",
    amountPaid: "",
  });

  const activeMeta = methodId ? PAYMENT_METHOD_META[methodId] : null;
  const activeValues = methodId
    ? (platformPaymentMethods[methodId] as unknown as Record<string, string>)
    : null;

  const amountBs =
    activeMeta?.convertToVes && bcvRate
      ? formatBs(plan.priceUsd, bcvRate.rate)
      : null;
  const amountBsRaw =
    activeMeta?.convertToVes && bcvRate
      ? formatBsAmount(plan.priceUsd, bcvRate.rate)
      : null;

  const confirmValues: ConfirmPaymentValues = {
    ...confirm,
    amountPaid: confirm.amountPaid || amountBsRaw || "",
  };

  const planPrice = `${formatPlanPrice(plan.priceUsd)} ${plan.period}`;

  const detailRows: PaymentDetailRow[] =
    activeMeta && activeValues
      ? [
          ...activeMeta.fields
            .filter((field) => activeValues[field.key])
            .map((field) => ({
              label: field.label,
              value:
                methodId === "pago_movil" && field.key === "banco"
                  ? bankLabel(activeValues[field.key])
                  : activeValues[field.key],
              copyValue: activeValues[field.key],
            })),
          ...(activeMeta.convertToVes && amountBsRaw
            ? [{ label: "Monto (Bs)", value: amountBsRaw }]
            : []),
        ]
      : [];

  const copyAllText =
    methodId === "pago_movil" && activeValues && amountBsRaw
      ? buildPagoMovilLine(
          activeValues as { banco: string; cedula: string; telefono: string },
          amountBsRaw,
        )
      : undefined;

  const message = [
    `Hola! Soy ${restaurantName} y ya realicé el pago del plan ${plan.name} (${planPrice}${amountBs ? ` · ${amountBs}` : ""}).`,
    activeMeta && `Método de pago: ${activeMeta.label}.`,
    confirmValues.bankPaidFrom &&
      `Banco desde el que pagué: ${confirmValues.bankPaidFrom}.`,
    confirmValues.reference && `Referencia: ${confirmValues.reference}.`,
    confirmValues.amountPaid && `Monto pagado: Bs ${confirmValues.amountPaid}.`,
    receiptUrl ? `Comprobante: ${receiptUrl}` : "Adjunto el comprobante.",
  ]
    .filter(Boolean)
    .join(" ");
  const whatsappHref = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;

  if (methods.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Levery todavía no configuró sus métodos de pago. Escríbenos por
          WhatsApp para coordinar el pago de tu plan {plan.name}.
        </p>
        <a
          href={`https://wa.me/${SUPPORT_WHATSAPP}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          Escribir por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-900 dark:text-white">
        Paga tu plan {plan.name} ({planPrice})
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        Elige tu método de pago preferido, realiza el pago y notifícanos por
        WhatsApp para activar tu suscripción.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {methods.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethodId(id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              methodId === id
                ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800",
            )}
          >
            {PAYMENT_METHOD_META[id].label}
          </button>
        ))}
      </div>

      {activeMeta?.convertToVes && (
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

      {activeMeta && (
        <div className="mt-4">
          <PaymentDetailsCard rows={detailRows} copyAllText={copyAllText} />
        </div>
      )}

      <div className="mt-4">
        <ConfirmPaymentFields
          values={confirmValues}
          onChange={setConfirm}
          upload={uploadPaymentProof}
          onReceiptUploaded={setReceiptUrl}
        />
      </div>

      <button
        type="button"
        disabled={sending}
        onClick={async () => {
          setSending(true);
          await createSubscriptionPayment(restaurantId, {
            planId: plan.id,
            planName: plan.name,
            amountUsd: plan.priceUsd,
            paymentMethod: methodId ?? undefined,
            bankPaidFrom: confirmValues.bankPaidFrom || undefined,
            reference: confirmValues.reference || undefined,
            amountPaidBs: confirmValues.amountPaid || undefined,
            receiptUrl: receiptUrl ?? undefined,
          });
          setSending(false);
          window.open(whatsappHref, "_blank", "noopener,noreferrer");
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {sending ? "Enviando..." : "Ya realicé el pago, notificar por WhatsApp"}
      </button>
    </div>
  );
}
