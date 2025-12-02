import { COLORS, ADVANTAGES } from "@/lib/constants";
import { CheckIcon } from "./Icons";
import { AnimatedCounter } from "@/components/client/Counter";

export function Advantages() {
  return (
    <section id="ventajas" className="py-16" aria-labelledby="advantages-heading">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 id="advantages-heading" className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-slate-600 mb-6">
              Entendemos las necesidades de los comercios del interior. Comisiones justas, sin
              letra chica.
            </p>

            <ul className="space-y-3" role="list">
              {ADVANTAGES.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckIcon />
                  <span className="text-slate-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comparativa Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="text-center mb-6">
              <p className="text-slate-500 text-sm mb-1">Ahorro anual estimado</p>
              <p className="text-4xl font-bold gradient-text">
                $<AnimatedCounter end={21600} />
              </p>
              <p className="text-xs text-slate-400 mt-1">*Con $100.000/mes de facturación</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 text-sm">Otros procesadores</span>
                <span className="text-red-400 line-through font-medium">4.5%</span>
              </div>
              <div
                className="flex items-center justify-between p-3 rounded-lg border-2"
                style={{
                  backgroundColor: `${COLORS.primary}05`,
                  borderColor: `${COLORS.primary}30`,
                }}
              >
                <span className="font-medium text-slate-800 text-sm">Junin Pagos</span>
                <span className="font-bold text-lg" style={{ color: COLORS.primary }}>
                  2.7%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
