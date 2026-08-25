import Link from "next/link";
import {
  QrCode,
  LayoutDashboard,
  Smartphone,
  Palette,
  Clock,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const FEATURES = [
  {
    icon: QrCode,
    title: "Menú con código QR",
    description:
      "Genera un código QR único para tu restaurante. Tus clientes escanean y ven el menú al instante, sin apps.",
  },
  {
    icon: LayoutDashboard,
    title: "Panel de administración",
    description:
      "Edita platos, precios, fotos y disponibilidad en segundos desde cualquier dispositivo.",
  },
  {
    icon: Palette,
    title: "A tu estilo",
    description:
      "Personaliza el color de marca, logo y portada para que el menú se vea como tu restaurante.",
  },
  {
    icon: Clock,
    title: "Cambios en tiempo real",
    description:
      "Marca un plato como agotado o actualiza el precio y se refleja al instante para todos tus clientes.",
  },
  {
    icon: ImageIcon,
    title: "Fotos de tus platos",
    description:
      "Sube imágenes de cada plato para que tus clientes decidan más rápido y pidan con confianza.",
  },
  {
    icon: Smartphone,
    title: "Optimizado para celular",
    description:
      "Diseñado mobile-first: rápido, liviano y fácil de leer desde cualquier teléfono.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Crea tu cuenta",
    description: "Regístrate gratis en menos de un minuto.",
  },
  {
    step: "2",
    title: "Arma tu menú",
    description: "Agrega categorías y platos con fotos y precios.",
  },
  {
    step: "3",
    title: "Comparte tu QR",
    description: "Imprime el código QR y colócalo en tus mesas.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-neutral-50">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:py-28">
            <div>
              <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
                Menú digital para restaurantes
              </span>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                El menú de tu restaurante, siempre actualizado.
              </h1>
              <p className="mt-4 max-w-md text-lg text-neutral-600">
                Crea una landing y un menú digital con código QR en minutos.
                Edita platos y precios desde tu panel, sin reimprimir nada.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg">Crea tu menú gratis</Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="secondary">
                    Cómo funciona
                  </Button>
                </Link>
              </div>
            </div>
            <PhoneMockup />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Todo lo que necesitas para tu menú digital
            </h2>
            <p className="mt-3 text-neutral-600">
              Diseñado para que administrar tu menú sea tan fácil como enviar
              un mensaje.
            </p>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-2xl border border-neutral-100 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-neutral-900">{title}</h3>
                <p className="mt-1.5 text-sm text-neutral-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-neutral-900 py-20 text-white">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-semibold tracking-tight">
              Cómo funciona
            </h2>
            <div className="mt-14 grid gap-10 sm:grid-cols-3">
              {STEPS.map(({ step, title, description }) => (
                <div key={step} className="text-center sm:text-left">
                  <span className="text-sm font-semibold text-orange-400">
                    Paso {step}
                  </span>
                  <h3 className="mt-2 text-xl font-semibold">{title}</h3>
                  <p className="mt-1.5 text-sm text-neutral-300">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Precios simples
            </h2>
            <p className="mt-3 text-neutral-600">
              Empieza gratis. Sin tarjeta de crédito.
            </p>
          </div>
          <div className="mx-auto mt-14 max-w-sm rounded-2xl border-2 border-neutral-900 p-8 text-center">
            <p className="text-sm font-medium text-neutral-500">Plan gratuito</p>
            <p className="mt-2 text-4xl font-semibold">$0</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-neutral-600">
              <li>✓ Menú digital con código QR</li>
              <li>✓ Categorías y platos ilimitados</li>
              <li>✓ Panel de administración</li>
              <li>✓ Fotos de tus platos</li>
            </ul>
            <Link href="/signup" className="mt-8 block">
              <Button className="w-full" size="lg">
                Empieza gratis
              </Button>
            </Link>
          </div>
        </section>

        <section className="bg-orange-50 py-20">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900">
              Moderniza el menú de tu restaurante hoy
            </h2>
            <p className="mt-3 text-neutral-600">
              Únete a los restaurantes que ya dejaron atrás el menú de papel.
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button size="lg">Crea tu cuenta gratis</Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function PhoneMockup() {
  return (
    <div className="mx-auto w-full max-w-xs">
      <div className="rounded-[2.5rem] border-8 border-neutral-900 bg-neutral-900 shadow-xl">
        <div className="overflow-hidden rounded-[2rem] bg-white">
          <div className="h-24 bg-gradient-to-br from-orange-400 to-orange-600" />
          <div className="px-4 pb-5 pt-8">
            <div className="-mt-14 h-14 w-14 rounded-2xl border-4 border-white bg-orange-500" />
            <p className="mt-3 text-sm font-semibold text-neutral-900">
              La Parrilla de Juan
            </p>
            <p className="text-xs text-neutral-400">Cocina venezolana</p>
            <div className="mt-4 space-y-2">
              {[
                ["Pabellón criollo", "$8.50"],
                ["Cachapa con queso", "$5.00"],
                ["Tequeños (6u)", "$4.00"],
              ].map(([name, price]) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-xl border border-neutral-100 px-3 py-2"
                >
                  <span className="text-xs font-medium text-neutral-800">
                    {name}
                  </span>
                  <span className="text-xs font-semibold text-orange-600">
                    {price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
