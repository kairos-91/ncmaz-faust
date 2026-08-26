import type { Metadata } from "next";
import { Suspense } from "react";
import { getT } from "@/lib/i18n/locale";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Inicia sesión" };

export default async function LoginPage() {
  const { t } = await getT();

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">{t.auth.login.title}</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        {t.auth.login.subtitle}
      </p>
      <Suspense fallback={null}>
        <LoginForm t={t.auth} />
      </Suspense>
      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        {t.auth.login.noAccount}{" "}
        <a href="/signup" className="font-medium text-neutral-900 underline dark:text-white">
          {t.auth.login.signupLink}
        </a>
      </p>
    </>
  );
}
