export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900 bg-neutral-950">
      <p className="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-neutral-500 sm:px-6">
        © {new Date().getFullYear()} Levery. Todos los derechos reservados.
      </p>
    </footer>
  );
}
