import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { MobileMenu } from "@/components/mobile-menu";
import { getT } from "@/lib/i18n/locale";

export async function SiteHeader() {
  const { locale, t } = await getT();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/">
          <Logo height={56} />
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-neutral-600 dark:text-neutral-400 md:flex">
          <Link
            href="/#how-it-works"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            {t.nav.howItWorks}
          </Link>
          <Link
            href="/#pricing"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            {t.nav.pricing}
          </Link>
        </nav>

        {/* Móvil: idioma/tema + botón de menú hamburguesa (login y empezar
            gratis viven dentro del menú desplegable). En md+ vuelve a la
            fila normal con los botones a la vista. */}
        <div className="flex items-center gap-1 md:hidden">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
          <MobileMenu locale={locale} t={t.nav} />
        </div>

        <div className="hidden items-center gap-2 sm:gap-3 md:flex">
          <LanguageToggle locale={locale} />
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {t.nav.login}
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
            >
              {t.nav.startFree}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
