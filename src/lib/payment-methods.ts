export type PaymentMethodId =
  | "pago_movil"
  | "transferencia"
  | "zelle"
  | "binance"
  | "zinli"
  | "wally";

export type PaymentMethodValues = {
  pago_movil: { enabled: boolean; banco: string; telefono: string; cedula: string };
  transferencia: {
    enabled: boolean;
    banco: string;
    cuenta: string;
    titular: string;
    rif: string;
  };
  zelle: { enabled: boolean; correo: string; titular: string };
  binance: { enabled: boolean; payId: string; red: string };
  zinli: { enabled: boolean; usuario: string };
  wally: { enabled: boolean; usuario: string };
};

export const DEFAULT_PAYMENT_METHODS: PaymentMethodValues = {
  pago_movil: { enabled: false, banco: "", telefono: "", cedula: "" },
  transferencia: { enabled: false, banco: "", cuenta: "", titular: "", rif: "" },
  zelle: { enabled: false, correo: "", titular: "" },
  binance: { enabled: false, payId: "", red: "USDT (BEP20)" },
  zinli: { enabled: false, usuario: "" },
  wally: { enabled: false, usuario: "" },
};

export const PAYMENT_METHOD_IDS: PaymentMethodId[] = [
  "pago_movil",
  "transferencia",
  "zelle",
  "binance",
  "zinli",
  "wally",
];

export const PAYMENT_METHOD_META: Record<
  PaymentMethodId,
  {
    label: string;
    convertToVes: boolean;
    fields: { key: string; label: string; placeholder?: string }[];
  }
> = {
  pago_movil: {
    label: "Pago Móvil",
    convertToVes: true,
    fields: [
      { key: "banco", label: "Banco", placeholder: "Banco Nacional de Crédito" },
      { key: "telefono", label: "Teléfono", placeholder: "0412-0000000" },
      { key: "cedula", label: "Cédula/RIF", placeholder: "V-12345678" },
    ],
  },
  transferencia: {
    label: "Transferencia",
    convertToVes: true,
    fields: [
      { key: "banco", label: "Banco", placeholder: "Banco Nacional de Crédito" },
      { key: "cuenta", label: "Nº de cuenta", placeholder: "0000-0000-00-0000000000" },
      { key: "titular", label: "Titular", placeholder: "Nombre del restaurante" },
      { key: "rif", label: "RIF", placeholder: "J-00000000-0" },
    ],
  },
  zelle: {
    label: "Zelle",
    convertToVes: false,
    fields: [
      { key: "correo", label: "Correo", placeholder: "pagos@turestaurante.com" },
      { key: "titular", label: "Titular", placeholder: "Nombre del restaurante" },
    ],
  },
  binance: {
    label: "Binance",
    convertToVes: false,
    fields: [
      { key: "payId", label: "Binance Pay ID", placeholder: "000000000" },
      { key: "red", label: "Red", placeholder: "USDT (BEP20)" },
    ],
  },
  zinli: {
    label: "Zinli",
    convertToVes: false,
    fields: [
      { key: "usuario", label: "Usuario/Teléfono", placeholder: "+58 412-0000000" },
    ],
  },
  wally: {
    label: "Wally",
    convertToVes: false,
    fields: [
      { key: "usuario", label: "Usuario/Teléfono", placeholder: "+58 412-0000000" },
    ],
  },
};

export function parsePaymentMethods(json: unknown): PaymentMethodValues {
  const parsed = (json && typeof json === "object" ? json : {}) as Partial<
    Record<PaymentMethodId, Record<string, unknown>>
  >;

  const result = {} as PaymentMethodValues;
  for (const id of PAYMENT_METHOD_IDS) {
    result[id] = { ...DEFAULT_PAYMENT_METHODS[id], ...parsed[id] } as never;
  }
  return result;
}

export function enabledPaymentMethods(values: PaymentMethodValues) {
  return PAYMENT_METHOD_IDS.filter((id) => values[id].enabled);
}
