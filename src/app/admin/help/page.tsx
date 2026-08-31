import type { Metadata } from "next";
import {
  Bell,
  Bike,
  ChefHat,
  ClipboardList,
  CreditCard,
  Home,
  Sparkles,
  Star,
  Store,
  Tags,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getT } from "@/lib/i18n/locale";

export const metadata: Metadata = { title: "Ayuda" };

const TOPIC_STYLES: Record<string, { icon: LucideIcon; color: string }> = {
  summary: {
    icon: Home,
    color: "bg-lime-100 text-lime-700 dark:bg-lime-400/10 dark:text-lime-400",
  },
  restaurant: {
    icon: Store,
    color: "bg-orange-100 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400",
  },
  categories: {
    icon: Tags,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-400/10 dark:text-purple-400",
  },
  menu: {
    icon: UtensilsCrossed,
    color: "bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400",
  },
  orders: {
    icon: ClipboardList,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-400",
  },
  deliveryStaff: {
    icon: Bike,
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-400",
  },
  kitchenStaff: {
    icon: ChefHat,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-400",
  },
  reviews: {
    icon: Star,
    color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  },
  coupons: {
    icon: Ticket,
    color: "bg-pink-100 text-pink-700 dark:bg-pink-400/10 dark:text-pink-400",
  },
  notifications: {
    icon: Bell,
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/10 dark:text-indigo-400",
  },
  team: {
    icon: UserPlus,
    color: "bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-400",
  },
  paymentMethods: {
    icon: CreditCard,
    color: "bg-green-100 text-green-700 dark:bg-green-400/10 dark:text-green-400",
  },
  subscription: {
    icon: Sparkles,
    color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/10 dark:text-fuchsia-400",
  },
  sales: {
    icon: TrendingUp,
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  customers: {
    icon: Users,
    color: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400",
  },
};

const TOPIC_ORDER = [
  "summary",
  "restaurant",
  "categories",
  "menu",
  "orders",
  "deliveryStaff",
  "kitchenStaff",
  "paymentMethods",
  "coupons",
  "notifications",
  "reviews",
  "team",
  "sales",
  "customers",
  "subscription",
] as const;

export default async function HelpPage() {
  const { t } = await getT();
  const topics = t.helpPage.topics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.helpPage.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.helpPage.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPIC_ORDER.map((key) => {
          const topic = topics[key];
          const style = TOPIC_STYLES[key];
          const Icon = style.icon;
          return (
            <div
              key={key}
              className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.color}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-900 dark:text-white">
                {topic.title}
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {topic.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
