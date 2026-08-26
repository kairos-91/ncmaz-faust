"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ReceiptPasteZone } from "./receipt-paste-zone";

export type ConfirmPaymentValues = {
  bankPaidFrom: string;
  reference: string;
  amountPaid: string;
};

export function ConfirmPaymentFields({
  values,
  onChange,
  upload,
  onReceiptUploaded,
}: {
  values: ConfirmPaymentValues;
  onChange: (values: ConfirmPaymentValues) => void;
  upload: (formData: FormData) => Promise<{ url?: string; error?: string }>;
  onReceiptUploaded: (url: string | null) => void;
}) {
  const set = (patch: Partial<ConfirmPaymentValues>) =>
    onChange({ ...values, ...patch });

  return (
    <div className="space-y-3 border-t border-neutral-100 pt-4 dark:border-neutral-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Confirma tu pago
      </p>

      <div>
        <Label htmlFor="bankPaidFrom">Banco desde el que pagaste</Label>
        <Input
          id="bankPaidFrom"
          value={values.bankPaidFrom}
          onChange={(e) => set({ bankPaidFrom: e.target.value })}
          placeholder="Banesco"
        />
      </div>

      <div>
        <Label htmlFor="reference">Referencia (últimos 6 dígitos)</Label>
        <Input
          id="reference"
          value={values.reference}
          onChange={(e) => set({ reference: e.target.value })}
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
        />
      </div>

      <div>
        <Label htmlFor="amountPaid">Monto pagado (Bs)</Label>
        <Input
          id="amountPaid"
          value={values.amountPaid}
          onChange={(e) => set({ amountPaid: e.target.value })}
          placeholder="0,00"
          inputMode="decimal"
        />
      </div>

      <div>
        <Label>Comprobante de pago (imagen)</Label>
        <ReceiptPasteZone upload={upload} onUploaded={onReceiptUploaded} />
      </div>
    </div>
  );
}
