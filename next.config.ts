import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Los comprobantes de pago pegados y las fotos de platos/logos se
      // suben vía Server Actions; el límite por defecto (1 MB) es
      // insuficiente para una captura de pantalla o foto de celular.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
