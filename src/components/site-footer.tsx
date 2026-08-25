import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-neutral-500 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} Levery. Todos los derechos reservados.</p>
        <div className="flex gap-6">
          <Link href="/signup" className="hover:text-neutral-900">
            Crear cuenta
          </Link>
          <Link href="/login" className="hover:text-neutral-900">
            Inicia sesión
          </Link>
        </div>
      </div>
    </footer>
  );
}
