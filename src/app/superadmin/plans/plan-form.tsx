"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/lib/subscription-plans";
import type { ActionState } from "../actions";

export function PlanForm({
  plan,
  action,
  submitLabel,
  onSuccess,
}: {
  plan?: SubscriptionPlan;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  onSuccess?: () => void;
}) {
  const [state, formAction, isPending] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await action(prev, formData);
      if (!result?.error) onSuccess?.();
      return result;
    },
    null,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" required defaultValue={plan?.name} placeholder="Pro" />
        </div>
        <div>
          <Label htmlFor="key">Key (identificador único)</Label>
          <Input id="key" name="key" required defaultValue={plan?.key} placeholder="pro" />
        </div>
        <div>
          <Label htmlFor="price_usd">Precio (USD)</Label>
          <Input
            id="price_usd"
            name="price_usd"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan?.priceUsd ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="old_price_usd">Precio anterior (USD, opcional)</Label>
          <Input
            id="old_price_usd"
            name="old_price_usd"
            type="number"
            step="0.01"
            min="0"
            defaultValue={plan?.oldPriceUsd ?? ""}
          />
        </div>
        <div>
          <Label htmlFor="period">Periodo (texto)</Label>
          <Input id="period" name="period" required defaultValue={plan?.period ?? "/ mes"} placeholder="/ mes" />
        </div>
        <div>
          <Label htmlFor="duration_days">Duración (días)</Label>
          <Input
            id="duration_days"
            name="duration_days"
            type="number"
            min="1"
            required
            defaultValue={plan?.durationDays ?? 30}
          />
        </div>
        <div>
          <Label htmlFor="cta_label">Texto del botón</Label>
          <Input id="cta_label" name="cta_label" required defaultValue={plan?.ctaLabel ?? "Elegir plan"} />
        </div>
        <div>
          <Label htmlFor="sort_order">Orden</Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={plan?.sortOrder ?? 0} />
        </div>
      </div>

      <div>
        <Label htmlFor="features">Características (una por línea)</Label>
        <Textarea
          id="features"
          name="features"
          rows={6}
          defaultValue={plan?.features.join("\n") ?? ""}
          placeholder={"Menú ilimitado\nCódigo QR\nPedidos por WhatsApp"}
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="highlight"
            defaultChecked={plan?.highlight ?? false}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Destacado (&quot;Más popular&quot;)
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={plan?.isActive ?? true}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          Activo (visible públicamente)
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
