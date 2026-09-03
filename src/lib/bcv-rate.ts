export type BcvRate = {
  rate: number;
  updatedAt: string | null;
};

// Restaurantes en USD y EUR muestran su equivalente en bolívares a la
// tasa oficial del BCV; el resto de monedas no tiene una tasa BCV que
// aplicarles, así que siempre caen en dólares/oficial por compatibilidad.
const BCV_ENDPOINT_BY_CURRENCY: Record<string, string> = {
  EUR: "https://ve.dolarapi.com/v1/euros/oficial",
  USD: "https://ve.dolarapi.com/v1/dolares/oficial",
};

export async function getBcvRate(currency = "USD"): Promise<BcvRate | null> {
  try {
    const endpoint = BCV_ENDPOINT_BY_CURRENCY[currency] ?? BCV_ENDPOINT_BY_CURRENCY.USD;
    const res = await fetch(endpoint, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      promedio?: number;
      fechaActualizacion?: string;
    };
    if (typeof data.promedio !== "number" || data.promedio <= 0) return null;

    return { rate: data.promedio, updatedAt: data.fechaActualizacion ?? null };
  } catch {
    return null;
  }
}

export function formatBs(amountUsd: number, rate: number) {
  // Intl's "VES" currency symbol renders as "Bs.S" (bolívar soberano) in
  // Node's ICU data — format the number plainly and prefix "Bs" ourselves.
  const amount = new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountUsd * rate);
  return `Bs ${amount}`;
}

export function formatBsAmount(amountUsd: number, rate: number) {
  return new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountUsd * rate);
}
