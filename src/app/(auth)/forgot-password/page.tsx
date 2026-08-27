import type { Metadata } from "next";
import { getT } from "@/lib/i18n/locale";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Recupera tu contraseña" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { t } = await getT();

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">{t.auth.forgotPassword.title}</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        {t.auth.forgotPassword.subtitle}
      </p>
      {error === "session" && (
        <p className="mb-4 text-sm text-red-600">{t.auth.resetPassword.errorSession}</p>
      )}
      <ForgotPasswordForm t={t.auth} />
    </>
  );
}
