"use client";

import { useActionState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addStaffMember, removeStaffMember } from "./actions";
import type { Database } from "@/lib/supabase/database.types";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type StaffMember = Database["public"]["Tables"]["restaurant_staff"]["Row"];
type T = Dictionary["common"] & Dictionary["teamManager"];

export function TeamManager({
  restaurantId,
  staff,
  locale,
}: {
  restaurantId: string;
  staff: StaffMember[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.teamManager };
  const boundAdd = addStaffMember.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundAdd, null);

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
        className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row"
      >
        <Input name="email" type="email" placeholder={t.emailPlaceholder} required />
        <Button type="submit" disabled={isPending} className="shrink-0">
          {isPending ? t.adding : t.add}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <p className="text-xs text-neutral-500 dark:text-neutral-500">{t.hint}</p>
    </div>
  );
}

function StaffRow({
  restaurantId,
  member,
  t,
}: {
  restaurantId: string;
  member: StaffMember;
  t: T;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-neutral-800 dark:text-neutral-200">
        {member.email}
      </span>
      <button
        type="button"
        disabled={isPending}
        className="text-xs font-medium text-red-500 hover:text-red-700"
        onClick={() => {
          if (!confirm(t.removeConfirm(member.email))) return;
          startTransition(() => removeStaffMember(restaurantId, member.id));
        }}
      >
        {t.remove}
      </button>
    </li>
  );
}
