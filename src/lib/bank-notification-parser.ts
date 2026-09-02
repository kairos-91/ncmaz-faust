// Parseo genérico de notificaciones bancarias venezolanas (SMS o correo de
// Pago Móvil/transferencia). Calibrado contra los correos reales de Banco
// Exterior, que traen los campos en formato "*Etiqueta:* *Valor*" (los
// asteriscos vienen del correo original, no son nuestros) — por eso el
// separador entre la etiqueta y el valor tolera cualquier cosa que no sea
// un dígito, no solo espacios y dos puntos. Si falla al extraer monto o
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

// Hasta 20 caracteres de "ruido" (dos puntos, espacios, asteriscos,
// guiones bajos...) entre la etiqueta y el primer dígito del valor.
const LABEL_GAP = "[^\\d]{0,20}";

function findLabeledNumber(text: string, labelPattern: string): string | null {
  const match = text.match(new RegExp(`${labelPattern}${LABEL_GAP}(\\d[\\d.,]*)`, "i"));
  return match ? match[1] : null;
}

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

// Banco Exterior manda el mismo aviso para dinero que ENTRA ("has
// recibido...") y para dinero que SALE de tu propia cuenta ("ha sido
// efectuada una transacción desde..."). Solo el primero nos interesa —
// si detectamos claramente el segundo, no extraemos monto para que nunca
// se intente emparejar con un pago pendiente.
function isOutgoingTransaction(text: string): boolean {
  return /ha sido efectuada/i.test(text) && !/ha recibido/i.test(text);
}

export function parseBankAmount(text: string): number | null {
  if (isOutgoingTransaction(text)) return null;

  const bsMatch = text.match(/bs\.?\s*([\d.,]+)/i);
  if (bsMatch) return normalizeAmount(bsMatch[1]);

  const labeled = findLabeledNumber(text, "monto");
  if (labeled) return normalizeAmount(labeled);

  return null;
}

export function parseBankReference(text: string): string | null {
  const labeled = findLabeledNumber(
    text,
    "(?:referencia|ref\\.?|nro\\.?\\s*de\\s*referencia|numero de operacion|n[uú]mero de operaci[oó]n)",
  );
  if (labeled && labeled.length >= 4) return labeled;

  const digitRuns = text.match(/\d{6,}/g);
  if (digitRuns && digitRuns.length > 0) {
    return [...digitRuns].sort((a, b) => b.length - a.length)[0];
  }
  return null;
}

export function parseBankName(text: string): string | null {
  // Prioridad: el banco de ORIGEN de los fondos (el del restaurante que
  // paga), no el de destino (siempre es el tuyo, no aporta información
  // para identificar la notificación). Se busca dentro de una ventana
  // acotada después de la etiqueta, en vez de "hasta el próximo salto de
  // línea", porque estos correos a veces llegan como texto plano sin
  // saltos de línea reales.
  const originIdx = text.search(/banco\s+origen/i);
  if (originIdx !== -1) {
    const window = text.slice(originIdx, originIdx + 80).toLowerCase();
    const found = KNOWN_BANKS.find((bank) => window.includes(bank));
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
