"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendPushNotification } from "./actions";
import { getDictionary, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

type T = Dictionary["common"] & Dictionary["notificationManager"];

export function NotificationsManager({
  restaurantId,
  subscriberCount,
  locale,
}: {
  restaurantId: string;
  subscriberCount: number;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t: T = { ...dict.common, ...dict.notificationManager };
  const boundSend = sendPushNotification.bind(null, restaurantId);
  const [state, formAction, isPending] = useActionState(boundSend, null);

  return (
    <div className="space-y-6">
      <p className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        {t.subscriberCount(subscriberCount)}
      </p>

      {subscriberCount === 0 ? (
        <p className="rounded-2xl border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          {t.noSubscribers}
        </p>
      ) : (
        <form
          key={state?.sent ?? "idle"}
          action={formAction}
          className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div>
            <Label htmlFor="title">{t.titleLabel}</Label>
            <Input
              id="title"
              name="title"
              placeholder={t.titlePlaceholder}
              maxLength={65}
              required
            />
          </div>
          <div>
            <Label htmlFor="body">{t.bodyLabel}</Label>
            <textarea
              id="body"
              name="body"
              placeholder={t.bodyPlaceholder}
              maxLength={200}
              rows={3}
              required
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
            />
          </div>
          <div>
            <Label htmlFor="url">{t.urlLabel}</Label>
            <Input id="url" name="url" placeholder="/#promociones" />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? t.sending : t.send}
          </Button>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {typeof state?.sent === "number" && (
            <p className="text-sm text-green-600 dark:text-green-500">
              {t.sentSuccess(state.sent)}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
