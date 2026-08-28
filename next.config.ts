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
  async redirects() {
    // El menú público se movió de /r/mi-restaurante a /mi-restaurante.
    // Se deja este redirect permanente para que los QR ya impresos y los
    // enlaces ya compartidos con el formato viejo sigan funcionando.
    return [
      { source: "/r/:slug", destination: "/:slug", permanent: true },
      { source: "/r/:slug/:path*", destination: "/:slug/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
