"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteAccountModal } from "./delete-account-modal";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export function DeleteAccountSection({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).profileMenu;
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="danger" size="sm" onClick={() => setOpen(true)}>
        {t.deleteAccount}
      </Button>
      {open && <DeleteAccountModal t={t} onClose={() => setOpen(false)} />}
    </>
  );
}
