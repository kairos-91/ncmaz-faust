"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/dictionaries";

export function MobileMenu({
  locale,
  t,
}: {
  locale: Locale;
  t: {
    howItWorks: string;
    partners: string;
    pricing: string;
    login: string;
    startFree: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={
          open
            ? locale === "es"
              ? "Cerrar menú"
              : "Close menu"
            : locale === "es"
              ? "Abrir menú"
              : "Open menu"
        }
        className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20"
              onClick={close}
              aria-hidden="true"
            />
            <div
              className="fixed z-50 w-64 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
              style={{ top: position.top, right: position.right }}
            >
              <nav className="flex flex-col gap-1 rounded-xl bg-neutral-50 p-2 dark:bg-neutral-800/60">
                <Link
                  href="/#how-it-works"
                  onClick={close}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-white dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  {t.howItWorks}
                </Link>
                <Link
                  href="/#aliados"
                  onClick={close}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-white dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  {t.partners}
                </Link>
                <Link
                  href="/#pricing"
                  onClick={close}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-white dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  {t.pricing}
                </Link>
              </nav>

              <div className="mt-3 flex flex-col gap-2">
                <Link href="/login" onClick={close}>
                  <Button variant="secondary" className="w-full">
                    {t.login}
                  </Button>
                </Link>
                <Link href="/signup" onClick={close}>
                  <Button className="w-full dark:bg-lime-400 dark:text-neutral-950 dark:hover:bg-lime-300">
                    {t.startFree}
                  </Button>
                </Link>
              </div>
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
