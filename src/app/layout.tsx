import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { baseMetadata, viewport as viewportConfig, generateJsonLd } from "@/lib/metadata";

// Inter optimizada - solo weights necesarios
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

export const metadata: Metadata = baseMetadata;
export const viewport: Viewport = viewportConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = generateJsonLd();

  return (
    <html lang="es-AR" className={inter.variable}>
      <head>
        {/* DNS prefetch para WhatsApp */}
        <link rel="dns-prefetch" href="https://wa.me" />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900">
        {children}

        {/* JSON-LD al final del body para no bloquear render */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
