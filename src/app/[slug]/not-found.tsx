import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 px-4 text-center dark:bg-neutral-950">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
        Menú no encontrado
      </h1>
      <p className="max-w-sm text-sm text-neutral-600 dark:text-neutral-400">
        Este restaurante no existe o todavía no publicó su menú.
      </p>
      <Link href="/" className="text-sm font-medium underline dark:text-white">
        Volver al inicio
      </Link>
    </div>
  );
}
