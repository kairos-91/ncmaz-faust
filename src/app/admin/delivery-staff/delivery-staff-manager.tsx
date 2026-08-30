"use client";

import { useActionState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createDeliveryStaff,
  deleteDeliveryStaff,
  toggleDeliveryStaffActive,
} from "./actions";
import type { DeliveryStaff } from "@/lib/supabase/database.types";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["deliveryStaffManager"];

export function DeliveryStaffManager({
  restaurantId,
  staff,
  locale,
}: {
  restaurantId: string;
  staff: DeliveryStaff[];
  locale: Locale;
}) {
  const t = getDictionary(locale).deliveryStaffManager;
  const boundCreate = createDeliveryStaff.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {staff.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t.empty}
          </li>
        )}
        {staff.map((member) => (
          <StaffRow key={member.id} restaurantId={restaurantId} member={member} t={t} />
        ))}
      </ul>

      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Label htmlFor="name">{t.nameLabel}</Label>
          <Input id="name" name="name" placeholder={t.namePlaceholder} required />
        </div>
        <div className="flex-1">
          <Label htmlFor="phone">{t.phoneLabel}</Label>
          <Input id="phone" name="phone" placeholder={t.phonePlaceholder} />
        </div>
        <Button type="submit" disabled={isPending} className="shrink-0">
          {isPending ? t.adding : t.add}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

function StaffRow({
  restaurantId,
  member,
  t,
}: {
  restaurantId: string;
  member: DeliveryStaff;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          {member.name}
        </p>
        {member.phone && (
          <p className="text-xs text-neutral-500 dark:text-neutral-500">{member.phone}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            startTransition(() =>
              toggleDeliveryStaffActive(restaurantId, member.id, !member.is_active),
            )
          }
          className={
            member.is_active
              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-400/10 dark:text-green-400"
              : "rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }
        >
          {member.is_active ? t.active : t.inactive}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="text-xs font-medium text-red-500 hover:text-red-700"
          onClick={() => {
            if (!confirm(t.deleteConfirm(member.name))) return;
            startTransition(() => deleteDeliveryStaff(restaurantId, member.id));
          }}
        >
          {t.delete}
        </button>
      </div>
    </li>
  );
}
