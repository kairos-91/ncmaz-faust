import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "./account/profile-menu";
import { BranchSwitcher } from "./branch-switcher";
import type { BcvRate } from "@/lib/bcv-rate";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import type { Restaurant } from "@/lib/supabase/database.types";

export function AdminTopBar({
  email,
  avatarUrl = null,
  locale,
  t,
  openNow = null,
  bcvRate = null,
  branches = null,
  currentRestaurantId = null,
}: {
  email: string | null;
  avatarUrl?: string | null;
  locale: Locale;
  t: Dictionary["adminNav"];
  openNow?: boolean | null;
  bcvRate?: BcvRate | null;
  branches?: Restaurant[] | null;
  currentRestaurantId?: string | null;
}) {
  return (
    <>
      <header className="flex h-16 items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 md:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="shrink-0">
            <Logo height={44} />
          </Link>
          {branches && currentRestaurantId && (
            <BranchSwitcher
              restaurants={branches}
              currentRestaurantId={currentRestaurantId}
              locale={locale}
            />
          )}
          {openNow !== null && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                openNow
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              }`}
            >
              ● {openNow ? t.openNow : t.closedNow}
            </span>
          )}
          {bcvRate && (
            <span className="hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-400 lg:inline-flex">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
              {t.bcvRateLabel}: Bs {bcvRate.rate.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <LanguageToggle locale={locale} />
            <ThemeToggle />
          </div>
          <ProfileMenu email={email} avatarUrl={avatarUrl} locale={locale} />
        </div>
      </header>
      {bcvRate && (
        <div className="sticky top-0 z-20 flex items-center justify-center gap-1.5 border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400 lg:hidden">
          <BadgeCheck className="h-3.5 w-3.5 shrink-0" />
          {t.bcvRateLabel}: Bs {bcvRate.rate.toFixed(2)}
        </div>
      )}
    </>
  );
}
