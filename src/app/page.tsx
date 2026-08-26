import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  Palette,
  Store,
  UtensilsCrossed,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingPlans } from "@/components/pricing-plans";
import { FaqSection } from "@/components/faq-section";
import { TestimonialsSection } from "@/components/testimonials-section";

const STEPS = [
  {
    icon: Store,
    title: "Crea tu restaurante",
    description:
      "Crea el perfil de tu restaurante y compártelo mediante link o código QR.",
  },
  {
    icon: Palette,
    title: "Personaliza tu marca",
    description:
      "Elige el color y el logo de tu restaurante para que el menú se vea como tuyo.",
  },
  {
    icon: UtensilsCrossed,
    title: "Crea tu menú",
    description:
      "Carga cada plato con fotos, precios, descripciones y etiquetas.",
  },
  {
    icon: MessageCircle,
    title: "Configura tu WhatsApp",
    description:
      "Conecta tu número para recibir los pedidos directo en tu chat.",
  },
  {
    icon: QrCode,
    title: "Comparte tu QR",
    description:
      "Tus clientes escanean el código en la mesa y ven el menú al instante.",
  },
  {
    icon: RefreshCw,
    title: "Actualiza en tiempo real",
    description:
      "Marca un plato como agotado o cambia un precio y se refleja al instante.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-neutral-50 dark:bg-neutral-950">
          <div className="absolute inset-0">
            <Image
              src="/hero-banner.jpg"
              alt=""
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40 dark:from-neutral-950 dark:via-neutral-950/90 dark:to-neutral-950/50" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-lime-400/10 dark:text-lime-400">
              Menú digital para restaurantes
            </span>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
              El menú de tu restaurante, siempre actualizado.
            </h1>
            <p className="mt-4 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
              Crea una landing y un menú digital con código QR en minutos.
              Edita platos y precios desde tu panel, sin reimprimir nada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
                >
                  Crea tu menú gratis
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="secondary"
                  className="dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                >
                  Cómo funciona
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-white py-20 text-neutral-900 dark:bg-black dark:text-white"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold uppercase tracking-wide text-neutral-900 dark:text-white sm:text-4xl">
                Cómo funciona
              </h2>
              <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-lime-500 dark:bg-lime-400" />
              <p className="mx-auto mt-6 max-w-xl text-neutral-600 dark:text-neutral-400">
                Crea el menú de tu restaurante de forma fácil y sin
                complicaciones
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-sm font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PricingPlans />

        <FaqSection />

        <TestimonialsSection />

        <section className="bg-orange-50 py-20 dark:bg-neutral-900">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Moderniza el menú de tu restaurante hoy
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              Únete a los restaurantes que ya dejaron atrás el menú de papel.
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button
                size="lg"
                className="dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
              >
                Crea tu cuenta gratis
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
