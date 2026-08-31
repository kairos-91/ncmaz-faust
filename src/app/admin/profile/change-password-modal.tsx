"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ChangePasswordModal({
  t,
  onClose,
}: {
  t: Dictionary["profileMenu"];
  onClose: () => void;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordInput) => {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFormError(t.passwordErrorGeneric);
      return;
    }
    setSuccess(true);
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            {t.changePassword}
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

        {success ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t.passwordSuccess}
            </p>
            <Button type="button" className="w-full" onClick={onClose}>
              {t.close}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="password">{t.newPasswordLabel}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>
            <div>
              <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? t.saving : t.save}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
