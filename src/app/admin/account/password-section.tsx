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
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export function PasswordSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).profileMenu;
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (values: ResetPasswordInput) => {
    setFormError(null);
    setSuccess(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setFormError(t.passwordErrorGeneric);
      return;
    }
    setSuccess(true);
    reset();
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm space-y-4">
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
      {success && <p className="text-sm text-green-600">{t.passwordSuccess}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t.saving : t.save}
      </Button>
    </form>
  );
}
