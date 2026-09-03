"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { formatPrice } from "@/lib/utils";
import { formatBs } from "@/lib/bcv-rate";
import { PAYMENT_METHOD_META, type PaymentMethodId } from "@/lib/payment-methods";
import {
  filterOrdersByPeriod,
  groupSalesByPaymentMethod,
  type DailySales,
  type MonthlySales,
  type SalesOrder,
  type SalesPeriod,
  type SalesSummary,
} from "@/lib/sales";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";
import { SalesCharts } from "./sales-charts";

type T = Dictionary["common"] & Dictionary["salesPage"];

function formatDayLabel(day: string) {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  return new Date(year, month - 1, dayOfMonth).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function SalesView({
  restaurantName,
  currency,
  summary,
  daily,
  dailyChart,
  monthlyChart,
  orders,
  bcvRate,
  deliveryStaffSharePercent = 100,
  locale,
}: {
  restaurantName: string;
  currency: string;
  summary: SalesSummary;
  daily: DailySales[];
  dailyChart: DailySales[];
  monthlyChart: MonthlySales[];
  orders: SalesOrder[];
  bcvRate: number | null;
  deliveryStaffSharePercent?: number;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.salesPage };
  const [exporting, setExporting] = useState(false);
  const [exportingByMethod, setExportingByMethod] = useState(false);
  const [period, setPeriod] = useState<SalesPeriod>("today");
  const bsFor = (amountUsd: number) => (bcvRate ? formatBs(amountUsd, bcvRate) : null);

  const periodLabels: Record<SalesPeriod, string> = {
    today: t.periodToday,
    week: t.periodWeek,
    month: t.periodMonth,
    year: t.periodYear,
    all: t.periodAll,
  };
  const byPaymentMethod = useMemo(
    () =>
      groupSalesByPaymentMethod(
        filterOrdersByPeriod(orders, period),
        deliveryStaffSharePercent,
      ),
    [orders, period, deliveryStaffSharePercent],
  );

  const methodLabel = (method: string | null) =>
    method ? (PAYMENT_METHOD_META[method as PaymentMethodId]?.label ?? method) : t.noPaymentMethod;
  const methodBsTotal = (row: { method: string | null; total: number }) =>
    row.method && bcvRate && PAYMENT_METHOD_META[row.method as PaymentMethodId]?.convertToVes
      ? formatBs(row.total, bcvRate)
      : null;

  const exportPdf = () => {
    setExporting(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`${restaurantName} — ${t.pdfTitle}`, 14, 18);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(t.pdfGeneratedAt(new Date().toLocaleString("es-VE")), 14, 24);

      autoTable(doc, {
        startY: 32,
        head: [[t.salesToday, t.salesMonth, t.salesYear, t.salesAllTime]],
        body: [
          [
            formatPrice(summary.today, currency),
            formatPrice(summary.month, currency),
            formatPrice(summary.year, currency),
            formatPrice(summary.allTime, currency),
          ],
        ],
        theme: "grid",
      });

      const afterSummaryY =
        (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
          .finalY + 10;

      autoTable(doc, {
        startY: afterSummaryY,
        head: [[t.dateColumn, t.ordersColumn, t.totalColumn]],
        body: daily.map((row) => [
          formatDayLabel(row.day),
          String(row.count),
          formatPrice(row.total, currency),
        ]),
        theme: "striped",
      });

      doc.save(`ventas-${restaurantName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const exportPaymentMethodPdf = () => {
    setExportingByMethod(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(
        `${restaurantName} — ${t.pdfPaymentMethodTitle} (${periodLabels[period]})`,
        14,
        18,
      );
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(t.pdfGeneratedAt(new Date().toLocaleString("es-VE")), 14, 24);

      autoTable(doc, {
        startY: 32,
        head: [[t.methodColumn, t.ordersColumn, t.totalUsdColumn, t.totalBsColumn]],
        body: byPaymentMethod.map((row) => [
          methodLabel(row.method),
          String(row.count),
          formatPrice(row.total, currency),
          methodBsTotal(row) ?? "—",
        ]),
        theme: "striped",
      });

      doc.save(
        `ventas-por-metodo-de-pago-${restaurantName.toLowerCase().replace(/\s+/g, "-")}.pdf`,
      );
    } finally {
      setExportingByMethod(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{t.title}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label={t.salesToday}
          value={formatPrice(summary.today, currency)}
          subValue={bsFor(summary.today)}
        />
        <StatCard
          label={t.salesMonth}
          value={formatPrice(summary.month, currency)}
          subValue={bsFor(summary.month)}
        />
        <StatCard
          label={t.salesYear}
          value={formatPrice(summary.year, currency)}
          subValue={bsFor(summary.year)}
        />
        <StatCard
          label={t.salesAllTime}
          value={formatPrice(summary.allTime, currency)}
          subValue={bsFor(summary.allTime)}
        />
      </div>

      <SalesCharts
        daily={dailyChart}
        monthly={monthlyChart}
        currency={currency}
        dailyTitle={t.dailyChartTitle}
        monthlyTitle={t.monthlyChartTitle}
        orderSingular={t.orderSingular}
        orderPlural={t.orderPlural}
      />

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            {t.byPaymentMethod}
          </h2>
          {byPaymentMethod.length > 0 && (
            <button
              type="button"
              disabled={exportingByMethod}
              onClick={exportPaymentMethodPdf}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
            >
              {exportingByMethod ? t.exporting : `📄 ${t.exportPdf}`}
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(Object.keys(periodLabels) as SalesPeriod[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPeriod(id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                period === id
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              {periodLabels[id]}
            </button>
          ))}
        </div>

        {byPaymentMethod.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.empty}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
                <th className="pb-2">{t.methodColumn}</th>
                <th className="pb-2">{t.ordersColumn}</th>
                <th className="pb-2 text-right">{t.totalUsdColumn}</th>
                <th className="pb-2 text-right">{t.totalBsColumn}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {byPaymentMethod.map((row) => (
                <tr key={row.method ?? "__none__"}>
                  <td className="py-2 text-neutral-800 dark:text-neutral-200">
                    {methodLabel(row.method)}
                  </td>
                  <td className="py-2 text-neutral-600 dark:text-neutral-400">{row.count}</td>
                  <td className="py-2 text-right font-medium text-neutral-900 dark:text-white">
                    {formatPrice(row.total, currency)}
                  </td>
                  <td className="py-2 text-right text-neutral-600 dark:text-neutral-400">
                    {methodBsTotal(row) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            {t.dailyBreakdown}
          </h2>
          {daily.length > 0 && (
            <button
              type="button"
              disabled={exporting}
              onClick={exportPdf}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 disabled:opacity-60 dark:border-neutral-700 dark:text-neutral-300"
            >
              {exporting ? t.exporting : `📄 ${t.exportPdf}`}
            </button>
          )}
        </div>

        {daily.length === 0 ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t.empty}</p>
        ) : (
          <div className="max-h-[28rem] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
                  <th className="pb-2">{t.dateColumn}</th>
                  <th className="pb-2">{t.ordersColumn}</th>
                  <th className="pb-2 text-right">{t.totalColumn}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {daily.map((row) => (
                  <tr key={row.day}>
                    <td className="py-2 text-neutral-800 dark:text-neutral-200">
                      {formatDayLabel(row.day)}
                    </td>
                    <td className="py-2 text-neutral-600 dark:text-neutral-400">
                      {row.count}
                    </td>
                    <td className="py-2 text-right font-medium text-neutral-900 dark:text-white">
                      {formatPrice(row.total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subValue,
}: {
  label: string;
  value: string;
  subValue?: string | null;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
        {value}
      </p>
      {subValue && (
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          {subValue}
        </p>
      )}
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
    </div>
  );
}
