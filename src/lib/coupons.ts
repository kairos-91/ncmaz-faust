export type CouponDiscountType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
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
