import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PricingPlans } from "@/components/pricing-plans";

export const metadata: Metadata = { title: "Precios" };

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <PricingPlans headingTag="h1" />
      </main>
      <SiteFooter />
    </>
  );
}
