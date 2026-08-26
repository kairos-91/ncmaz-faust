import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";

export function SiteHeader() {
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
            Cómo funciona
          </Link>
          <Link
            href="/#pricing"
            className="hover:text-neutral-900 dark:hover:text-white"
          >
            Precios
          </Link>
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Inicia sesión
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              size="sm"
              className="dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
            >
              Empieza gratis
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
