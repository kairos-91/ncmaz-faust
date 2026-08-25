"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import type { Category, MenuItem } from "@/lib/supabase/database.types";

export function MenuView({
  categories,
  items,
  currency,
  themeColor,
}: {
  categories: Category[];
  items: MenuItem[];
  currency: string;
  themeColor: string;
}) {
  const nonEmptyCategories = categories.filter((c) =>
    items.some((i) => i.category_id === c.id),
  );
  const [active, setActive] = useState(nonEmptyCategories[0]?.id);

  return (
    <div className="mt-6">
      <div className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-neutral-50/95 px-4 py-3 backdrop-blur">
        {nonEmptyCategories.map((category) => (
          <a
            key={category.id}
            href={`#cat-${category.id}`}
            onClick={() => setActive(category.id)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === category.id
                ? "border-transparent text-white"
                : "border-neutral-200 bg-white text-neutral-600",
            )}
            style={
              active === category.id ? { backgroundColor: themeColor } : undefined
            }
          >
            {category.name}
          </a>
        ))}
      </div>

      <div className="mt-4 space-y-10">
        {nonEmptyCategories.map((category) => (
          <section key={category.id} id={`cat-${category.id}`}>
            <h2 className="mb-3 text-lg font-semibold text-neutral-900">
              {category.name}
            </h2>
            <div className="space-y-3">
              {items
                .filter((item) => item.category_id === category.id)
                .map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    currency={currency}
                    themeColor={themeColor}
                  />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function MenuItemCard({
  item,
  currency,
  themeColor,
}: {
  item: MenuItem;
  currency: string;
  themeColor: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm">
      {item.image_url && (
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
          <Image
            src={item.image_url}
            alt={item.name}
            width={80}
            height={80}
            className="h-full w-full object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-neutral-900">{item.name}</h3>
          <span
            className="shrink-0 font-semibold"
            style={{ color: themeColor }}
          >
            {formatPrice(item.price, currency)}
          </span>
        </div>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-neutral-500">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
