"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { DailySales, MonthlySales } from "@/lib/sales";

// Azul validado (slot categórico 1) para la serie de ventas — ver skill de
// dataviz. Una sola serie no necesita leyenda: el título ya dice qué se mide.
const SERIES_FILL = "fill-[#2a78d6] dark:fill-[#3987e5]";
const SERIES_STROKE = "stroke-[#2a78d6] dark:stroke-[#3987e5]";
const SERIES_AREA_FILL = "fill-[#2a78d6]/10 dark:fill-[#3987e5]/10";

function niceStep(roughStep: number): number {
  if (roughStep <= 0) return 1;
  const exponent = Math.floor(Math.log10(roughStep));
  const fraction = roughStep / 10 ** exponent;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

function computeTicks(maxValue: number, tickCount = 4): number[] {
  if (maxValue <= 0) return [0, 1];
  const step = niceStep(maxValue / tickCount);
  const niceMax = Math.ceil(maxValue / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= niceMax + step / 1000; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return ticks;
}

function topRoundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.max(0, Math.min(r, h, w / 2));
  if (h <= 0) return "";
  return `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`;
}

function dayTooltipLabel(day: string) {
  const [year, month, dayOfMonth] = day.split("-").map(Number);
  return new Date(year, month - 1, dayOfMonth).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Sin notation:"compact": Node (SSR) y Chromium (cliente) formatean números
// compactos con ICU distinto (ej. "USD 0,0" vs "USD 0" para 0), lo que
// provoca un error de hidratación. El formato agrupado simple sí coincide
// byte a byte entre servidor y navegador.
function compactCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

const WIDTH = 720;
const HEIGHT = 260;
const MARGIN = { top: 16, right: 12, bottom: 32, left: 56 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
        {title}
      </h2>
      {children}
    </div>
  );
}

export function DailySalesChart({
  data,
  currency,
  orderSingular,
  orderPlural,
}: {
  data: DailySales[];
  currency: string;
  orderSingular: string;
  orderPlural: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxValue = Math.max(0, ...data.map((d) => d.total));
  const ticks = computeTicks(maxValue);
  const topTick = ticks[ticks.length - 1] || 1;

  const band = PLOT_WIDTH / data.length;
  const barWidth = Math.min(24, band - 2);

  const yFor = (value: number) => MARGIN.top + PLOT_HEIGHT - (value / topTick) * PLOT_HEIGHT;

  const active = hovered !== null ? data[hovered] : null;
  const activeX = hovered !== null ? MARGIN.left + hovered * band + band / 2 : 0;

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Ventas diarias"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              className="stroke-neutral-200 dark:stroke-neutral-800"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 8}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-neutral-500 text-[10px] dark:fill-neutral-500"
            >
              {compactCurrency(tick, currency)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const x = MARGIN.left + i * band + (band - barWidth) / 2;
          const y = yFor(d.total);
          const h = MARGIN.top + PLOT_HEIGHT - y;
          const showLabel = i % 5 === 0 || i === data.length - 1;
          const [, month, dayOfMonth] = d.day.split("-");
          return (
            <g key={d.day}>
              <rect
                x={MARGIN.left + i * band}
                y={MARGIN.top}
                width={band}
                height={PLOT_HEIGHT}
                fill="transparent"
                onPointerEnter={() => setHovered(i)}
                onPointerLeave={() => setHovered((prev) => (prev === i ? null : prev))}
                onFocus={() => setHovered(i)}
                onBlur={() => setHovered((prev) => (prev === i ? null : prev))}
                tabIndex={0}
                className="cursor-pointer outline-none"
              />
              <path
                d={topRoundedRectPath(x, y, barWidth, h, 4)}
                className={`${SERIES_FILL} pointer-events-none transition-opacity ${
                  hovered === null || hovered === i ? "opacity-100" : "opacity-40"
                }`}
              />
              {showLabel && (
                <text
                  x={MARGIN.left + i * band + band / 2}
                  y={HEIGHT - MARGIN.bottom + 16}
                  textAnchor="middle"
                  className="fill-neutral-500 text-[10px] dark:fill-neutral-500"
                >
                  {dayOfMonth}/{month}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {active && hovered !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
          style={{
            left: `${(activeX / WIDTH) * 100}%`,
            top: `${(yFor(active.total) / HEIGHT) * 100 - 2}%`,
          }}
        >
          <p className="font-semibold text-neutral-900 dark:text-white">
            {formatPrice(active.total, currency)}
          </p>
          <p className="text-neutral-500 dark:text-neutral-400">
            {dayTooltipLabel(active.day)} · {active.count}{" "}
            {active.count === 1 ? orderSingular : orderPlural}
          </p>
        </div>
      )}
    </div>
  );
}

export function MonthlySalesChart({
  data,
  currency,
}: {
  data: MonthlySales[];
  currency: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxValue = Math.max(0, ...data.map((d) => d.total));
  const ticks = computeTicks(maxValue);
  const topTick = ticks[ticks.length - 1] || 1;

  const band = PLOT_WIDTH / (data.length - 1 || 1);
  const yFor = (value: number) => MARGIN.top + PLOT_HEIGHT - (value / topTick) * PLOT_HEIGHT;
  const xFor = (i: number) => MARGIN.left + i * band;

  const linePath = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(d.total)}`)
    .join(" ");
  const areaPath = `${linePath} L${xFor(data.length - 1)},${MARGIN.top + PLOT_HEIGHT} L${xFor(0)},${MARGIN.top + PLOT_HEIGHT} Z`;

  const active = hovered !== null ? data[hovered] : null;

  const monthLabel = (key: string) => {
    const [year, month] = key.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("es-VE", {
      month: "short",
    });
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Ventas mensuales"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={yFor(tick)}
              y2={yFor(tick)}
              className="stroke-neutral-200 dark:stroke-neutral-800"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 8}
              y={yFor(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-neutral-500 text-[10px] dark:fill-neutral-500"
            >
              {compactCurrency(tick, currency)}
            </text>
          </g>
        ))}

        <path d={areaPath} className={`${SERIES_AREA_FILL} pointer-events-none`} />
        <path
          d={linePath}
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          className={`${SERIES_STROKE} pointer-events-none`}
        />

        {hovered !== null && (
          <line
            x1={xFor(hovered)}
            x2={xFor(hovered)}
            y1={MARGIN.top}
            y2={MARGIN.top + PLOT_HEIGHT}
            className="stroke-neutral-300 dark:stroke-neutral-700"
            strokeWidth={1}
          />
        )}

        {data.map((d, i) => (
          <circle
            key={d.month}
            cx={xFor(i)}
            cy={yFor(d.total)}
            r={i === data.length - 1 ? 5 : 4}
            className={`${SERIES_FILL} stroke-white dark:stroke-neutral-900 pointer-events-none`}
            strokeWidth={2}
            opacity={i === data.length - 1 || hovered === i ? 1 : 0}
          />
        ))}

        {data.map((d, i) => (
          <g key={`hit-${d.month}`}>
            <rect
              x={xFor(i) - band / 2}
              y={MARGIN.top}
              width={band}
              height={PLOT_HEIGHT}
              fill="transparent"
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((prev) => (prev === i ? null : prev))}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered((prev) => (prev === i ? null : prev))}
              tabIndex={0}
              className="cursor-pointer outline-none"
            />
            <text
              x={xFor(i)}
              y={HEIGHT - MARGIN.bottom + 16}
              textAnchor="middle"
              className="fill-neutral-500 text-[10px] capitalize dark:fill-neutral-500"
            >
              {monthLabel(d.month)}
            </text>
          </g>
        ))}
      </svg>

      {active && hovered !== null && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
          style={{
            left: `${(xFor(hovered) / WIDTH) * 100}%`,
            top: `${(yFor(active.total) / HEIGHT) * 100 - 2}%`,
          }}
        >
          <p className="font-semibold text-neutral-900 dark:text-white">
            {formatPrice(active.total, currency)}
          </p>
          <p className="capitalize text-neutral-500 dark:text-neutral-400">
            {monthLabel(active.month)}
          </p>
        </div>
      )}
    </div>
  );
}

export function SalesCharts({
  daily,
  monthly,
  currency,
  dailyTitle,
  monthlyTitle,
  orderSingular,
  orderPlural,
}: {
  daily: DailySales[];
  monthly: MonthlySales[];
  currency: string;
  dailyTitle: string;
  monthlyTitle: string;
  orderSingular: string;
  orderPlural: string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title={dailyTitle}>
        <DailySalesChart
          data={daily}
          currency={currency}
          orderSingular={orderSingular}
          orderPlural={orderPlural}
        />
      </ChartCard>
      <ChartCard title={monthlyTitle}>
        <MonthlySalesChart data={monthly} currency={currency} />
      </ChartCard>
    </div>
  );
}
