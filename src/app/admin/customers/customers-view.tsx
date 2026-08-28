"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { CustomerStats } from "@/lib/customers";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

const RANK_MEDALS = ["🥇", "🥈", "🥉"];

export function CustomersView({
  customers,
  currency,
  locale,
  t,
}: {
  customers: CustomerStats[];
  currency: string;
  locale: Locale;
  t: Dictionary["customersPage"];
}) {
  const [query, setQuery] = useState("");

  if (customers.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        {t.empty}
      </p>
    );
  }

  const ranked = customers.map((c, i) => ({ ...c, rank: i }));
  const q = query.trim().toLowerCase();
  const filtered = q
    ? ranked.filter(
        (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q),
      )
    : ranked;

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="w-full max-w-sm rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm outline-none focus:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-500"
      />

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
          {t.noResults}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
                <th className="px-4 py-3">{t.customer}</th>
                <th className="px-4 py-3">{t.phone}</th>
                <th className="px-4 py-3 text-right">{t.orders}</th>
                <th className="px-4 py-3 text-right">{t.totalSpent}</th>
                <th className="px-4 py-3">{t.lastOrder}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.phone}
                  className="border-b border-neutral-100 last:border-0 dark:border-neutral-800"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                    {RANK_MEDALS[c.rank] ? `${RANK_MEDALS[c.rank]} ` : ""}
                    {c.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline dark:text-green-400"
                    >
                      {c.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-neutral-900 dark:text-white">
                    {c.orderCount}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-700 dark:text-neutral-300">
                    {formatPrice(c.totalSpent, currency)}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-500">
                    {new Date(c.lastOrderAt).toLocaleDateString(
                      locale === "en" ? "en-US" : "es-VE",
                      { dateStyle: "medium" },
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
