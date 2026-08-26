"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Category, MenuItem } from "@/lib/supabase/database.types";
import type { ActionState } from "@/app/admin/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { extrasToText, parseExtras } from "@/lib/menu-item-extras";

export function MenuItemForm({
  categories,
  item,
  defaultCategoryId,
  action,
  submitLabel,
  onSuccess,
  t,
}: {
  categories: Category[];
  item?: MenuItem;
  defaultCategoryId?: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  onSuccess?: () => void;
  t: Dictionary["menuItemForm"];
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
        <div className="col-span-2">
          <Label htmlFor="name">{t.nameLabel}</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={item?.name}
            placeholder={t.namePlaceholder}
          />
        </div>
        <div>
          <Label htmlFor="category_id">{t.categoryLabel}</Label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={item?.category_id ?? defaultCategoryId}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="price">{t.priceLabel}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={item?.price}
            placeholder="8.50"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">{t.descriptionLabel}</Label>
        <Textarea
          id="description"
          name="description"
          rows={2}
          defaultValue={item?.description ?? ""}
          placeholder={t.descriptionPlaceholder}
        />
      </div>

      <div>
        <Label htmlFor="tags">{t.tagsLabel}</Label>
        <Input
          id="tags"
          name="tags"
          defaultValue={item?.tags?.join(", ") ?? ""}
          placeholder={t.tagsPlaceholder}
        />
      </div>

      <div>
        <Label htmlFor="extras">{t.extrasLabel}</Label>
        <Textarea
          id="extras"
          name="extras"
          rows={3}
          defaultValue={extrasToText(parseExtras(item?.extras))}
          placeholder={t.extrasPlaceholder}
        />
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
          {t.extrasHint}
        </p>
      </div>

      <div>
        <Label htmlFor="image">{t.imageLabel}</Label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white dark:text-neutral-400 dark:file:bg-white dark:file:text-neutral-900"
        />
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="is_available"
            defaultChecked={item?.is_available ?? true}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.availableLabel}
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            name="is_featured"
            defaultChecked={item?.is_featured ?? false}
            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
          />
          {t.featuredLabel}
        </label>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending}>
        {isPending ? t.saving : submitLabel}
      </Button>
    </form>
  );
}
