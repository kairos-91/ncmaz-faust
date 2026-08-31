"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteAccountModal } from "./delete-account-modal";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function DeleteAccountSection({ t }: { t: Dictionary["profileMenu"] }) {
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
