import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getStaffRestaurant } from "@/lib/get-owner-restaurant";
import { getT } from "@/lib/i18n/locale";
import { AvatarSection } from "./avatar-section";
import { PasswordSection } from "./password-section";
import { DeleteAccountSection } from "./delete-account-section";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const { userEmail, avatarUrl, isGoogleAccount } = await getStaffRestaurant();
  if (!userEmail) redirect("/login");

  const { locale, t } = await getT();
  const pt = t.profileMenu;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{pt.accountPageTitle}</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {pt.accountPageSubtitle}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
          {pt.photoSectionTitle}
        </h2>
        <div className="mt-3">
          {isGoogleAccount ? (
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-lime-100 text-xl font-semibold text-lime-700 dark:bg-lime-400/10 dark:text-lime-400">
                  {userEmail[0]?.toUpperCase()}
                </span>
              )}
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                {pt.googleManagedPhoto}
              </p>
            </div>
          ) : (
            <AvatarSection email={userEmail} avatarUrl={avatarUrl} locale={locale} />
          )}
        </div>
      </div>

      {!isGoogleAccount && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            {pt.passwordSectionTitle}
          </h2>
          <div className="mt-3">
            <PasswordSection locale={locale} />
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 dark:border-red-900/40 dark:bg-red-950/10">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">
          {pt.dangerZoneTitle}
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {pt.dangerZoneBody}
        </p>
        <div className="mt-3">
          <DeleteAccountSection locale={locale} />
        </div>
      </div>
    </div>
  );
}
