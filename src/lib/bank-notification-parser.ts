// Parseo genérico de notificaciones bancarias venezolanas (SMS o correo de
// Pago Móvil/transferencia). Cubre dos formas comunes: un monto con
// prefijo "Bs" en cualquier parte del texto ("Bs 1.234,56"), o un campo
// etiquetado sin ese prefijo ("Monto:    1,00", como en los correos de
// notificación de Banco Exterior). Si falla al extraer monto o
// referencia, la notificación igual se guarda para revisión manual, solo
// que no se auto-aprueba ningún pago.

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

function normalizeAmount(raw: string): number | null {
  let v = raw;
  if (v.includes(",")) {
    v = v.replace(/\./g, "").replace(",", ".");
  } else if ((v.match(/\./g) ?? []).length > 1) {
    // Varios puntos sin coma: son separadores de miles ("1.234.567").
    v = v.replace(/\./g, "");
  }
  const value = Number.parseFloat(v);
  return Number.isFinite(value) ? value : null;
}

export function parseBankAmount(text: string): number | null {
  const bsMatch = text.match(/bs\.?\s*([\d.,]+)/i);
  if (bsMatch) return normalizeAmount(bsMatch[1]);

  const labeledMatch = text.match(/monto[:\s]+([\d.,]+)/i);
  if (labeledMatch) return normalizeAmount(labeledMatch[1]);

  return null;
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
  // Prioridad: el banco de ORIGEN de los fondos (el del restaurante que
  // paga), no el de destino (siempre es el tuyo, no aporta información
  // para identificar la notificación).
  const originLabeled = text.match(/banco\s+origen[^:]*:\s*([^\n]+)/i);
  if (originLabeled) {
    const lower = originLabeled[1].toLowerCase();
    const found = KNOWN_BANKS.find((bank) => lower.includes(bank));
    if (found) return found;
  }

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
