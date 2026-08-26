export type BcvRate = {
  rate: number;
  updatedAt: string | null;
};

export async function getBcvRate(): Promise<BcvRate | null> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
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
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    maximumFractionDigits: 2,
  }).format(amountUsd * rate);
}
