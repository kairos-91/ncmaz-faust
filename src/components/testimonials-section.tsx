import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    quote:
      "Armé el menú completo en una tarde y coloqué el QR en las mesas. Mis clientes lo aman y yo dejé de reimprimir cartas.",
    name: "María Fernández",
    role: "Dueña · La Parrilla de Juan",
  },
  {
    quote:
      "Cuando sube un precio lo cambio desde el celular y ya está actualizado para todos. Antes tocaba reimprimir todo el menú.",
    name: "Carlos Reinoso",
    role: "Dueño · Cachapas El Rincón",
  },
  {
    quote:
      "Los pedidos llegan directo a mi WhatsApp, ya armados con cantidades y total. Se nos hizo mucho más fácil atender.",
    name: "Andrea López",
    role: "Dueña · Sabor Casero",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-neutral-950 py-20 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-lime-400">
            Testimonios
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Restaurantes que ya digitalizaron su menú
          </h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-lime-400" />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ quote, name, role }) => (
            <div
              key={name}
              className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
            >
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 flex-1 text-neutral-200">&ldquo;{quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-neutral-800 pt-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400/10 text-sm font-semibold text-lime-400">
                  {name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-sm text-neutral-500">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
