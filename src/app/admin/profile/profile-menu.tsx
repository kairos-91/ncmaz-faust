"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Camera, ChevronDown, KeyRound, LogOut, Trash2 } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { updateProfileAvatar } from "./actions";
import { ChangePasswordModal } from "./change-password-modal";
import { DeleteAccountModal } from "./delete-account-modal";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export function ProfileMenu({
  email,
  avatarUrl,
  isGoogleAccount,
  locale,
}: {
  email: string | null;
  avatarUrl: string | null;
  isGoogleAccount: boolean;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const t = dict.profileMenu;
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarChange = (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    const formData = new FormData();
    formData.set("file", file);
    startUpload(async () => {
      const result = await updateProfileAvatar(formData);
      if ("error" in result && result.error) setUploadError(result.error);
      if ("url" in result && result.url) {
        setAvatar(result.url);
        router.refresh();
      }
    });
  };

  const initial = email?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        aria-label={t.menuLabel}
      >
        {avatar ? (
          <Image
            src={avatar}
            alt=""
            width={32}
            height={32}
            unoptimized
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

          {!isGoogleAccount && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleAvatarChange(e.target.files?.[0])}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Camera className="h-4 w-4 shrink-0" />
                {isUploading ? t.uploadingPhoto : t.changePhoto}
              </button>
              {uploadError && (
                <p className="px-3 pb-1 text-xs text-red-600">{uploadError}</p>
              )}

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPasswordOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <KeyRound className="h-4 w-4 shrink-0" />
                {t.changePassword}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDeleteOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Trash2 className="h-4 w-4 shrink-0" />
                {t.deleteAccount}
              </button>

              <div className="my-1 h-px bg-neutral-100 dark:bg-neutral-800" />
            </>
          )}

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

      {passwordOpen && (
        <ChangePasswordModal t={t} onClose={() => setPasswordOpen(false)} />
      )}
      {deleteOpen && <DeleteAccountModal t={t} onClose={() => setDeleteOpen(false)} />}
    </div>
  );
}
