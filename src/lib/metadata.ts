import type { Metadata, Viewport } from "next";
import { BUSINESS } from "./constants";

const siteUrl = "https://juninpagos.com.ar";

export const viewport: Viewport = {
  themeColor: "#0891B2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Junin Pagos | Cobranzas Digitales con Comisiones Justas",
    template: "%s | Junin Pagos",
  },
  description:
    "Red de cobranzas para comercios del interior. Comisiones desde 2.7%, hasta 40% menos que MercadoPago. Sin costos de activación. Alta en 48hs.",
  keywords: [
    "cobranzas digitales",
    "pagos electrónicos",
    "cobrar con QR",
    "alternativa mercadopago",
    "comisiones bajas",
    "pagos interior argentina",
    "red de cobranzas",
    "transferencias comercio",
    "pago de servicios",
    "fintech argentina",
  ],
  authors: [{ name: BUSINESS.legalName }],
  creator: BUSINESS.legalName,
  publisher: BUSINESS.legalName,
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: siteUrl,
    siteName: BUSINESS.name,
    title: "Junin Pagos | Cobranzas Digitales con Comisiones Justas",
    description:
      "Comisiones desde 2.7%, hasta 40% menos que MercadoPago. Sin costos de activación. Alta en 48hs.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Junin Pagos - Red de cobranzas para el interior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Junin Pagos | Cobranzas Digitales con Comisiones Justas",
    description:
      "Comisiones desde 2.7%, hasta 40% menos que MercadoPago. Sin costos de activación.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "fintech",
};

// JSON-LD Schema para SEO de IA y Google
export function generateJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BUSINESS.legalName,
        alternateName: BUSINESS.name,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo.png`,
          width: 512,
          height: 512,
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: BUSINESS.phone,
          contactType: "customer service",
          availableLanguage: "Spanish",
          areaServed: "AR",
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: "Lavalle 1768, Piso 3",
          addressLocality: "Ciudad Autónoma de Buenos Aires",
          addressCountry: "AR",
        },
        taxID: BUSINESS.cuit,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: BUSINESS.name,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "es-AR",
      },
      {
        "@type": "FinancialService",
        "@id": `${siteUrl}/#service`,
        name: BUSINESS.name,
        description:
          "Red de cobranzas digitales para comercios del interior de Argentina. Ofrecemos servicios de cobranzas, transferencias y pago de servicios con comisiones desde 2.7%.",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: {
          "@type": "Country",
          name: "Argentina",
        },
        serviceType: ["Cobranzas digitales", "Transferencias", "Pago de servicios"],
        offers: {
          "@type": "Offer",
          description: "Comisiones desde 2.7%, sin costo de activación",
          price: "0",
          priceCurrency: "ARS",
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${siteUrl}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "¿Cuánto cobra Junin Pagos de comisión?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Comisión promedio del 2.7%, hasta 40% menos que MercadoPago (4.5%). Sin costos ocultos.",
            },
          },
          {
            "@type": "Question",
            name: "¿Tiene costo de activación?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Sin costo de activación ni mantenimiento. Solo pagás por transacción realizada.",
            },
          },
          {
            "@type": "Question",
            name: "¿Qué servicios ofrecen?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Cobranzas digitales, transferencias y pago de servicios. Red de cobranzas extra-bancaria.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuánto tarda el alta?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Proceso simple, operando en 24-48 horas hábiles.",
            },
          },
        ],
      },
    ],
  };
}
