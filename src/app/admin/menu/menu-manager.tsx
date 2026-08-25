"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  createMenuItem,
  deleteMenuItem,
  toggleAvailability,
  updateMenuItem,
} from "@/app/admin/actions";
import { MenuItemForm } from "./menu-item-form";
import type { Category, MenuItem } from "@/lib/supabase/database.types";

export function MenuManager({
  restaurantId,
  currency,
  categories,
  items,
}: {
  restaurantId: string;
  currency: string;
  categories: Category[];
  items: MenuItem[];
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const boundCreate = createMenuItem.bind(null, restaurantId);

  const byCategory = categories.map((category) => ({
    category,
    items: items.filter((item) => item.category_id === category.id),
  }));

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        {adding ? (
          <MenuItemForm
            categories={categories}
            action={boundCreate}
            submitLabel="Agregar plato"
            onSuccess={() => setAdding(false)}
          />
        ) : (
          <Button onClick={() => setAdding(true)}>+ Agregar plato</Button>
        )}
      </div>

      {byCategory.map(({ category, items }) => (
        <div key={category.id}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-600">
            {category.name}
          </h2>
          {items.length === 0 ? (
            <p className="text-sm text-neutral-600">Sin platos todavía.</p>
          ) : (
            <ul className="divide-y divide-neutral-100 rounded-2xl border border-neutral-200 bg-white">
              {items.map((item) =>
                editingId === item.id ? (
                  <li key={item.id} className="p-5">
                    <MenuItemForm
                      categories={categories}
                      item={item}
                      action={updateMenuItem.bind(null, restaurantId, item.id)}
                      submitLabel="Guardar cambios"
                      onSuccess={() => setEditingId(null)}
                    />
                    <button
                      className="mt-3 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </button>
                  </li>
                ) : (
                  <MenuItemRow
                    key={item.id}
                    restaurantId={restaurantId}
                    item={item}
                    currency={currency}
                    onEdit={() => setEditingId(item.id)}
                  />
                ),
              )}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function MenuItemRow({
  restaurantId,
  item,
  currency,
  onEdit,
}: {
  restaurantId: string;
  item: MenuItem;
  currency: string;
  onEdit: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {item.image_url && (
          <Image
            src={item.image_url}
            alt={item.name}
            width={48}
            height={48}
            className="h-full w-full object-cover"
            unoptimized
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium text-neutral-900",
            !item.is_available && "text-neutral-400 line-through",
          )}
        >
          {item.name}
        </p>
        <p className="text-sm text-neutral-600">
          {formatPrice(item.price, currency)}
        </p>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(() =>
            toggleAvailability(restaurantId, item.id, !item.is_available),
          )
        }
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
          item.is_available
            ? "bg-green-50 text-green-700"
            : "bg-neutral-100 text-neutral-600",
        )}
      >
        {item.is_available ? "Disponible" : "Agotado"}
      </button>
      <button
        type="button"
        className="shrink-0 text-xs font-medium text-neutral-600 hover:text-neutral-900"
        onClick={onEdit}
      >
        Editar
      </button>
      <button
        type="button"
        disabled={isPending}
        className="shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
        onClick={() => {
          if (!confirm(`¿Eliminar "${item.name}"?`)) return;
          startTransition(() => deleteMenuItem(restaurantId, item.id));
        }}
      >
        Eliminar
      </button>
    </li>
  );
}
