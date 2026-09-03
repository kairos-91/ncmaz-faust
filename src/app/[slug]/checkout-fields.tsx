"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  computeDiscount,
  parseValidDays,
  parseValidPaymentMethods,
  validateCoupon,
  type Coupon,
} from "@/lib/coupons";
import { PaymentDetailsCard } from "@/components/payment-details-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ConfirmPaymentFields,
  type ConfirmPaymentValues,
} from "@/components/confirm-payment-fields";
import { createOrder, uploadOrderReceipt } from "./actions";
import { createClient } from "@/lib/supabase/client";
import type { MenuItem, RestaurantTable } from "@/lib/supabase/database.types";
import { LocationPicker, type LatLng } from "./location-picker";
import { buildMapsUrl } from "@/lib/maps";

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
  availableTables,
  fixedTable,
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
  availableTables: RestaurantTable[];
  fixedTable: RestaurantTable | null;
  onOrderPlaced: () => void;
}) {
  // Si el pedido viene del QR de una mesa específica, el tipo de pedido
  // queda fijo en "Comer en el local" para esa mesa — no se muestran
  // delivery ni para retirar (ese QR es solo para pedir desde la mesa).
  const [orderType, setOrderType] = useState<OrderType | null>(
    fixedTable ? "dine_in" : null,
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [location, setLocation] = useState<LatLng | null>(null);
  const [table, setTable] = useState(fixedTable?.name ?? "");
  const [tableId, setTableId] = useState<string | null>(fixedTable?.id ?? null);
  const [deliveryZone, setDeliveryZone] = useState("");
  const [methodId, setMethodId] = useState<PaymentMethodId | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedWhatsappHref, setPlacedWhatsappHref] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showMethodError, setShowMethodError] = useState(false);
  const paymentDetailsRef = useRef<HTMLDivElement>(null);
  const [confirm, setConfirm] = useState<ConfirmPaymentValues>({
    bankPaidFrom: "",
    reference: "",
    amountPaid: "",
  });
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponUsage, setCouponUsage] = useState<{
    totalUses: number;
    customerUses: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [needsChange, setNeedsChange] = useState<boolean | null>(null);
  const [changeFor, setChangeFor] = useState("");

  const methods = enabledPaymentMethods(paymentMethods);
  const deliveryFee =
    orderType === "delivery"
      ? (deliveryZones.find((z) => z.name === deliveryZone)?.fee ?? 0)
      : 0;
  const packagingFee =
    packagingFeeEnabled && (orderType === "delivery" || orderType === "pickup")
      ? packagingFeeAmount
      : 0;
  const couponValidity = useMemo(() => {
    if (!appliedCoupon) return null;
    return validateCoupon(appliedCoupon, {
      orderTotal: total,
      currency,
      paymentMethodId: methodId,
      totalUses: couponUsage?.totalUses,
      customerUses: couponUsage?.customerUses,
    });
  }, [appliedCoupon, total, currency, methodId, couponUsage]);
  const discountAmount =
    appliedCoupon && couponValidity?.valid ? computeDiscount(appliedCoupon, total) : 0;
  const grandTotal = total + deliveryFee + packagingFee - discountAmount;

  const missingForPayment: string[] = [];
  if (!customerName.trim()) missingForPayment.push("tu nombre");
  if (!customerPhone.trim()) missingForPayment.push("tu teléfono");
  if (!orderType) missingForPayment.push("cómo quieres tu pedido");

  const selectMethod = (id: PaymentMethodId) => {
    if (missingForPayment.length > 0) {
      setShowMethodError(true);
      return;
    }
    setShowMethodError(false);
    setMethodId(id);
    if (id !== "efectivo") {
      setNeedsChange(null);
      setChangeFor("");
    }
  };

  useEffect(() => {
    if (methodId) {
      paymentDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [methodId]);

  const applyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    setCouponError(null);
    const supabase = createClient();
    const { data } = await supabase
      .from("coupons")
      .select(
        "id, code, discount_type, discount_value, is_active, expires_at, min_order_amount, max_total_uses, max_uses_per_customer, starts_at, valid_time_start, valid_time_end, valid_days, valid_payment_methods",
      )
      .eq("restaurant_id", restaurantId)
      .eq("code", code)
      .maybeSingle();
    if (!data) {
      setCheckingCoupon(false);
      setCouponError("Ese cupón no existe o ya venció.");
      setAppliedCoupon(null);
      setCouponUsage(null);
      return;
    }

    const coupon: Coupon = {
      id: data.id,
      code: data.code,
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      is_active: data.is_active,
      expires_at: data.expires_at,
      min_order_amount: data.min_order_amount,
      max_total_uses: data.max_total_uses,
      max_uses_per_customer: data.max_uses_per_customer,
      starts_at: data.starts_at,
      valid_time_start: data.valid_time_start,
      valid_time_end: data.valid_time_end,
      valid_days: parseValidDays(data.valid_days),
      valid_payment_methods: parseValidPaymentMethods(data.valid_payment_methods),
    };

    let usage = { totalUses: 0, customerUses: 0 };
    if (coupon.max_total_uses !== null || coupon.max_uses_per_customer !== null) {
      const { data: usageRows } = await supabase.rpc("get_coupon_usage", {
        p_restaurant_id: restaurantId,
        p_code: coupon.code,
        p_customer_phone: customerPhone.trim(),
      });
      const row = usageRows?.[0];
      if (row) usage = { totalUses: row.total_uses, customerUses: row.customer_uses };
    }

    setCheckingCoupon(false);

    const result = validateCoupon(coupon, {
      orderTotal: total,
      currency,
      paymentMethodId: methodId,
      totalUses: usage.totalUses,
      customerUses: usage.customerUses,
    });
    if (!result.valid) {
      setCouponError(result.reason ?? "Este cupón no se puede usar.");
      setAppliedCoupon(null);
      setCouponUsage(null);
      return;
    }

    setAppliedCoupon(coupon);
    setCouponUsage(usage);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponUsage(null);
    setCouponCode("");
    setCouponError(null);
  };

  const isCash = methodId === "efectivo";
  const activeMeta = methodId && !isCash ? PAYMENT_METHOD_META[methodId] : null;
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
    (methods.length === 0 || Boolean(methodId)) &&
    (!isCash || (needsChange !== null && (!needsChange || changeFor.trim().length > 0)));

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
    if (appliedCoupon && discountAmount > 0) {
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
    if (orderType === "delivery" && location) {
      parts.push(`📍 Ubicación en el mapa: ${buildMapsUrl(location.lat, location.lng)}`);
    }
    if (orderType === "dine_in" && table.trim()) {
      parts.push(`🍽️ Mesa: ${table.trim()}`);
    }
    if (isCash) {
      parts.push(DIVIDER, `💳 *Pago*`, "Efectivo");
      parts.push(
        needsChange && changeFor.trim()
          ? `💵 Necesita cambio, paga con: ${changeFor.trim()}`
          : "💵 Paga con monto exacto",
      );
    } else if (activeMeta) {
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
    location,
    table,
    isCash,
    needsChange,
    changeFor,
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

      {fixedTable ? (
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium"
          style={{ borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}1A` }}
        >
          <UtensilsCrossed className="h-4 w-4 shrink-0" />
          <span>
            Pedido para comer en el local · {fixedTable.name}
            {fixedTable.zone ? ` (${fixedTable.zone})` : ""}
          </span>
        </div>
      ) : (
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
      )}

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
              Ubicación (opcional)
            </label>
            <LocationPicker value={location} onChange={setLocation} />
          </div>
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

      {orderType === "dine_in" && !fixedTable && availableTables.length > 0 && (
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Mesa
          </label>
          <select
            value={tableId ?? ""}
            onChange={(e) => {
              const selected = availableTables.find((tb) => tb.id === e.target.value);
              setTableId(selected?.id ?? null);
              setTable(selected ? `${selected.name}${selected.zone ? ` (${selected.zone})` : ""}` : "");
            }}
            className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
          >
            <option value="">Selecciona tu mesa</option>
            {availableTables.map((tb) => (
              <option key={tb.id} value={tb.id}>
                {tb.name}
                {tb.zone ? ` · ${tb.zone}` : ""} · {tb.capacity}{" "}
                {tb.capacity === 1 ? "persona" : "personas"}
              </option>
            ))}
          </select>
        </div>
      )}

      {orderType === "dine_in" && !fixedTable && availableTables.length === 0 && (
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
          <div
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
              couponValidity?.valid
                ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/20"
                : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/20",
            )}
          >
            <span
              className={cn(
                "font-medium",
                couponValidity?.valid
                  ? "text-green-700 dark:text-green-400"
                  : "text-amber-700 dark:text-amber-400",
              )}
            >
              {couponValidity?.valid
                ? `${appliedCoupon.code} aplicado · -${formatPrice(discountAmount, currency)}`
                : `${appliedCoupon.code}: ${couponValidity?.reason ?? "no se puede aplicar ahora"}`}
            </span>
            <button
              type="button"
              onClick={removeCoupon}
              className={cn(
                "text-xs font-medium underline",
                couponValidity?.valid
                  ? "text-green-700 dark:text-green-400"
                  : "text-amber-700 dark:text-amber-400",
              )}
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
                onClick={() => selectMethod(id)}
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
          {showMethodError && missingForPayment.length > 0 && (
            <p className="mt-2 text-xs text-red-600">
              Completa {missingForPayment.join(", ")} antes de elegir el método de pago.
            </p>
          )}
        </div>
      )}

      {isCash && (
        <div ref={paymentDetailsRef} className="space-y-3">
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            ¿Necesitas cambio/vuelto?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNeedsChange(true)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                needsChange === true
                  ? "border-transparent text-white"
                  : "border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
              )}
              style={needsChange === true ? { backgroundColor: themeColor } : undefined}
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => {
                setNeedsChange(false);
                setChangeFor("");
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium",
                needsChange === false
                  ? "border-transparent text-white"
                  : "border-neutral-200 text-neutral-600 dark:border-neutral-700 dark:text-neutral-400",
              )}
              style={needsChange === false ? { backgroundColor: themeColor } : undefined}
            >
              No
            </button>
          </div>
          {needsChange && (
            <div>
              <Label htmlFor="changeFor">¿Con cuánto vas a pagar?</Label>
              <Input
                id="changeFor"
                value={changeFor}
                onChange={(e) => setChangeFor(e.target.value)}
                placeholder="20$"
              />
            </div>
          )}
        </div>
      )}

      {activeMeta && activeValues && (
        <div ref={paymentDetailsRef} className="space-y-3">
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
            hideCopyAll={!activeMeta.convertToVes}
          />
          <ConfirmPaymentFields
            values={confirmValues}
            onChange={setConfirm}
            upload={uploadOrderReceipt.bind(null, restaurantId)}
            onReceiptUploaded={setReceiptUrl}
            receiptOnly={!activeMeta.convertToVes}
          />
        </div>
      )}

      {orderError && (
        <p className="text-sm text-red-600">{orderError}</p>
      )}

      {canSubmit && (
        <button
          type="button"
          disabled={sending}
          onClick={async () => {
            setSending(true);
            setOrderError(null);
            const result = await createOrder(restaurantId, {
              orderType: orderType!,
              customerName,
              customerPhone,
              address: orderType === "delivery" ? address : undefined,
              lat: orderType === "delivery" ? location?.lat : undefined,
              lng: orderType === "delivery" ? location?.lng : undefined,
              tableNumber: orderType === "dine_in" ? table : undefined,
              tableId: orderType === "dine_in" ? tableId ?? undefined : undefined,
              deliveryZone: orderType === "delivery" ? deliveryZone || undefined : undefined,
              deliveryFee,
              packagingFee: packagingFee || undefined,
              couponCode: couponValidity?.valid ? appliedCoupon?.code : undefined,
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
              bankPaidFrom: isCash ? undefined : confirmValues.bankPaidFrom || undefined,
              reference: isCash ? undefined : confirmValues.reference || undefined,
              amountPaid: isCash ? undefined : confirmValues.amountPaid || undefined,
              receiptUrl: isCash ? undefined : (receiptUrl ?? undefined),
              changeFor: isCash && needsChange ? changeFor.trim() || undefined : undefined,
            });
            setSending(false);
            if ("error" in result) {
              setOrderError(
                "No se pudo enviar el pedido. Verifica tu conexión e intenta de nuevo.",
              );
              return;
            }
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
