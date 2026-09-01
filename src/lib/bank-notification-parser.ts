// Parseo genérico de notificaciones bancarias venezolanas (SMS o correo de
// Pago Móvil/transferencia). No está calibrado contra un formato exacto de
// ningún banco en particular — usa patrones comunes a la mayoría (monto en
// "Bs" y un número de referencia/operación largo). Si falla al extraer
// monto o referencia, la notificación igual se guarda para revisión
// manual, solo que no se auto-aprueba ningún pago.

const KNOWN_BANKS = [
  "banesco",
  "mercantil",
  "venezuela",
  "bnc",
  "provincial",
  "bancaribe",
  "banplus",
  "bicentenario",
  "exterior",
  "bfc",
  "activo",
  "banco tesoro",
  "fondo comun",
  "sofitasa",
  "plaza",
];

export function parseBankAmount(text: string): number | null {
  const match = text.match(/bs\.?\s*([\d.,]+)/i);
  if (!match) return null;
  let raw = match[1];
  if (raw.includes(",")) {
    raw = raw.replace(/\./g, "").replace(",", ".");
  } else if ((raw.match(/\./g) ?? []).length > 1) {
    // Varios puntos sin coma: son separadores de miles ("1.234.567").
    raw = raw.replace(/\./g, "");
  }
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : null;
}

export function parseBankReference(text: string): string | null {
  const labeled = text.match(
    /(?:referencia|ref\.?|nro\.?\s*de\s*referencia|numero de operacion|n[uú]mero de operaci[oó]n)[:\s]*([0-9]{4,})/i,
  );
  if (labeled) return labeled[1];

  const digitRuns = text.match(/\d{6,}/g);
  if (digitRuns && digitRuns.length > 0) {
    return [...digitRuns].sort((a, b) => b.length - a.length)[0];
  }
  return null;
}

export function parseBankName(text: string): string | null {
  const lower = text.toLowerCase();
  return KNOWN_BANKS.find((bank) => lower.includes(bank)) ?? null;
}

export function parseBankNotification(text: string) {
  return {
    amount: parseBankAmount(text),
    reference: parseBankReference(text),
    bank: parseBankName(text),
  };
}
