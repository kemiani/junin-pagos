import { COLORS, BUSINESS } from "@/lib/constants";
import { ArrowRightIcon, WhatsAppIcon } from "./Icons";
import { StatsSection } from "./Stats";

export function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="max-w-2xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6"
            style={{ backgroundColor: `${COLORS.primary}10` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: COLORS.primary }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium" style={{ color: COLORS.primary }}>
              Red de pagos para el interior
            </span>
          </div>

          {/* Heading - H1 optimizado para SEO */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
            Cobranzas digitales{" "}
            <span className="gradient-text">simples y justas</span>
          </h1>

          {/* Descripción con keywords SEO */}
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            ¿Cansado de pagar{" "}
            <span className="text-red-500 line-through" aria-label="antes 4.5%">
              4.5%
            </span>{" "}
            de comisión? Con Junin Pagos accedés a una red de cobranzas con{" "}
            <strong style={{ color: COLORS.primary }}>comisiones desde 2.7%</strong> y sin costos
            de activación.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-medium transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              Quiero más información
              <ArrowRightIcon className="w-4 h-4" />
            </a>
            <a
              href={`https://wa.me/${BUSINESS.phoneClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-medium hover:border-emerald-300 hover:text-emerald-600 transition-all"
            >
              <WhatsAppIcon className="w-5 h-5 text-emerald-500" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Stats Section */}
        <StatsSection />
      </div>
    </section>
  );
}
