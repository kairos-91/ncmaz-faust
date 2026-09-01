"use client";

import { useState, useTransition } from "react";
import { Check, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { testBankNotification } from "../actions";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import type { BankNotification } from "@/lib/supabase/database.types";

export function BankNotificationsManager({
  notifications,
  webhookUrl,
  locale,
}: {
  notifications: BankNotification[];
  webhookUrl: string;
  locale: Locale;
}) {
  const t = getDictionary(locale).superadminBankNotifications;

  return (
    <div className="space-y-6">
      <WebhookInfoCard webhookUrl={webhookUrl} t={t} />
      <TesterCard t={t} />
      <NotificationsList notifications={notifications} locale={locale} t={t} />
    </div>
  );
}

function WebhookInfoCard({
  webhookUrl,
  t,
}: {
  webhookUrl: string;
  t: ReturnType<typeof getDictionary>["superadminBankNotifications"];
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sin acceso al portapapeles (http, permisos): no rompe nada, solo
      // el usuario copia la URL a mano.
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
        {t.webhookTitle}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        {t.webhookBody}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
          {webhookUrl}
        </code>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <Copy className="h-3.5 w-3.5" />
          {copied ? t.copied : t.copy}
        </button>
      </div>
    </div>
  );
}

function TesterCard({
  t,
}: {
  t: ReturnType<typeof getDictionary>["superadminBankNotifications"];
}) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<
    | { matched: boolean; parsed: { amount: number | null; reference: string | null; bank: string | null } }
    | { error: string }
    | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const run = () => {
    if (!text.trim()) return;
    setResult(null);
    startTransition(async () => {
      const outcome = await testBankNotification(text);
      setResult(outcome);
    });
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
        {t.testTitle}
      </h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.testBody}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={t.testPlaceholder}
        className="mt-3 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
      />
      <button
        type="button"
        disabled={isPending || !text.trim()}
        onClick={run}
        className="mt-3 rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
      >
        {isPending ? t.testing : t.testButton}
      </button>

      {result && "error" in result && (
        <p className="mt-3 text-sm text-red-600">{result.error}</p>
      )}
      {result && "matched" in result && (
        <div
          className={cn(
            "mt-3 rounded-lg p-3 text-sm",
            result.matched
              ? "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400"
              : "bg-orange-50 text-orange-700 dark:bg-orange-400/10 dark:text-orange-400",
          )}
        >
          <p className="font-medium">
            {result.matched ? t.testResultMatched : t.testResultUnmatched}
          </p>
          <p className="mt-1 text-xs opacity-80">
            {t.fieldAmount}: {result.parsed.amount ?? "—"} · {t.fieldReference}:{" "}
            {result.parsed.reference ?? "—"} · {t.fieldBank}: {result.parsed.bank ?? "—"}
          </p>
        </div>
      )}
    </div>
  );
}

function NotificationsList({
  notifications,
  locale,
  t,
}: {
  notifications: BankNotification[];
  locale: Locale;
  t: ReturnType<typeof getDictionary>["superadminBankNotifications"];
}) {
  if (notifications.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
        {t.empty}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              {new Date(n.received_at).toLocaleString(locale === "en" ? "en-US" : "es-VE", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                n.matched_payment_id
                  ? "bg-green-50 text-green-700 dark:bg-green-400/10 dark:text-green-400"
                  : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400",
              )}
            >
              {n.matched_payment_id ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )}
              {n.matched_payment_id ? t.matched : t.unmatched}
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
            {t.fieldAmount}: {n.amount ?? "—"} · {t.fieldReference}: {n.reference ?? "—"} ·{" "}
            {t.fieldBank}: {n.bank ?? "—"}
          </p>
          <p className="mt-2 break-words text-xs text-neutral-500 dark:text-neutral-500">
            {n.raw_text}
          </p>
        </div>
      ))}
    </div>
  );
}
