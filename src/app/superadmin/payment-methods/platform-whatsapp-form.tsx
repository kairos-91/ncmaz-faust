"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { updatePlatformWhatsapp } from "../actions";

export function PlatformWhatsappForm({
  whatsappNumber,
  t,
}: {
  whatsappNumber: string;
  t: Dictionary["platformWhatsappForm"];
}) {
  const [state, formAction, isPending] = useActionState(
    updatePlatformWhatsapp,
    null,
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-sm font-medium text-neutral-900 dark:text-white">
        {t.title}
      </p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {t.subtitle}
      </p>

      <form action={formAction} className="mt-4 space-y-1">
        <Label htmlFor="whatsapp_number">{t.label}</Label>
        <Input
          id="whatsapp_number"
          name="whatsapp_number"
          defaultValue={whatsappNumber}
          placeholder={t.placeholder}
          inputMode="numeric"
        />
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {t.hint}
        </p>

        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}

        <Button type="submit" disabled={isPending} className="mt-3">
          {isPending ? t.saving : t.save}
        </Button>
      </form>
    </div>
  );
}
