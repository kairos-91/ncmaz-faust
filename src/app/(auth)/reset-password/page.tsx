import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/lib/i18n/locale";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { t } = await getT();

  if (!user) redirect("/forgot-password?error=session");

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">{t.auth.resetPassword.title}</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        {t.auth.resetPassword.subtitle}
      </p>
      <ResetPasswordForm t={t.auth} />
    </>
  );
}
