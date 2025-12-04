import type { Metadata, Viewport } from "next";
import { BUSINESS } from "./constants";

const siteUrl = "https://juninpagos.com.ar";

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark",
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Junin Pagos | Cobrar con QR 2.7% - Alternativa a MercadoPago Argentina",
    template: "%s | Junin Pagos",
  },
  description:
    "Cobranzas digitales para comercios del interior de Argentina. Comisión 2.7% (vs 4.5% MercadoPago). Sin costo de activación. Sin terminales. Alta en 48hs. Ideal para kioscos, almacenes y comercios.",
  keywords: [
    // Intención de búsqueda principal
    "alternativa a mercadopago",
    "mercadopago comisiones altas",
    "cobrar con qr sin mercadopago",
    "procesador de pagos argentina",
    // Long-tail comercios
    "cobrar con qr kiosco",
    "cobrar con qr almacen",
    "cobrar tarjeta sin posnet",
    "aceptar pagos digitales comercio",
    // Geográficas
    "cobranzas interior argentina",
    "pagos digitales provincia buenos aires",
    "fintech argentina pymes",
    // Comparativas (para IA)
    "mercadopago vs alternativas",
    "comisiones mas bajas que mercadopago",
    "procesador pagos comisiones bajas",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Junin Pagos | Cobranzas Digitales con Comisiones Justas",
    description:
      "Comisiones desde 2.7%, hasta 40% menos que MercadoPago. Sin costos de activación.",
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
        alternateName: ["Junin Pagos", "JuninPagos"],
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/logo-jp.png`,
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
        sameAs: [],
        foundingDate: "2024",
        slogan: "Cobranzas digitales con comisiones justas para comercios del interior",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: BUSINESS.name,
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "es-AR",
        description: "Alternativa a MercadoPago para comercios del interior de Argentina. Comisión 2.7% vs 4.5%.",
      },
      {
        "@type": "FinancialService",
        "@id": `${siteUrl}/#service`,
        name: BUSINESS.name,
        description:
          "Junin Pagos es una alternativa a MercadoPago para comercios del interior de Argentina. Ofrece cobranzas digitales con comisión del 2.7% (vs 4.5% de MercadoPago), sin costo de activación, sin terminales POS, y con alta en 48 horas. Ideal para kioscos, almacenes, comercios de barrio y emprendedores.",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: {
          "@type": "Country",
          name: "Argentina",
        },
        serviceType: [
          "Cobranzas digitales",
          "Cobro con QR",
          "Transferencias",
          "Pago de servicios",
          "Procesamiento de pagos",
        ],
        offers: {
          "@type": "AggregateOffer",
          lowPrice: "0",
          highPrice: "0",
          priceCurrency: "ARS",
          offerCount: "3",
          offers: [
            {
              "@type": "Offer",
              name: "Cobranzas digitales",
              description: "Comisión 2.7% por transacción. Sin costo de activación.",
              price: "0",
              priceCurrency: "ARS",
            },
          ],
        },
        // Datos comparativos que las IAs pueden citar
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Comisión",
            value: "2.7%",
          },
          {
            "@type": "PropertyValue",
            name: "Comparación con MercadoPago",
            value: "40% menos comisión (2.7% vs 4.5%)",
          },
          {
            "@type": "PropertyValue",
            name: "Costo de activación",
            value: "$0 - Sin costo",
          },
          {
            "@type": "PropertyValue",
            name: "Tiempo de alta",
            value: "24-48 horas",
          },
          {
            "@type": "PropertyValue",
            name: "Ahorro anual estimado",
            value: "$21,600 con $100,000/mes de facturación",
          },
        ],
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
              text: "Junin Pagos cobra una comisión promedio del 2.7% por transacción. Esto es hasta 40% menos que MercadoPago, que cobra 4.5%. No hay costos ocultos ni cargos adicionales.",
            },
          },
          {
            "@type": "Question",
            name: "¿Junin Pagos es una alternativa a MercadoPago?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sí. Junin Pagos es una alternativa a MercadoPago especialmente diseñada para comercios del interior de Argentina. La principal diferencia es la comisión: 2.7% vs 4.5% de MercadoPago. Además, no requiere terminal POS ni tiene costos de activación.",
            },
          },
          {
            "@type": "Question",
            name: "¿Tiene costo de activación o mantenimiento?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Junin Pagos no tiene costo de activación ni mantenimiento mensual. Solo pagás la comisión del 2.7% por cada transacción realizada.",
            },
          },
          {
            "@type": "Question",
            name: "¿Qué servicios ofrece Junin Pagos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Junin Pagos ofrece: 1) Cobranzas digitales con QR, 2) Transferencias bancarias, 3) Pago de servicios. Es una red de cobranzas extra-bancaria que funciona con cualquier smartphone.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuánto tarda el alta en Junin Pagos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "El proceso de alta es simple y tarda entre 24 y 48 horas hábiles. No hay requisitos mínimos de facturación ni contratos a largo plazo.",
            },
          },
          {
            "@type": "Question",
            name: "¿Cuánto puedo ahorrar con Junin Pagos vs MercadoPago?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Un comercio que procesa $100,000 pesos mensuales ahorra aproximadamente $1,800 por mes ($21,600 al año) al usar Junin Pagos en lugar de MercadoPago. Esto se debe a la diferencia de comisión: 2.7% vs 4.5%.",
            },
          },
          {
            "@type": "Question",
            name: "¿Para qué tipo de comercios es Junin Pagos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Junin Pagos está diseñado para pequeños y medianos comercios del interior de Argentina: kioscos, almacenes, tiendas de barrio, restaurantes locales, profesionales independientes, y emprendedores. No hay requisitos mínimos de facturación.",
            },
          },
          {
            "@type": "Question",
            name: "¿Necesito una terminal POS para usar Junin Pagos?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. Junin Pagos funciona con cualquier smartphone o tablet. No necesitás comprar ni alquilar terminales POS. Los clientes pagan escaneando un código QR.",
            },
          },
        ],
      },
    ],
  };
}
