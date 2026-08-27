"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ResetPasswordForm({ t }: { t: Dictionary["auth"] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

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
      setFormError(t.resetPassword.errorGeneric);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="password">{t.resetPassword.passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder={t.resetPassword.passwordPlaceholder}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">{t.resetPassword.confirmLabel}</Label>
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
        {isSubmitting ? t.resetPassword.submitting : t.resetPassword.submit}
      </Button>
    </form>
  );
}
