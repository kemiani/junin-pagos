import { BUSINESS } from "@/lib/constants";
import { ArrowRightIcon, WhatsAppIcon } from "./Icons";
import { StatsSection } from "./Stats";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-cyan-400 text-sm font-medium">
              Red de pagos para el interior
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Cobranzas digitales{" "}
            <span className="gradient-text">simples y justas</span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-300 mb-10 leading-relaxed">
            Cansado de pagar{" "}
            <span className="text-red-400 line-through">4.5%</span> de comision?
            Con Junin Pagos accedes a{" "}
            <span className="text-cyan-400 font-semibold">
              comisiones desde 2.7%
            </span>{" "}
            y sin costos de activacion.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-12">
            <a
              href="#contacto"
              className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center gap-2">
                Quiero mas informacion
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS.phoneClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all"
            >
              <WhatsAppIcon className="w-5 h-5 text-emerald-400" />
              WhatsApp
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6">
            {["Sin contratos", "Alta en 48hs", "Soporte humano"].map((text) => (
              <div key={text} className="flex items-center gap-2 text-slate-400 text-sm">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <StatsSection />
      </div>
    </section>
  );
}
