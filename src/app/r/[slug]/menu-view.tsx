"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { BcvRate } from "@/lib/bcv-rate";
import type { PaymentMethodValues } from "@/lib/payment-methods";
import type { Category, MenuItem } from "@/lib/supabase/database.types";
import { CheckoutFields } from "./checkout-fields";

type Cart = Record<string, number>;

export function MenuView({
  categories,
  items,
  currency,
  themeColor,
  restaurantId,
  restaurantName,
  whatsapp,
  paymentMethods,
  bcvRate,
}: {
  categories: Category[];
  items: MenuItem[];
  currency: string;
  themeColor: string;
  restaurantId: string;
  restaurantName: string;
  whatsapp: string | null;
  paymentMethods: PaymentMethodValues;
  bcvRate: BcvRate | null;
}) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q),
    );
  }, [items, query]);

  const nonEmptyCategories = categories.filter((c) =>
    filteredItems.some((i) => i.category_id === c.id),
  );
  const [active, setActive] = useState(nonEmptyCategories[0]?.id);

  const setQty = (itemId: string, qty: number) => {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = qty;
      return next;
    });
  };

  const cartLines = Object.entries(cart)
    .map(([itemId, qty]) => ({
      item: items.find((i) => i.id === itemId),
      qty,
    }))
    .filter((line): line is { item: MenuItem; qty: number } => Boolean(line.item));

  const total = cartLines.reduce((sum, l) => sum + l.item.price * l.qty, 0);
  const itemCount = cartLines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <div className="mt-6">
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en el menú..."
          className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />
      </div>

      <div className="sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-neutral-50/95 px-4 py-3 backdrop-blur dark:bg-neutral-950/95">
        {nonEmptyCategories.map((category) => (
          <a
            key={category.id}
            href={`#cat-${category.id}`}
            onClick={() => setActive(category.id)}
            className={cn(
              "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === category.id
                ? "border-transparent text-white"
                : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400",
            )}
            style={
              active === category.id ? { backgroundColor: themeColor } : undefined
            }
          >
            {category.name}
          </a>
        ))}
      </div>

      {nonEmptyCategories.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-600 dark:text-neutral-400">
          No encontramos platos para &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="mt-4 space-y-10">
          {nonEmptyCategories.map((category) => (
            <section key={category.id} id={`cat-${category.id}`}>
              <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
                {category.name}
              </h2>
              <div className="space-y-3">
                {filteredItems
                  .filter((item) => item.category_id === category.id)
                  .map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currency={currency}
                      themeColor={themeColor}
                      orderingEnabled={Boolean(whatsapp)}
                      qty={cart[item.id] ?? 0}
                      onQtyChange={(qty) => setQty(item.id, qty)}
                    />
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {whatsapp && itemCount > 0 && !cartOpen && (
        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-2xl items-center justify-between rounded-2xl px-5 py-4 text-white shadow-lg"
          style={{ backgroundColor: themeColor }}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="h-4 w-4" />
            {itemCount} {itemCount === 1 ? "plato" : "platos"}
          </span>
          <span className="text-sm font-semibold">
            Ver pedido · {formatPrice(total, currency)}
          </span>
        </button>
      )}

      {cartOpen && whatsapp && (
        <CartSheet
          lines={cartLines}
          currency={currency}
          themeColor={themeColor}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          whatsapp={whatsapp}
          paymentMethods={paymentMethods}
          bcvRate={bcvRate}
          onQtyChange={setQty}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  currency,
  themeColor,
  orderingEnabled,
  qty,
  onQtyChange,
}: {
  item: MenuItem;
  currency: string;
  themeColor: string;
  orderingEnabled: boolean;
  qty: number;
  onQtyChange: (qty: number) => void;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {item.image_url && (
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
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
          <h3 className="font-medium text-neutral-900 dark:text-white">
            {item.name}
          </h3>
          <span
            className="shrink-0 font-semibold"
            style={{ color: themeColor }}
          >
            {formatPrice(item.price, currency)}
          </span>
        </div>
        {item.description && (
          <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
            {item.description}
          </p>
        )}
        {item.tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {orderingEnabled && (
          <div className="mt-2 flex items-center gap-3">
            {qty === 0 ? (
              <button
                type="button"
                onClick={() => onQtyChange(1)}
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                + Agregar
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <QtyButton onClick={() => onQtyChange(qty - 1)}>
                  <Minus className="h-3.5 w-3.5" />
                </QtyButton>
                <span className="w-4 text-center text-sm font-medium text-neutral-900 dark:text-white">
                  {qty}
                </span>
                <QtyButton onClick={() => onQtyChange(qty + 1)}>
                  <Plus className="h-3.5 w-3.5" />
                </QtyButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function QtyButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
    >
      {children}
    </button>
  );
}

function CartSheet({
  lines,
  currency,
  themeColor,
  restaurantId,
  restaurantName,
  whatsapp,
  paymentMethods,
  bcvRate,
  onQtyChange,
  onClose,
}: {
  lines: { item: MenuItem; qty: number }[];
  currency: string;
  themeColor: string;
  restaurantId: string;
  restaurantName: string;
  whatsapp: string;
  paymentMethods: PaymentMethodValues;
  bcvRate: BcvRate | null;
  onQtyChange: (itemId: string, qty: number) => void;
  onClose: () => void;
}) {
  const total = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0);

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Tu pedido
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Tu pedido está vacío.
          </p>
        ) : (
          <div className="space-y-3">
            {lines.map(({ item, qty }) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {formatPrice(item.price, currency)} c/u
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <QtyButton onClick={() => onQtyChange(item.id, qty - 1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </QtyButton>
                  <span className="w-4 text-center text-sm font-medium text-neutral-900 dark:text-white">
                    {qty}
                  </span>
                  <QtyButton onClick={() => onQtyChange(item.id, qty + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </QtyButton>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Total
          </span>
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            {formatPrice(total, currency)}
          </span>
        </div>

        {lines.length > 0 && (
          <CheckoutFields
            restaurantId={restaurantId}
            restaurantName={restaurantName}
            themeColor={themeColor}
            currency={currency}
            whatsapp={whatsapp}
            lines={lines}
            total={total}
            paymentMethods={paymentMethods}
            bcvRate={bcvRate}
          />
        )}
      </div>
    </div>
  );
}
