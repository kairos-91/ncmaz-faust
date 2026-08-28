"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field-error";
import { GoogleAuthButton } from "@/components/google-auth-button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function LoginForm({ t }: { t: Dictionary["auth"] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setFormError(t.login.errorInvalid);
      return;
    }
    router.push(searchParams.get("redirect") ?? "/admin");
    router.refresh();
  };

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
          <Label htmlFor="email">{t.login.emailLabel}</Label>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t.login.passwordLabel}</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              {t.login.forgotPasswordLink}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t.login.submitting : t.login.submit}
        </Button>
      </form>
    </div>
  );
}
