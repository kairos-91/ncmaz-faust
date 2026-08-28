import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { getT } from "@/lib/i18n/locale";

export async function SiteHeader() {
  const { locale, t } = await getT();

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
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

        {/* Idioma/tema en la esquina superior derecha en móvil: flotan encima
            del botón "Empieza gratis" (position: absolute) para no sumar
            altura al topbar; en md+ vuelven a la fila normal. */}
        <div className="absolute right-4 top-0 flex items-center gap-0.5 sm:right-6 md:hidden">
          <LanguageToggle locale={locale} compact />
          <ThemeToggle compact />
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1 md:flex">
            <LanguageToggle locale={locale} />
            <ThemeToggle />
          </div>
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="whitespace-nowrap px-2 dark:text-neutral-300 dark:hover:bg-neutral-800 sm:px-3"
            >
              {t.nav.login}
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="md"
              className="whitespace-nowrap dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
            >
              {t.nav.startFree}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
