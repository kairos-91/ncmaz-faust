"use client";

import { useMemo, useState } from "react";
import { Bike, Check, Store, UtensilsCrossed } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { formatBs, formatBsAmount, type BcvRate } from "@/lib/bcv-rate";
import {
  PAYMENT_METHOD_META,
  buildPagoMovilLine,
  enabledPaymentMethods,
  type PaymentMethodId,
  type PaymentMethodValues,
} from "@/lib/payment-methods";
import { bankLabel } from "@/lib/venezuelan-banks";
import { extrasTotal, parseExtras } from "@/lib/menu-item-extras";
import type { DeliveryZone } from "@/lib/delivery-zones";
import { computeDiscount, type Coupon } from "@/lib/coupons";
import { PaymentDetailsCard } from "@/components/payment-details-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ConfirmPaymentFields,
  type ConfirmPaymentValues,
} from "@/components/confirm-payment-fields";
import { createOrder, uploadOrderReceipt } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { MenuItem } from "@/lib/supabase/database.types";

type OrderType = "delivery" | "pickup" | "dine_in";

const ORDER_TYPES: { id: OrderType; label: string; icon: typeof Bike }[] = [
  { id: "delivery", label: "Delivery", icon: Bike },
  { id: "pickup", label: "Para retirar", icon: Store },
  { id: "dine_in", label: "Comer en el local", icon: UtensilsCrossed },
];

const ORDER_TYPE_EMOJI: Record<OrderType, string> = {
  delivery: "🛵",
  pickup: "🥡",
  dine_in: "🍽️",
};

const DIVIDER = "┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄";

export function CheckoutFields({
  restaurantId,
  restaurantName,
  themeColor,
  currency,
  whatsapp,
  lines,
  total,
  paymentMethods,
  bcvRate,
  deliveryZones,
  packagingFeeEnabled,
  packagingFeeAmount,
  onOrderPlaced,
}: {
  restaurantId: string;
  restaurantName: string;
  themeColor: string;
  currency: string;
  whatsapp: string;
  lines: { item: MenuItem; qty: number; extraNames: string[]; note?: string }[];
  total: number;
  paymentMethods: PaymentMethodValues;
  bcvRate: BcvRate | null;
  deliveryZones: DeliveryZone[];
  packagingFeeEnabled: boolean;
  packagingFeeAmount: number;
  onOrderPlaced: () => void;
}) {
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [table, setTable] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("");
  const [methodId, setMethodId] = useState<PaymentMethodId | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedWhatsappHref, setPlacedWhatsappHref] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmPaymentValues>({
    bankPaidFrom: "",
    reference: "",
    amountPaid: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const methods = enabledPaymentMethods(paymentMethods);
  const deliveryFee =
    orderType === "delivery"
      ? (deliveryZones.find((z) => z.name === deliveryZone)?.fee ?? 0)
      : 0;
  const discountAmount = appliedCoupon ? computeDiscount(appliedCoupon, total) : 0;
  const packagingFee =
    packagingFeeEnabled && (orderType === "delivery" || orderType === "pickup")
      ? packagingFeeAmount
      : 0;
  const grandTotal = total + deliveryFee + packagingFee - discountAmount;

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    setCouponError(null);
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select("id, code, discount_type, discount_value, is_active, expires_at")
      .eq("restaurant_id", restaurantId)
      .eq("code", code)
      .maybeSingle();
    setCheckingCoupon(false);
    if (!data) {
      setCouponError("Ese cupón no existe o ya venció.");
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(data);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const activeMeta = methodId ? PAYMENT_METHOD_META[methodId] : null;
  const activeValues = methodId
    ? (paymentMethods[methodId] as unknown as Record<string, string>)
    : null;
  const amountBs =
    activeMeta?.convertToVes && bcvRate ? formatBs(grandTotal, bcvRate.rate) : null;
  const amountBsRaw =
    activeMeta?.convertToVes && bcvRate
      ? formatBsAmount(grandTotal, bcvRate.rate)
      : null;

  const confirmValues: ConfirmPaymentValues = {
    ...confirm,
    amountPaid: confirm.amountPaid || amountBsRaw || "",
  };

  const canSubmit =
    lines.length > 0 &&
    customerName.trim().length > 0 &&
    customerPhone.trim().length > 0 &&
    Boolean(orderType) &&
    (orderType !== "delivery" || address.trim().length > 0) &&
    (orderType !== "delivery" ||
      deliveryZones.length === 0 ||
      deliveryZone.length > 0) &&
    (methods.length === 0 || Boolean(methodId));

  const whatsappHref = useMemo(() => {
    if (!canSubmit || !orderType) return "#";

    const orderTypeLabel = ORDER_TYPES.find((o) => o.id === orderType)?.label;
    const lineText = lines
      .map((l) => {
        const unitPrice =
          l.item.price + extrasTotal(parseExtras(l.item.extras), l.extraNames);
        const extrasText =
          l.extraNames.length > 0 ? `\n   ➕ ${l.extraNames.join(", ")}` : "";
        const noteText = l.note ? `\n   📝 ${l.note}` : "";
        return `▪️ *${l.qty}x* ${l.item.name}${extrasText}${noteText}\n   ${formatPrice(unitPrice * l.qty, currency)}`;
      })
      .join("\n");

    const parts = [
      `🔔 *¡NUEVO PEDIDO!* 🔔`,
      `🏪 ${restaurantName}`,
      DIVIDER,
      `🧾 *Pedido*`,
      lineText,
      DIVIDER,
      `💰 *Resumen*`,
      `Subtotal: ${formatPrice(total, currency)}`,
    ];
    if (orderType === "delivery" && deliveryZone) {
      parts.push(
        `🛵 Envío (${deliveryZone}): ${formatPrice(deliveryFee, currency)}`,
      );
    }
    if (packagingFee > 0) {
      parts.push(`🍱 Empaque: ${formatPrice(packagingFee, currency)}`);
    }
    if (appliedCoupon) {
      parts.push(
        `🎟️ Cupón (${appliedCoupon.code}): -${formatPrice(discountAmount, currency)}`,
      );
    }
    parts.push(
      `✅ *Total: ${formatPrice(grandTotal, currency)}${amountBs ? ` (${amountBs})` : ""}*`,
      DIVIDER,
      `📦 *Entrega*`,
      `${ORDER_TYPE_EMOJI[orderType]} ${orderTypeLabel}`,
    );
    if (orderType === "delivery" && deliveryZone) {
      parts.push(`📍 Zona: ${deliveryZone}`);
    }
    if (orderType === "delivery" && address.trim()) {
      parts.push(`🏠 Dirección: ${address.trim()}`);
    }
    if (orderType === "dine_in" && table.trim()) {
      parts.push(`🍽️ Mesa: ${table.trim()}`);
    }
    if (activeMeta) {
      parts.push(DIVIDER, `💳 *Pago*`, activeMeta.label);
      if (confirmValues.bankPaidFrom) {
        parts.push(`🏦 Banco: ${confirmValues.bankPaidFrom}`);
      }
      if (confirmValues.reference) {
        parts.push(`🔢 Referencia: ${confirmValues.reference}`);
      }
      if (confirmValues.amountPaid) {
        parts.push(`💵 Monto pagado: Bs ${confirmValues.amountPaid}`);
      }
      parts.push(
        receiptUrl ? `🧾 Comprobante: ${receiptUrl}` : "🧾 Adjunto el comprobante.",
      );
    }
    parts.push(
      DIVIDER,
      `👤 *Cliente*`,
      customerName.trim(),
      `📱 ${customerPhone.trim()}`,
      DIVIDER,
      `🙏 Gracias por tu compra`,
    );

    const phone = whatsapp.replace(/[^0-9]/g, "");
    return `https://wa.me/${phone}?text=${encodeURIComponent(parts.join("\n"))}`;
  }, [
    canSubmit,
    orderType,
    lines,
    currency,
    total,
    grandTotal,
    deliveryFee,
    deliveryZone,
    packagingFee,
    appliedCoupon,
    discountAmount,
    amountBs,
    address,
    table,
    activeMeta,
    confirmValues.bankPaidFrom,
    confirmValues.reference,
    confirmValues.amountPaid,
    receiptUrl,
    restaurantName,
    customerName,
    customerPhone,
    whatsapp,
  ]);

  if (orderPlaced) {
    return (
      <div className="mt-5 flex flex-col items-center gap-3 border-t border-neutral-100 pt-6 text-center dark:border-neutral-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-neutral-900 dark:text-white">
            ¡Pedido enviado con éxito!
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Ahora envíalo por WhatsApp para que el restaurante lo reciba y confirme.
          </p>
        </div>
        <a
          href={placedWhatsappHref ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: themeColor }}
        >
          <Check className="h-4 w-4" />
          Enviar pedido por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="customerName">Tu nombre</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="María Pérez"
          />
        </div>
        <div>
          <Label htmlFor="customerPhone">Tu teléfono</Label>
          <Input
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="04120000000"
            inputMode="tel"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-neutral-900 dark:text-white">
          ¿Cómo lo quieres?
        </p>
        <div className="grid grid-cols-3 gap-2">
          {ORDER_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setOrderType(id)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-center text-xs font-medium",
                orderType === id
                  ? "border-transparent text-white"
                  : "border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
              )}
              style={
                orderType === id ? { backgroundColor: themeColor } : undefined
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {packagingFee > 0 && (
        <p className="text-sm font-medium text-neutral-900 dark:text-white">
          Empaque: {formatPrice(packagingFee, currency)}
        </p>
      )}

      {orderType === "delivery" && (
        <div className="space-y-3">
          {deliveryZones.length > 0 && (
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
                Zona de entrega
              </label>
              <select
                value={deliveryZone}
                onChange={(e) => setDeliveryZone(e.target.value)}
                className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">Selecciona tu zona</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name} · {formatPrice(zone.fee, currency)}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Dirección de entrega
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Calle, casa/edificio, urbanización..."
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
          </div>
          {deliveryFee > 0 && (
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              Envío: {formatPrice(deliveryFee, currency)} · Total con envío:{" "}
              {formatPrice(grandTotal, currency)}
            </p>
          )}
        </div>
      )}

      {orderType === "dine_in" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Mesa (opcional)
          </label>
          <input
            value={table}
            onChange={(e) => setTable(e.target.value)}
            placeholder="Nº de mesa"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
          ¿Tienes un cupón?
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm dark:border-green-900/40 dark:bg-green-900/20">
            <span className="font-medium text-green-700 dark:text-green-400">
              {appliedCoupon.code} aplicado · -{formatPrice(discountAmount, currency)}
            </span>
            <button
              type="button"
              onClick={removeCoupon}
              className="text-xs font-medium text-green-700 underline dark:text-green-400"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Código de descuento"
              className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
            />
            <button
              type="button"
              disabled={checkingCoupon || !couponCode.trim()}
              onClick={applyCoupon}
              className="shrink-0 rounded-lg border border-neutral-200 px-4 text-sm font-medium text-neutral-700 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300"
            >
              {checkingCoupon ? "..." : "Aplicar"}
            </button>
          </div>
        )}
        {couponError && (
          <p className="mt-1 text-xs text-red-600">{couponError}</p>
        )}
      </div>

      {methods.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-neutral-900 dark:text-white">
            ¿Cómo vas a pagar?
          </p>
          <div className="flex flex-wrap gap-2">
            {methods.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setMethodId(id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium",
                  methodId === id
                    ? "border-transparent text-white"
                    : "border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
                )}
                style={
                  methodId === id ? { backgroundColor: themeColor } : undefined
                }
              >
                {PAYMENT_METHOD_META[id].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeMeta && activeValues && (
        <div className="space-y-3">
          {amountBs && (
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Monto a pagar: {amountBs}
              {bcvRate && (
                <span className="ml-1 font-normal text-neutral-500 dark:text-neutral-400">
                  (tasa BCV Bs {bcvRate.rate.toFixed(2)})
                </span>
              )}
            </p>
          )}
          <PaymentDetailsCard
            rows={[
              ...activeMeta.fields
                .filter((field) => activeValues[field.key])
                .map((field) => ({
                  label: field.label,
                  value:
                    methodId === "pago_movil" && field.key === "banco"
                      ? bankLabel(activeValues[field.key])
                      : activeValues[field.key],
                  copyValue: activeValues[field.key],
                })),
              ...(activeMeta.convertToVes && bcvRate
                ? [{ label: "Monto (Bs)", value: formatBsAmount(grandTotal, bcvRate.rate) }]
                : []),
            ]}
            copyAllText={
              methodId === "pago_movil" && bcvRate
                ? buildPagoMovilLine(
                    activeValues as { banco: string; cedula: string; telefono: string },
                    formatBsAmount(grandTotal, bcvRate.rate),
                  )
                : undefined
            }
          />
          <ConfirmPaymentFields
            values={confirmValues}
            onChange={setConfirm}
            upload={uploadOrderReceipt.bind(null, restaurantId)}
            onReceiptUploaded={setReceiptUrl}
          />
        </div>
      )}

      {canSubmit && (
        <button
          type="button"
          disabled={sending}
          onClick={async () => {
            setSending(true);
            await createOrder(restaurantId, {
              orderType: orderType!,
              customerName,
              customerPhone,
              address: orderType === "delivery" ? address : undefined,
              tableNumber: orderType === "dine_in" ? table : undefined,
              deliveryZone: orderType === "delivery" ? deliveryZone || undefined : undefined,
              deliveryFee,
              packagingFee: packagingFee || undefined,
              couponCode: appliedCoupon?.code,
              discountAmount: discountAmount || undefined,
              items: lines.map((l) => ({
                name: l.item.name,
                qty: l.qty,
                unitPrice:
                  l.item.price +
                  extrasTotal(parseExtras(l.item.extras), l.extraNames),
                extraNames: l.extraNames,
                note: l.note,
              })),
              total: grandTotal,
              currency,
              paymentMethod: methodId ?? undefined,
              bankPaidFrom: confirmValues.bankPaidFrom || undefined,
              reference: confirmValues.reference || undefined,
              amountPaid: confirmValues.amountPaid || undefined,
              receiptUrl: receiptUrl ?? undefined,
            });
            setSending(false);
            setPlacedWhatsappHref(whatsappHref);
            setOrderPlaced(true);
            onOrderPlaced();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          style={{ backgroundColor: themeColor }}
        >
          <Check className="h-4 w-4" />
          {sending ? "Enviando..." : "Enviar pedido"}
        </button>
      )}
    </div>
  );
}
