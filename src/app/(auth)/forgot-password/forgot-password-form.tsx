"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ForgotPasswordForm({ t }: { t: Dictionary["auth"] }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/reset-password`,
    });
    if (error) {
      setFormError(t.forgotPassword.errorGeneric);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {t.forgotPassword.success}
        </p>
        <a
          href="/login"
          className="block text-center text-sm font-medium text-neutral-900 underline dark:text-white"
        >
          {t.forgotPassword.backToLogin}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">{t.forgotPassword.emailLabel}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@restaurante.com"
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t.forgotPassword.submitting : t.forgotPassword.submit}
      </Button>
      <a
        href="/login"
        className="block text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        {t.forgotPassword.backToLogin}
      </a>
    </form>
  );
}
