"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { formatBs, type BcvRate } from "@/lib/bcv-rate";
import type { PaymentMethodValues } from "@/lib/payment-methods";
import { extrasTotal, parseExtras } from "@/lib/menu-item-extras";
import { parsePreferences } from "@/lib/menu-item-preferences";
import type { DeliveryZone } from "@/lib/delivery-zones";
import type { Category, MenuItem, RestaurantTable } from "@/lib/supabase/database.types";
import { CheckoutFields } from "./checkout-fields";

type CartLine = {
  itemId: string;
  extraNames: string[];
  preferenceNames: string[];
  qty: number;
  note?: string;
};
type Cart = Record<string, CartLine>;

function cartKey(itemId: string, extraNames: string[], preferenceNames: string[]) {
  return `${itemId}::${[...extraNames].sort().join("|")}::${[...preferenceNames].sort().join("|")}`;
}

function hasDiscount(item: MenuItem) {
  return item.original_price !== null && item.original_price > item.price;
}

function discountPercent(item: MenuItem) {
  return Math.round((1 - item.price / item.original_price!) * 100);
}

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
  deliveryZones,
  packagingFeeEnabled,
  packagingFeeAmount,
  availableTables,
  fixedTable,
  orderingAllowed,
  closedMessage,
  bestSellerNames = [],
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
  deliveryZones: DeliveryZone[];
  packagingFeeEnabled: boolean;
  packagingFeeAmount: number;
  availableTables: RestaurantTable[];
  fixedTable: RestaurantTable | null;
  orderingAllowed: boolean;
  closedMessage: string | null;
  bestSellerNames?: string[];
}) {
  const bestSellerSet = useMemo(() => new Set(bestSellerNames), [bestSellerNames]);
  const canOrder = Boolean(whatsapp) && orderingAllowed;
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);

  const allTags = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      for (const tag of item.tags) {
        const key = tag.trim().toLowerCase();
        if (key && !seen.has(key)) seen.set(key, tag.trim());
      }
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);
      const itemTags = item.tags.map((t) => t.toLowerCase());
      const matchesTags = selectedTags.every((tag) =>
        itemTags.includes(tag.toLowerCase()),
      );
      return matchesQuery && matchesTags;
    });
  }, [items, query, selectedTags]);

  const nonEmptyCategories = categories.filter((c) =>
    filteredItems.some((i) => i.category_id === c.id),
  );
  const [active, setActive] = useState(nonEmptyCategories[0]?.id);

  const setLineQty = (
    itemId: string,
    extraNames: string[],
    preferenceNames: string[],
    qty: number,
  ) => {
    const key = cartKey(itemId, extraNames, preferenceNames);
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[key];
      else next[key] = { itemId, extraNames, preferenceNames, qty, note: prev[key]?.note };
      return next;
    });
  };

  const setLineNote = (
    itemId: string,
    extraNames: string[],
    preferenceNames: string[],
    note: string,
  ) => {
    const key = cartKey(itemId, extraNames, preferenceNames);
    setCart((prev) => {
      const existing = prev[key];
      if (!existing) return prev;
      return { ...prev, [key]: { ...existing, note: note || undefined } };
    });
  };

  const clearCart = () => setCart({});

  const addLine = (
    itemId: string,
    extraNames: string[],
    preferenceNames: string[],
    note?: string,
  ) => {
    const key = cartKey(itemId, extraNames, preferenceNames);
    setCart((prev) => ({
      ...prev,
      [key]: {
        itemId,
        extraNames,
        preferenceNames,
        qty: (prev[key]?.qty ?? 0) + 1,
        note: note || prev[key]?.note,
      },
    }));
  };

  const cartLines = Object.values(cart)
    .map((line) => ({
      item: items.find((i) => i.id === line.itemId),
      qty: line.qty,
      extraNames: line.extraNames,
      preferenceNames: line.preferenceNames,
      note: line.note,
    }))
    .filter(
      (
        line,
      ): line is {
        item: MenuItem;
        qty: number;
        extraNames: string[];
        preferenceNames: string[];
        note: string | undefined;
      } => Boolean(line.item),
    );

  const lineUnitPrice = (item: MenuItem, extraNames: string[]) =>
    item.price + extrasTotal(parseExtras(item.extras), extraNames);

  const total = cartLines.reduce(
    (sum, l) => sum + lineUnitPrice(l.item, l.extraNames) * l.qty,
    0,
  );
  const itemCount = cartLines.reduce((sum, l) => sum + l.qty, 0);

  return (
    <div className="mt-6">
      {closedMessage && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-400">
          🕒 {closedMessage}
        </div>
      )}
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en el menú..."
          className="h-11 w-full rounded-full border border-neutral-200 bg-white pl-10 pr-4 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
        />
      </div>

      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {allTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-transparent text-white"
                    : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400",
                )}
                style={isSelected ? { backgroundColor: themeColor } : undefined}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}

      <div className="no-scrollbar sticky top-0 z-10 -mx-4 flex gap-2 overflow-x-auto bg-neutral-50/95 px-4 py-3 backdrop-blur dark:bg-neutral-950/95">
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
          {query
            ? <>No encontramos platos para &ldquo;{query}&rdquo;.</>
            : "No encontramos platos con esos filtros."}
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
                  .map((item) => {
                    const noExtrasQty =
                      cart[cartKey(item.id, [], [])]?.qty ?? 0;
                    const noExtrasNote = cart[cartKey(item.id, [], [])]?.note ?? "";
                    const totalQty = Object.values(cart)
                      .filter((line) => line.itemId === item.id)
                      .reduce((sum, line) => sum + line.qty, 0);
                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        currency={currency}
                        themeColor={themeColor}
                        bcvRate={bcvRate}
                        orderingEnabled={canOrder}
                        isBestSeller={bestSellerSet.has(item.name)}
                        noExtrasQty={noExtrasQty}
                        noExtrasNote={noExtrasNote}
                        totalQty={totalQty}
                        onNoExtrasQtyChange={(qty) =>
                          setLineQty(item.id, [], [], qty)
                        }
                        onNoExtrasNoteChange={(note) =>
                          setLineNote(item.id, [], [], note)
                        }
                        onAddWithExtras={(extraNames, preferenceNames, note) =>
                          addLine(item.id, extraNames, preferenceNames, note)
                        }
                      />
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}

      {canOrder && itemCount > 0 && !cartOpen && (
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
          <span className="text-right">
            <span className="block text-sm font-semibold">
              Ver pedido · {formatPrice(total, currency)}
            </span>
            {bcvRate && (
              <span className="block text-xs text-white/80">
                {formatBs(total, bcvRate.rate)}
              </span>
            )}
          </span>
        </button>
      )}

      {cartOpen && whatsapp && orderingAllowed && (
        <CartSheet
          lines={cartLines}
          currency={currency}
          themeColor={themeColor}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          whatsapp={whatsapp}
          paymentMethods={paymentMethods}
          bcvRate={bcvRate}
          deliveryZones={deliveryZones}
          packagingFeeEnabled={packagingFeeEnabled}
          packagingFeeAmount={packagingFeeAmount}
          availableTables={availableTables}
          fixedTable={fixedTable}
          onQtyChange={(itemId, extraNames, preferenceNames, qty) =>
            setLineQty(itemId, extraNames, preferenceNames, qty)
          }
          onClose={() => setCartOpen(false)}
          onOrderPlaced={clearCart}
        />
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  currency,
  themeColor,
  bcvRate,
  orderingEnabled,
  isBestSeller,
  noExtrasQty,
  noExtrasNote,
  totalQty,
  onNoExtrasQtyChange,
  onNoExtrasNoteChange,
  onAddWithExtras,
}: {
  item: MenuItem;
  currency: string;
  themeColor: string;
  bcvRate: BcvRate | null;
  orderingEnabled: boolean;
  isBestSeller: boolean;
  noExtrasQty: number;
  noExtrasNote: string;
  totalQty: number;
  onNoExtrasQtyChange: (qty: number) => void;
  onNoExtrasNoteChange: (note: string) => void;
  onAddWithExtras: (
    extraNames: string[],
    preferenceNames: string[],
    note?: string,
  ) => void;
}) {
  const extras = parseExtras(item.extras);
  const hasExtras = extras.length > 0;
  const preferences = parsePreferences(item.preferences);
  const hasPreferences = preferences.length > 0;
  const hasPicker = hasExtras || hasPreferences;
  const discounted = hasDiscount(item);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [pickerNote, setPickerNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);

  const toggleExtra = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const togglePreference = (name: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  };

  const confirmAdd = () => {
    onAddWithExtras(selected, selectedPreferences, pickerNote.trim() || undefined);
    setSelected([]);
    setSelectedPreferences([]);
    setPickerNote("");
    setPickerOpen(false);
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex gap-4">
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
            <span className="shrink-0 text-right">
              {discounted && (
                <span className="flex items-center justify-end gap-1.5">
                  <span className="text-xs text-neutral-400 line-through dark:text-neutral-600">
                    {formatPrice(item.original_price!, currency)}
                  </span>
                  <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                    -{discountPercent(item)}%
                  </span>
                </span>
              )}
              <span className="font-semibold" style={{ color: themeColor }}>
                {formatPrice(item.price, currency)}
              </span>
              {bcvRate && (
                <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                  {formatBs(item.price, bcvRate.rate)}
                </span>
              )}
            </span>
          </div>
          {item.description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
              {item.description}
            </p>
          )}
          {(isBestSeller || item.tags.length > 0) && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {isBestSeller && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-400">
                  ⭐ Más vendido
                </span>
              )}
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
          {orderingEnabled && !hasPicker && (
            <div className="mt-2">
              <div className="flex items-center gap-3">
                {noExtrasQty === 0 ? (
                  <button
                    type="button"
                    onClick={() => onNoExtrasQtyChange(1)}
                    className="rounded-full border px-3 py-1 text-xs font-medium"
                    style={{ borderColor: themeColor, color: themeColor }}
                  >
                    + Agregar
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <QtyButton onClick={() => onNoExtrasQtyChange(noExtrasQty - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </QtyButton>
                      <span className="w-4 text-center text-sm font-medium text-neutral-900 dark:text-white">
                        {noExtrasQty}
                      </span>
                      <QtyButton onClick={() => onNoExtrasQtyChange(noExtrasQty + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </QtyButton>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNoteOpen((v) => !v)}
                      className="text-xs font-medium text-neutral-500 underline-offset-2 hover:underline dark:text-neutral-400"
                    >
                      {noExtrasNote ? "📝 Editar nota" : "📝 Agregar nota"}
                    </button>
                  </>
                )}
              </div>
              {noExtrasQty > 0 && noteOpen && (
                <textarea
                  autoFocus
                  value={noExtrasNote}
                  onChange={(e) => onNoExtrasNoteChange(e.target.value)}
                  onBlur={() => setNoteOpen(false)}
                  maxLength={140}
                  rows={2}
                  placeholder="Ej: sin cebolla, término medio..."
                  className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              )}
              {noExtrasQty > 0 && !noteOpen && noExtrasNote && (
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  📝 {noExtrasNote}
                </p>
              )}
            </div>
          )}
          {orderingEnabled && hasPicker && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="rounded-full border px-3 py-1 text-xs font-medium"
                style={{ borderColor: themeColor, color: themeColor }}
              >
                + Agregar
              </button>
              {totalQty > 0 && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {totalQty} en tu pedido
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {orderingEnabled && hasPicker && pickerOpen && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl dark:bg-neutral-900">
            <div className="relative">
              {item.image_url ? (
                <div className="relative h-52 w-full sm:h-60">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover sm:rounded-t-3xl"
                  />
                </div>
              ) : (
                <div
                  className="h-24 w-full sm:rounded-t-3xl"
                  style={{ backgroundColor: themeColor }}
                />
              )}
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 text-white backdrop-blur hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {item.name}
                  </h2>
                  <span
                    className="shrink-0 font-semibold"
                    style={{ color: themeColor }}
                  >
                    {formatPrice(item.price, currency)}
                  </span>
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {item.description}
                  </p>
                )}
              </div>

              {hasExtras && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Toppings y extras
                  </p>
                  <div className="space-y-1">
                    {extras.map((extra) => (
                      <label
                        key={extra.name}
                        className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-neutral-100 px-3 py-2.5 text-sm text-neutral-700 dark:border-neutral-800 dark:text-neutral-300"
                      >
                        <span className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selected.includes(extra.name)}
                            onChange={() => toggleExtra(extra.name)}
                            className="h-4 w-4 rounded border-neutral-300 dark:border-neutral-600"
                          />
                          {extra.name}
                        </span>
                        {extra.price > 0 && (
                          <span className="text-neutral-500 dark:text-neutral-400">
                            +{formatPrice(extra.price, currency)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {hasPreferences && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    Preferencias
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {preferences.map((pref) => {
                      const isSelected = selectedPreferences.includes(pref);
                      return (
                        <button
                          key={pref}
                          type="button"
                          onClick={() => togglePreference(pref)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                            isSelected
                              ? "border-transparent text-white"
                              : "border-neutral-200 bg-white text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400",
                          )}
                          style={isSelected ? { backgroundColor: themeColor } : undefined}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-1.5 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                  Nota (opcional)
                </p>
                <textarea
                  value={pickerNote}
                  onChange={(e) => setPickerNote(e.target.value)}
                  maxLength={140}
                  rows={2}
                  placeholder="Ej: sin cebolla, término medio..."
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setSelected([]);
                    setSelectedPreferences([]);
                    setPickerNote("");
                    setPickerOpen(false);
                  }}
                  className="text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmAdd}
                  className="rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  Agregar ·{" "}
                  {formatPrice(
                    item.price + extrasTotal(extras, selected),
                    currency,
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
  deliveryZones,
  packagingFeeEnabled,
  packagingFeeAmount,
  availableTables,
  fixedTable,
  onQtyChange,
  onClose,
  onOrderPlaced,
}: {
  lines: {
    item: MenuItem;
    qty: number;
    extraNames: string[];
    preferenceNames: string[];
    note?: string;
  }[];
  currency: string;
  themeColor: string;
  restaurantId: string;
  restaurantName: string;
  whatsapp: string;
  paymentMethods: PaymentMethodValues;
  bcvRate: BcvRate | null;
  deliveryZones: DeliveryZone[];
  packagingFeeEnabled: boolean;
  packagingFeeAmount: number;
  availableTables: RestaurantTable[];
  fixedTable: RestaurantTable | null;
  onQtyChange: (
    itemId: string,
    extraNames: string[],
    preferenceNames: string[],
    qty: number,
  ) => void;
  onClose: () => void;
  onOrderPlaced: () => void;
}) {
  const [justPlacedOrder, setJustPlacedOrder] = useState(false);
  const unitPrice = (item: MenuItem, extraNames: string[]) =>
    item.price + extrasTotal(parseExtras(item.extras), extraNames);
  const total = lines.reduce(
    (sum, l) => sum + unitPrice(l.item, l.extraNames) * l.qty,
    0,
  );

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

        {!justPlacedOrder && (
          <>
            {lines.length === 0 ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Tu pedido está vacío.
              </p>
            ) : (
              <div className="space-y-3">
                {lines.map(({ item, qty, extraNames, preferenceNames, note }) => (
                  <div
                    key={`${item.id}::${extraNames.join("|")}::${preferenceNames.join("|")}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                        {item.name}
                      </p>
                      {extraNames.length > 0 && (
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                          + {extraNames.join(", ")}
                        </p>
                      )}
                      {preferenceNames.length > 0 && (
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                          🚫 {preferenceNames.join(", ")}
                        </p>
                      )}
                      {note && (
                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                          📝 {note}
                        </p>
                      )}
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {formatPrice(unitPrice(item, extraNames), currency)} c/u
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <QtyButton
                        onClick={() =>
                          onQtyChange(item.id, extraNames, preferenceNames, qty - 1)
                        }
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </QtyButton>
                      <span className="w-4 text-center text-sm font-medium text-neutral-900 dark:text-white">
                        {qty}
                      </span>
                      <QtyButton
                        onClick={() =>
                          onQtyChange(item.id, extraNames, preferenceNames, qty + 1)
                        }
                      >
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
              <span className="text-right">
                <span className="block text-lg font-semibold text-neutral-900 dark:text-white">
                  {formatPrice(total, currency)}
                </span>
                {bcvRate && (
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                    {formatBs(total, bcvRate.rate)}
                  </span>
                )}
              </span>
            </div>
          </>
        )}

        {(lines.length > 0 || justPlacedOrder) && (
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
            deliveryZones={deliveryZones}
            packagingFeeEnabled={packagingFeeEnabled}
            packagingFeeAmount={packagingFeeAmount}
            availableTables={availableTables}
            fixedTable={fixedTable}
            onOrderPlaced={() => {
              setJustPlacedOrder(true);
              onOrderPlaced();
            }}
          />
        )}
      </div>
    </div>
  );
}
