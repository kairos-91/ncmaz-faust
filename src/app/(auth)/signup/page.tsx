import type { Metadata } from "next";
import { getT } from "@/lib/i18n/locale";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Crea tu cuenta" };

export default async function SignupPage() {
  const { t } = await getT();

  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">{t.auth.signup.title}</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        {t.auth.signup.subtitle}
      </p>
      <SignupForm t={t.auth.signup} />
      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        {t.auth.signup.haveAccount}{" "}
        <a href="/login" className="font-medium text-neutral-900 underline dark:text-white">
          {t.auth.signup.loginLink}
        </a>
      </p>
    </>
  );
}
