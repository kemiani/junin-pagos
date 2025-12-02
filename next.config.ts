import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (incluye PPR - Partial Prerendering) para Next.js 16
  cacheComponents: true,

  experimental: {
    // Optimización de paquetes
    optimizePackageImports: ["lucide-react"],
  },

  // Optimización de imágenes
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
  },

  // Headers de seguridad y caché
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          // Headers de seguridad adicionales
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache estático agresivo para assets
        source: "/(.*).(ico|svg|png|jpg|jpeg|webp|avif|woff|woff2)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Compresión habilitada
  compress: true,

  // Generar ETags para caché
  generateEtags: true,

  // Trailing slash consistente
  trailingSlash: false,

  // Powered by header deshabilitado por seguridad
  poweredByHeader: false,
};

export default nextConfig;
