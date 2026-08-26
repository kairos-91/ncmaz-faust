"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { GoogleAuthButton } from "@/components/google-auth-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SignupForm({ t }: { t: Dictionary["auth"] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupInput) => {
    setFormError(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setFormError(
        error.message.includes("already registered")
          ? t.signup.errorExists
          : t.signup.errorGeneric,
      );
      return;
    }

    if (data.session) {
      router.push("/admin");
      router.refresh();
      return;
    }

    setCheckEmail(true);
  };

  if (checkEmail) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        {t.signup.checkEmail}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <GoogleAuthButton label={t.continueWithGoogle} />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-xs uppercase text-neutral-400 dark:text-neutral-500">
          {t.orDivider}
        </span>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">{t.signup.fullNameLabel}</Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder={t.signup.fullNamePlaceholder}
            {...register("fullName")}
          />
          <FieldError message={errors.fullName?.message} />
        </div>
        <div>
          <Label htmlFor="email">{t.signup.emailLabel}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@restaurante.com"
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="password">{t.signup.passwordLabel}</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t.signup.passwordPlaceholder}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t.signup.submitting : t.signup.submit}
        </Button>
      </form>
    </div>
  );
}
