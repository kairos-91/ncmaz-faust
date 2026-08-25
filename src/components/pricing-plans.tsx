import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PLANS = [
  {
    name: "Prueba gratis",
    oldPrice: null,
    price: "Gratis",
    period: "/ 15 días",
    cta: "Empezar gratis",
    highlight: false,
    features: [
      "Página de bienvenida y menú público",
      "Menú (hasta 30 platos)",
      "Categorías ilimitadas",
      "Etiquetas y platos destacados",
      "Código QR para tus mesas",
      "Pedidos por WhatsApp (limitados)",
      "Fotos en cada plato",
      "Reordenar categorías y platos",
      "Datos de contacto y ubicación",
      "Optimizado para celular",
    ],
  },
  {
    name: "Pro",
    oldPrice: "$24.99",
    price: "$11.99",
    period: "/ mes",
    cta: "Elegir Pro",
    highlight: true,
    features: [
      "Página de bienvenida y menú público",
      "Menú (platos ilimitados)",
      "Categorías ilimitadas",
      "Etiquetas y platos destacados",
      "Código QR para tus mesas",
      "Pedidos por WhatsApp (ilimitados)",
      "Fotos en cada plato",
      "Reordenar categorías y platos",
      "Datos de contacto y ubicación",
      "Optimizado para celular",
    ],
  },
  {
    name: "Anual",
    oldPrice: "$143.88",
    price: "$109.99",
    period: "/ año",
    cta: "Elegir Anual",
    highlight: false,
    features: [
      "Página de bienvenida y menú público",
      "Menú (platos ilimitados)",
      "Categorías ilimitadas",
      "Etiquetas y platos destacados",
      "Código QR para tus mesas",
      "Pedidos por WhatsApp (ilimitados)",
      "Fotos en cada plato",
      "Reordenar categorías y platos",
      "Datos de contacto y ubicación",
      "Optimizado para celular",
    ],
  },
];

export function PricingPlans({
  headingTag = "h2",
  className,
}: {
  headingTag?: "h1" | "h2";
  className?: string;
}) {
  const Heading = headingTag;

  return (
    <section id="pricing" className={cn("bg-neutral-950 py-20 text-white", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <Heading className="text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
            Selecciona tu plan y continúa
          </Heading>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-lime-400" />
          <p className="mx-auto mt-6 max-w-2xl text-neutral-400">
            Empieza con 15 días gratis o activa de una vez el plan mensual o
            anual, sin tarifas ocultas.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-8",
                plan.highlight
                  ? "border-lime-400/40 bg-neutral-900"
                  : "border-neutral-800 bg-neutral-900",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-400 px-3 py-1 text-xs font-semibold text-neutral-950">
                  Más popular
                </span>
              )}

              <p className="text-center text-sm font-semibold uppercase tracking-wide text-neutral-400">
                {plan.name}
              </p>

              <div className="mt-3 flex items-baseline justify-center gap-2">
                {plan.oldPrice && (
                  <span className="text-lg text-red-500 line-through">
                    {plan.oldPrice}
                  </span>
                )}
                <span className="text-3xl font-bold text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-neutral-400">
                  {plan.period}
                </span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-400" />
                    <span className="text-sm text-neutral-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-8 block">
                <Button
                  className={cn(
                    "w-full",
                    plan.highlight
                      ? "bg-lime-400 text-neutral-950 hover:bg-lime-300"
                      : "bg-white text-neutral-950 hover:bg-neutral-200",
                  )}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
