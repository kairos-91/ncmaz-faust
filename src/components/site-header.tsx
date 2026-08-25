import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          levery
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
          <a href="#features" className="hover:text-neutral-900">
            Funciones
          </a>
          <a href="#how-it-works" className="hover:text-neutral-900">
            Cómo funciona
          </a>
          <a href="#pricing" className="hover:text-neutral-900">
            Precios
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Inicia sesión
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Empieza gratis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
