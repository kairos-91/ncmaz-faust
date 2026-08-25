import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 px-4 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">
        Menú no encontrado
      </h1>
      <p className="max-w-sm text-sm text-neutral-500">
        Este restaurante no existe o todavía no publicó su menú.
      </p>
      <Link href="/" className="text-sm font-medium underline">
        Volver al inicio
      </Link>
    </div>
  );
}
