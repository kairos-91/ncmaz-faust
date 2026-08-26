"use client";

import { useActionState, useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createCategory,
  deleteCategory,
  moveCategory,
  renameCategory,
  type ActionState,
} from "@/app/admin/actions";
import type { Category } from "@/lib/supabase/database.types";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["categoryManager"];

export function CategoryManager({
  restaurantId,
  categories,
  locale,
}: {
  restaurantId: string;
  categories: Category[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.categoryManager };
  const boundCreate = createCategory.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {categories.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t.empty}
          </li>
        )}
        {categories.map((category, index) => (
          <CategoryRow
            key={category.id}
            restaurantId={restaurantId}
            category={category}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
            t={t}
          />
        ))}
      </ul>

      <form action={formAction} className="flex gap-2">
        <Input name="name" placeholder={t.newPlaceholder} required />
        <Button type="submit" disabled={isPending}>
          {t.add}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

function CategoryRow({
  restaurantId,
  category,
  isFirst,
  isLast,
  t,
}: {
  restaurantId: string;
  category: Category;
  isFirst: boolean;
  isLast: boolean;
  t: T;
}) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await renameCategory(
        restaurantId,
        category.id,
        prev,
        formData,
      );
      if (!result?.error) setEditing(false);
      return result;
    },
    null,
  );

  if (editing) {
    return (
      <li className="flex items-center gap-2 px-4 py-3">
        <form action={formAction} className="flex flex-1 gap-2">
          <Input name="name" defaultValue={category.name} autoFocus />
          <Button type="submit" size="sm" variant="secondary">
            {t.save}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            {t.cancel}
          </Button>
        </form>
        {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button
            type="button"
            disabled={isFirst || isPending}
            className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30 dark:text-neutral-500 dark:hover:text-white"
            onClick={() =>
              startTransition(() => moveCategory(restaurantId, category.id, "up"))
            }
            aria-label={t.moveUp}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast || isPending}
            className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30 dark:text-neutral-500 dark:hover:text-white"
            onClick={() =>
              startTransition(() => moveCategory(restaurantId, category.id, "down"))
            }
            aria-label={t.moveDown}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
          {category.name}
        </span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          onClick={() => setEditing(true)}
        >
          {t.edit}
        </button>
        <button
          type="button"
          disabled={isPending}
          className="text-xs font-medium text-red-500 hover:text-red-700"
          onClick={() => {
            if (!confirm(t.deleteConfirm(category.name))) return;
            startTransition(() => deleteCategory(restaurantId, category.id));
          }}
        >
          {t.delete}
        </button>
      </div>
    </li>
  );
}
