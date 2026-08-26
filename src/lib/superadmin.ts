// Mantén esta lista sincronizada con los correos hardcodeados en
// supabase/migrations/0008_superadmin.sql (las políticas RLS de
// subscription_plans, subscription_payments, platform_settings y
// restaurants.plan/plan_expires_at usan la misma lista).
export const SUPERADMIN_EMAILS = ["joseph.ro.silva@gmail.com"];

export function isSuperadmin(email: string | null | undefined) {
  return Boolean(email && SUPERADMIN_EMAILS.includes(email));
}
