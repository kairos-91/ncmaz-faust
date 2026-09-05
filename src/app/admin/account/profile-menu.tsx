"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Globe, LogOut, Moon, UserCircle } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export function ProfileMenu({
  email,
  avatarUrl,
  locale,
}: {
  email: string | null;
  avatarUrl: string | null;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t = dict.profileMenu;

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initial = email?.[0]?.toUpperCase() ?? "?";
  const [avatarBroken, setAvatarBroken] = useState(false);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label={t.menuLabel}
      >
        {avatarUrl && !avatarBroken ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            unoptimized
            onError={() => setAvatarBroken(true)}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-100 text-sm font-semibold text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
            {initial}
          </span>
        )}
        <ChevronDown className="hidden h-4 w-4 shrink-0 text-neutral-400 sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          {email && (
            <div className="truncate px-3 py-2 text-xs text-neutral-500 dark:text-neutral-500">
              {email}
            </div>
          )}

          <Link
            href="/admin/account"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <UserCircle className="h-4 w-4 shrink-0" />
            {t.myAccount}
          </Link>

          {/* Idioma/tema ya están en la barra superior en escritorio —
              aquí solo se muestran en móvil, donde esa barra los oculta. */}
          <div className="flex items-center justify-between rounded-xl px-3 py-1 md:hidden">
            <span className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Globe className="h-4 w-4 shrink-0" />
              {t.language}
            </span>
            <LanguageToggle locale={locale} />
          </div>
          <div className="flex items-center justify-between rounded-xl px-3 py-1 md:hidden">
            <span className="flex items-center gap-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <Moon className="h-4 w-4 shrink-0" />
              {t.theme}
            </span>
            <ThemeToggle />
          </div>

          <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-800" />

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {dict.adminNav.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
