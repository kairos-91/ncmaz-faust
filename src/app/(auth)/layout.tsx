import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { getT } from "@/lib/i18n/locale";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <div className="hidden flex-col bg-neutral-900 px-12 py-16 text-white md:flex md:w-[45%] lg:w-1/2 lg:px-20">
        <span className="inline-flex w-fit items-center rounded-full bg-lime-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-400">
          {t.hero.badge}
        </span>
        <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight lg:text-5xl">
          {t.hero.title}
        </h1>
        <p className="mt-4 max-w-sm text-neutral-300">{t.hero.description}</p>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center bg-neutral-50 px-4 py-12 dark:bg-neutral-950">
        <div className="fixed right-4 top-4 flex items-center gap-1 md:right-8 md:top-8">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
        </div>
        <Link href="/" className="mb-8">
          <Logo height={56} />
        </Link>
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          {children}
        </div>
      </div>
    </div>
  );
}
