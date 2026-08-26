"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_METHOD_IDS,
  PAYMENT_METHOD_META,
  type PaymentMethodValues,
} from "@/lib/payment-methods";
import { updatePlatformPaymentMethods } from "../actions";

export function PlatformPaymentMethodsForm({
  values,
}: {
  values: PaymentMethodValues;
}) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformPaymentMethods,
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      {PAYMENT_METHOD_IDS.map((id) => {
        const meta = PAYMENT_METHOD_META[id];
        const current = values[id];
        return (
          <div
            key={id}
            className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-900 dark:text-white">
              <input
                type="checkbox"
                name={`${id}.enabled`}
                defaultChecked={current.enabled}
                className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
              />
              {meta.label}
              {meta.convertToVes && (
                <span className="rounded-full bg-lime-100 px-2 py-0.5 text-[11px] font-normal text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
                  Se cobra en Bs a tasa BCV
                </span>
              )}
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {meta.fields.map((field) => {
                const value = (current as unknown as Record<string, string>)[
                  field.key
                ];
                return (
                  <div key={field.key}>
                    <Label htmlFor={`${id}.${field.key}`}>{field.label}</Label>
                    {field.options ? (
                      <select
                        id={`${id}.${field.key}`}
                        name={`${id}.${field.key}`}
                        defaultValue={value}
                        className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
                      >
                        <option value="">Selecciona tu banco</option>
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={`${id}.${field.key}`}
                        name={`${id}.${field.key}`}
                        defaultValue={value}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : "Guardar métodos de pago"}
      </Button>
    </form>
  );
}
