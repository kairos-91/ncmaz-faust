"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { deleteMyAccount } from "./actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function DeleteAccountModal({
  t,
  onClose,
}: {
  t: Dictionary["profileMenu"];
  onClose: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const matches = confirmText.trim().toUpperCase() === t.deleteConfirmWord;

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteMyAccount();
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-red-600 dark:text-red-400">
            {t.deleteAccount}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {t.deleteWarning}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="confirmText">
              {t.deleteConfirmLabel(t.deleteConfirmWord)}
            </Label>
            <Input
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t.deleteConfirmWord}
              autoComplete="off"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            type="button"
            variant="danger"
            className="w-full"
            disabled={!matches || isPending}
            onClick={handleDelete}
          >
            {isPending ? t.deleting : t.deleteAccount}
          </Button>
        </div>
      </div>
    </div>
  );
}
