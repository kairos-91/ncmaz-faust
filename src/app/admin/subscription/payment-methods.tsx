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
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { createSubscriptionPayment, uploadPaymentProof } from "./actions";

export function PaymentMethods({
  restaurantId,
  restaurantName,
  plan,
  platformPaymentMethods,
  supportWhatsappNumber,
  bcvRate,
  locale,
  t,
}: {
  restaurantId: string;
  restaurantName: string;
  plan: SubscriptionPlan;
  platformPaymentMethods: PaymentMethodValues;
  supportWhatsappNumber: string;
  bcvRate: BcvRate | null;
  locale: Locale;
  t: Dictionary["subscriptionPaymentMethods"];
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
            ? [{ label: t.amountBsFieldLabel, value: amountBsRaw }]
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
    t.messageIntro(restaurantName, plan.name, planPrice, amountBs ? ` · ${amountBs}` : ""),
    activeMeta && t.messageMethod(activeMeta.label),
    confirmValues.bankPaidFrom && t.messageBankFrom(confirmValues.bankPaidFrom),
    confirmValues.reference && t.messageReference(confirmValues.reference),
    confirmValues.amountPaid && t.messageAmountPaid(confirmValues.amountPaid),
    receiptUrl ? t.messageReceipt(receiptUrl) : t.messageReceiptPending,
  ]
    .filter(Boolean)
    .join(" ");
  const whatsappHref = `https://wa.me/${supportWhatsappNumber}?text=${encodeURIComponent(message)}`;

  if (methods.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.noMethodsTitle(plan.name)}
        </p>
        <a
          href={`https://wa.me/${supportWhatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
        >
          {t.whatsappSupport}
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-900 dark:text-white">
        {t.payPlan(plan.name, planPrice)}
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {t.instructions}
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
                {t.bcvAmountLabel}
              </p>
              <p className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-white">
                {amountBs}
              </p>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
                {t.bcvRateLabel(bcvRate.rate.toFixed(2))}
                {bcvRate.updatedAt &&
                  ` · ${t.bcvUpdatedAt(
                    new Date(bcvRate.updatedAt).toLocaleDateString(
                      locale === "en" ? "en-US" : "es-VE",
                    ),
                  )}`}
              </p>
            </>
          ) : (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t.bcvUnavailable}
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
          minimal
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
        {sending ? t.notifying : t.notify}
      </button>
    </div>
  );
}
