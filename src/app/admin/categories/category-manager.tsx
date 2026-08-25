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

export function CategoryManager({
  restaurantId,
  categories,
}: {
  restaurantId: string;
  categories: Category[];
}) {
  const boundCreate = createCategory.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundCreate, null);

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
        {categories.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-400">
            Aún no tienes categorías.
          </li>
        )}
        {categories.map((category, index) => (
          <CategoryRow
            key={category.id}
            restaurantId={restaurantId}
            category={category}
            isFirst={index === 0}
            isLast={index === categories.length - 1}
          />
        ))}
      </ul>

      <form action={formAction} className="flex gap-2">
        <Input name="name" placeholder="Nueva categoría (ej. Postres)" required />
        <Button type="submit" disabled={isPending}>
          Agregar
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
}: {
  restaurantId: string;
  category: Category;
  isFirst: boolean;
  isLast: boolean;
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
            Guardar
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
          >
            Cancelar
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
            className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
            onClick={() =>
              startTransition(() => moveCategory(restaurantId, category.id, "up"))
            }
            aria-label="Mover arriba"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast || isPending}
            className="text-neutral-400 hover:text-neutral-900 disabled:opacity-30"
            onClick={() =>
              startTransition(() => moveCategory(restaurantId, category.id, "down"))
            }
            aria-label="Mover abajo"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <span className="text-sm font-medium text-neutral-800">
          {category.name}
        </span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
          onClick={() => setEditing(true)}
        >
          Editar
        </button>
        <button
          type="button"
          disabled={isPending}
          className="text-xs font-medium text-red-500 hover:text-red-700"
          onClick={() => {
            if (!confirm(`¿Eliminar "${category.name}" y sus platos?`)) return;
            startTransition(() => deleteCategory(restaurantId, category.id));
          }}
        >
          Eliminar
        </button>
      </div>
    </li>
  );
}
