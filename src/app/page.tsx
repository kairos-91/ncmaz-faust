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
import { getT } from "@/lib/i18n/locale";

const STEP_ICONS = [Store, Palette, UtensilsCrossed, MessageCircle, QrCode, RefreshCw];

export default async function Home() {
  const { t } = await getT();
  const steps = t.howItWorks.steps.map((step, i) => ({
    ...step,
    icon: STEP_ICONS[i],
  }));

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative min-h-[560px] overflow-hidden bg-neutral-50 dark:bg-neutral-950 md:min-h-[680px]">
          <div className="absolute inset-0">
            <Image
              src="/hero-banner.jpg"
              alt=""
              fill
              priority
              className="object-cover object-bottom"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40 dark:from-neutral-950 dark:via-neutral-950/90 dark:to-neutral-950/50" />
          </div>

          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 md:py-20">
            <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700 dark:bg-lime-400/10 dark:text-lime-400">
              {t.hero.badge}
            </span>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-4 max-w-md text-lg text-neutral-600 dark:text-neutral-400">
              {t.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
                >
                  {t.hero.ctaPrimary}
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="secondary"
                  className="dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                >
                  {t.hero.ctaSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-white pb-20 pt-16 text-neutral-900 dark:bg-black dark:text-white md:pt-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-wide text-neutral-900 dark:text-white sm:text-4xl">
                {t.howItWorks.heading}
              </h2>
              <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-lime-500 dark:bg-lime-400" />
              <p className="mx-auto mt-6 max-w-xl text-neutral-600 dark:text-neutral-400">
                {t.howItWorks.subheading}
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-neutral-200 bg-white p-6 transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-lime-100 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-sm font-bold tracking-wide text-neutral-900 dark:text-white">
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

        <FaqSection t={t.faq} />

        <TestimonialsSection />

        <section className="bg-orange-50 py-20 dark:bg-neutral-900">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {t.cta.heading}
            </h2>
            <p className="mt-3 text-neutral-600 dark:text-neutral-400">
              {t.cta.subheading}
            </p>
            <Link href="/signup" className="mt-8 inline-block">
              <Button
                size="lg"
                className="dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
              >
                {t.cta.button}
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
