import { formatPrice } from "@/lib/utils";
import { DAY_KEYS, getZonedDayAndMinutes, type DayKey } from "@/lib/opening-hours";

export type CouponDiscountType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  min_order_amount: number;
  max_total_uses: number | null;
  max_uses_per_customer: number | null;
  starts_at: string | null;
  valid_time_start: string | null;
  valid_time_end: string | null;
  valid_days: string[];
  valid_payment_methods: string[];
};

export function computeDiscount(
  coupon: Pick<Coupon, "discount_type" | "discount_value">,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0;
  const raw =
    coupon.discount_type === "percent"
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;
  return Math.min(subtotal, Math.max(0, raw));
}

// "HH:MM" o "HH:MM:SS" -> minutos desde medianoche.
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":");
  return (Number(h) || 0) * 60 + (Number(m) || 0);
}

export type CouponValidationContext = {
  orderTotal: number;
  currency: string;
  paymentMethodId: string | null;
  now?: Date;
  totalUses?: number;
  customerUses?: number;
};

export function validateCoupon(
  coupon: Coupon,
  ctx: CouponValidationContext,
): { valid: boolean; reason?: string } {
  const now = ctx.now ?? new Date();

  if (!coupon.is_active) {
    return { valid: false, reason: "Este cupón no está activo." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, reason: "Este cupón ya venció." };
  }
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, reason: "Este cupón todavía no está disponible." };
  }
  if (coupon.min_order_amount > 0 && ctx.orderTotal < coupon.min_order_amount) {
    return {
      valid: false,
      reason: `El pedido mínimo para este cupón es ${formatPrice(coupon.min_order_amount, ctx.currency)}.`,
    };
  }
  if (
    typeof ctx.totalUses === "number" &&
    coupon.max_total_uses !== null &&
    ctx.totalUses >= coupon.max_total_uses
  ) {
    return { valid: false, reason: "Este cupón alcanzó su límite de usos." };
  }
  if (
    typeof ctx.customerUses === "number" &&
    coupon.max_uses_per_customer !== null &&
    ctx.customerUses >= coupon.max_uses_per_customer
  ) {
    return { valid: false, reason: "Ya usaste este cupón el máximo de veces permitido." };
  }
  if (coupon.valid_days.length > 0 || (coupon.valid_time_start && coupon.valid_time_end)) {
    const { day, minutesOfDay } = getZonedDayAndMinutes(now);
    if (coupon.valid_days.length > 0 && !coupon.valid_days.includes(day)) {
      return { valid: false, reason: "Este cupón no es válido hoy." };
    }
    if (coupon.valid_time_start && coupon.valid_time_end) {
      const start = timeToMinutes(coupon.valid_time_start);
      const end = timeToMinutes(coupon.valid_time_end);
      const inRange =
        start <= end
          ? minutesOfDay >= start && minutesOfDay <= end
          : minutesOfDay >= start || minutesOfDay <= end;
      if (!inRange) {
        return { valid: false, reason: "Este cupón no es válido a esta hora." };
      }
    }
  }
  if (
    coupon.valid_payment_methods.length > 0 &&
    ctx.paymentMethodId &&
    !coupon.valid_payment_methods.includes(ctx.paymentMethodId)
  ) {
    return {
      valid: false,
      reason: "Este cupón no aplica con el método de pago elegido.",
    };
  }

  return { valid: true };
}

export function parseValidDays(json: unknown): DayKey[] {
  if (!Array.isArray(json)) return [];
  return DAY_KEYS.filter((d) => json.includes(d));
}

export function parseValidPaymentMethods(json: unknown): string[] {
  if (!Array.isArray(json)) return [];
  return json.filter((v): v is string => typeof v === "string");
}
