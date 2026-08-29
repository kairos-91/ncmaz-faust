"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Search } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { extrasTotal, parseExtras } from "@/lib/menu-item-extras";
import { formatBsAmount, type BcvRate } from "@/lib/bcv-rate";
import {
  PAYMENT_METHOD_META,
  enabledPaymentMethods,
  type PaymentMethodId,
  type PaymentMethodValues,
} from "@/lib/payment-methods";
import type { DeliveryZone } from "@/lib/delivery-zones";
import {
  ConfirmPaymentFields,
  type ConfirmPaymentValues,
} from "@/components/confirm-payment-fields";
import { uploadOrderReceipt } from "@/app/[slug]/actions";
import { createOrderFromAdmin } from "@/app/admin/actions";
import type { Category, MenuItem } from "@/lib/supabase/database.types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["createOrderForm"];
type OrderType = "delivery" | "pickup" | "dine_in";
type Line = { qty: number; extraNames: string[] };
type MethodId = PaymentMethodId | "efectivo";

export function CreateOrderForm({
  restaurantId,
  currency,
  categories,
  items,
  t,
  backLabel,
  paymentMethods,
  bcvRate,
  deliveryZones,
  packagingFeeEnabled,
  packagingFeeAmount,
}: {
  restaurantId: string;
  currency: string;
  categories: Category[];
  items: MenuItem[];
  locale: Locale;
  t: T;
  backLabel: string;
  paymentMethods: PaymentMethodValues;
  bcvRate: BcvRate | null;
  deliveryZones: DeliveryZone[];
  packagingFeeEnabled: boolean;
  packagingFeeAmount: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [orderType, setOrderType] = useState<OrderType>("pickup");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryZoneName, setDeliveryZoneName] = useState("");
  const [deliveryFeeManual, setDeliveryFeeManual] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, Line>>({});
  const [methodId, setMethodId] = useState<MethodId | null>(null);
  const [confirm, setConfirm] = useState<ConfirmPaymentValues>({
    bankPaidFrom: "",
    reference: "",
    amountPaid: "",
  });
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const methods = enabledPaymentMethods(paymentMethods);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, query]);

  const byCategory = categories
    .map((category) => ({
      category,
      items: filteredItems.filter((item) => item.category_id === category.id),
    }))
    .filter(({ items: catItems }) => catItems.length > 0);

  const setQty = (itemId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }
      return { ...prev, [itemId]: { qty, extraNames: prev[itemId]?.extraNames ?? [] } };
    });
  };

  const toggleExtra = (itemId: string, extraName: string) => {
    setCart((prev) => {
      const line = prev[itemId];
      if (!line) return prev;
      const extraNames = line.extraNames.includes(extraName)
        ? line.extraNames.filter((n) => n !== extraName)
        : [...line.extraNames, extraName];
      return { ...prev, [itemId]: { ...line, extraNames } };
    });
  };

  const cartLines = Object.entries(cart)
    .map(([itemId, line]) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return null;
      const unitPrice = item.price + extrasTotal(parseExtras(item.extras), line.extraNames);
      return { itemId, item, ...line, unitPrice };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const itemsTotal = cartLines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const deliveryFeeValue =
    orderType === "delivery"
      ? deliveryZones.length > 0
        ? (deliveryZones.find((z) => z.name === deliveryZoneName)?.fee ?? 0)
        : Number(deliveryFeeManual) || 0
      : 0;
  const packagingFeeValue =
    packagingFeeEnabled && (orderType === "delivery" || orderType === "pickup")
      ? packagingFeeAmount
      : 0;
  const total = itemsTotal + deliveryFeeValue + packagingFeeValue;

  const activeMeta = methodId && methodId !== "efectivo" ? PAYMENT_METHOD_META[methodId] : null;
  const amountBsRaw =
    activeMeta?.convertToVes && bcvRate ? formatBsAmount(total, bcvRate.rate) : null;
  const confirmValues: ConfirmPaymentValues = {
    ...confirm,
    amountPaid: confirm.amountPaid || amountBsRaw || "",
  };

  const submit = () => {
    setError(null);
    if (!customerName.trim() || !customerPhone.trim()) {
      setError(t.missingCustomer);
      return;
    }
    if (cartLines.length === 0) {
      setError(t.missingItems);
      return;
    }

    startTransition(async () => {
      const result = await createOrderFromAdmin(restaurantId, {
        orderType,
        customerName,
        customerPhone,
        address: orderType === "delivery" ? address : undefined,
        tableNumber: orderType === "dine_in" ? tableNumber : undefined,
        deliveryZone: orderType === "delivery" ? deliveryZoneName || undefined : undefined,
        deliveryFee: deliveryFeeValue,
        packagingFee: packagingFeeValue,
        lines: cartLines.map((l) => ({
          itemId: l.itemId,
          qty: l.qty,
          extraNames: l.extraNames,
        })),
        paymentMethod: methodId ?? undefined,
        bankPaidFrom: activeMeta ? confirmValues.bankPaidFrom || undefined : undefined,
        reference: activeMeta ? confirmValues.reference || undefined : undefined,
        amountPaid: activeMeta ? confirmValues.amountPaid || undefined : undefined,
        receiptUrl: activeMeta ? (receiptUrl ?? undefined) : undefined,
      });
      if (result && "error" in result) {
        setError(result.error ?? null);
        return;
      }
      router.push("/admin/orders");
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {t.orderTypeLabel}
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="pickup">{t.orderTypes.pickup}</option>
                <option value="delivery">{t.orderTypes.delivery}</option>
                <option value="dine_in">{t.orderTypes.dine_in}</option>
              </select>
            </div>
            <div />
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {t.customerNameLabel}
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {t.customerPhoneLabel}
              </label>
              <input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="04120000000"
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              />
            </div>
            {orderType === "delivery" && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {t.addressLabel}
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                  />
                </div>
                {deliveryZones.length > 0 ? (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {t.deliveryZoneLabel}
                    </label>
                    <select
                      value={deliveryZoneName}
                      onChange={(e) => setDeliveryZoneName(e.target.value)}
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    >
                      <option value="">{t.selectZone}</option>
                      {deliveryZones.map((zone) => (
                        <option key={zone.name} value={zone.name}>
                          {zone.name} · {formatPrice(zone.fee, currency)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {t.deliveryFeeLabel}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={deliveryFeeManual}
                      onChange={(e) => setDeliveryFeeManual(e.target.value)}
                      className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                    />
                  </div>
                )}
              </>
            )}
            {orderType === "dine_in" && (
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  {t.tableLabel}
                </label>
                <input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            )}
            {packagingFeeValue > 0 && (
              <p className="self-end text-sm font-medium text-neutral-900 dark:text-white">
                {t.packagingFeeLabel}: {formatPrice(packagingFeeValue, currency)}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            />
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.noItems}</p>
          ) : byCategory.length === 0 ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.noResults}</p>
          ) : (
            <div className="space-y-6">
              {byCategory.map(({ category, items: catItems }) => (
                <div key={category.id}>
                  <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
                    {category.name}
                  </h2>
                  <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {catItems.map((item) => {
                      const extras = parseExtras(item.extras);
                      const line = cart[item.id];
                      const qty = line?.qty ?? 0;
                      return (
                        <li key={item.id} className="py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                                {item.name}
                              </p>
                              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                                {formatPrice(item.price, currency)}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                disabled={qty === 0}
                                onClick={() => setQty(item.id, qty - 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 disabled:opacity-30 dark:border-neutral-700 dark:text-neutral-400"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-4 text-center text-sm font-medium text-neutral-900 dark:text-white">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(item.id, qty + 1)}
                                className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          {qty > 0 && extras.length > 0 && (
                            <div className="mt-2 pl-0.5">
                              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                                {t.extrasLabel}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                                {extras.map((extra) => (
                                  <label
                                    key={extra.name}
                                    className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={line?.extraNames.includes(extra.name) ?? false}
                                      onChange={() => toggleExtra(item.id, extra.name)}
                                      className="h-3.5 w-3.5 rounded border-neutral-300 dark:border-neutral-600"
                                    />
                                    {extra.name}
                                    {extra.price > 0 &&
                                      ` (+${formatPrice(extra.price, currency)})`}
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-3 text-sm font-medium text-neutral-900 dark:text-white">
            {t.paymentMethodLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMethodId(methodId === "efectivo" ? null : "efectivo")}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                methodId === "efectivo"
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800",
              )}
            >
              {t.cashLabel}
            </button>
            {methods.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setMethodId(methodId === id ? null : id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  methodId === id
                    ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800",
                )}
              >
                {PAYMENT_METHOD_META[id].label}
              </button>
            ))}
          </div>

          {activeMeta && (
            <div className="mt-4">
              {amountBsRaw && bcvRate && (
                <p className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
                  {t.amountPaidLabel}: Bs {amountBsRaw}
                  <span className="ml-1 font-normal text-neutral-500 dark:text-neutral-400">
                    (tasa BCV Bs {bcvRate.rate.toFixed(2)})
                  </span>
                </p>
              )}
              <ConfirmPaymentFields
                values={confirmValues}
                onChange={setConfirm}
                upload={uploadOrderReceipt.bind(null, restaurantId)}
                onReceiptUploaded={setReceiptUrl}
              />
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-20 space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            {t.cartTitle}
          </h2>
          {cartLines.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-500">{t.emptyCart}</p>
          ) : (
            <ul className="space-y-2">
              {cartLines.map((l) => (
                <li
                  key={l.itemId}
                  className="flex items-start justify-between gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                >
                  <span>
                    {l.qty}x {l.item.name}
                    {l.extraNames.length > 0 && (
                      <span className="text-neutral-500 dark:text-neutral-500">
                        {" "}
                        (+ {l.extraNames.join(", ")})
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 font-medium text-neutral-900 dark:text-white">
                    {formatPrice(l.unitPrice * l.qty, currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {deliveryFeeValue > 0 && (
            <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>{t.deliveryFeeLabel}</span>
              <span>{formatPrice(deliveryFeeValue, currency)}</span>
            </div>
          )}
          {packagingFeeValue > 0 && (
            <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-400">
              <span>{t.packagingFeeLabel}</span>
              <span>{formatPrice(packagingFeeValue, currency)}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {t.total}
            </span>
            <span className="text-base font-semibold text-neutral-900 dark:text-white">
              {formatPrice(total, currency)}
            </span>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="button"
            disabled={isPending}
            onClick={submit}
            className="w-full rounded-full bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            {isPending ? t.submitting : t.submit}
          </button>
          <Link
            href="/admin/orders"
            className="block text-center text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
