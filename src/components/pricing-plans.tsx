import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { formatPlanPrice, toSubscriptionPlan } from "@/lib/subscription-plans";
import { getT } from "@/lib/i18n/locale";

export async function getActivePlans() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map(toSubscriptionPlan);
}

export async function PricingPlans({
  headingTag = "h2",
  className,
}: {
  headingTag?: "h1" | "h2";
  className?: string;
}) {
  const Heading = headingTag;
  const [plans, { t }] = await Promise.all([getActivePlans(), getT()]);

  return (
    <section
      id="pricing"
      className={cn(
        "scroll-mt-20 bg-white py-20 text-neutral-900 dark:bg-black dark:text-white",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <Heading className="text-3xl font-bold tracking-wide text-neutral-900 dark:text-white sm:text-4xl">
            {t.pricingSection.heading}
          </Heading>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-lime-500 dark:bg-lime-400" />
          <p className="mx-auto mt-6 max-w-2xl text-neutral-600 dark:text-neutral-400">
            {t.pricingSection.subheading}
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-8 transition-transform duration-200 hover:-translate-y-1.5 hover:shadow-lg dark:bg-neutral-900",
                plan.highlight
                  ? "border-lime-500/40 dark:border-lime-400/40"
                  : "border-neutral-200 dark:border-neutral-800",
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-lime-500 px-3 py-1 text-xs font-semibold text-white dark:bg-lime-400 dark:text-neutral-950">
                  {t.pricingSection.mostPopular}
                </span>
              )}

              <p className="text-center text-sm font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
                {plan.name}
              </p>

              <div className="mt-3 flex items-baseline justify-center gap-2">
                {plan.oldPriceUsd && (
                  <span className="text-lg text-red-500 line-through">
                    {formatPlanPrice(plan.oldPriceUsd)}
                  </span>
                )}
                <span className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {formatPlanPrice(plan.priceUsd)}
                </span>
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {plan.period}
                </span>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-lime-600 dark:text-lime-400" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300">
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
                      ? "bg-lime-500 text-white hover:bg-lime-600 dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300"
                      : "bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200",
                  )}
                >
                  {plan.ctaLabel}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
