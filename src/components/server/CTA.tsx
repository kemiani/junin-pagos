import { COLORS } from "@/lib/constants";
import { ArrowRightIcon } from "./Icons";

export function CTA() {
  return (
    <section className="py-12" style={{ backgroundColor: COLORS.primary }} aria-labelledby="cta-heading">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 id="cta-heading" className="text-2xl md:text-3xl font-bold text-white mb-3">
          ¿Listo para empezar?
        </h2>
        <p className="text-cyan-100 mb-6">Unite a la red de pagos del interior</p>
        <a
          href="#contacto"
          className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
          style={{ color: COLORS.primary }}
        >
          Quiero sumarme
          <ArrowRightIcon className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
