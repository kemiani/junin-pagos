import { ADVANTAGES } from "@/lib/constants";
import { AnimatedCounter } from "@/components/client/Counter";

export function Advantages() {
  return (
    <section id="ventajas" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Por que elegirnos?
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Entendemos las necesidades de los comercios del interior. 
              Comisiones justas, sin letra chica.
            </p>

            <ul className="space-y-4">
              {ADVANTAGES.map((item) => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Comparison Card */}
          <div className="glass-card rounded-3xl p-8">
            <div className="text-center mb-8">
              <p className="text-slate-400 text-sm mb-2">Ahorro anual estimado</p>
              <p className="text-5xl font-bold gradient-text">
                $<AnimatedCounter end={21600} />
              </p>
              <p className="text-xs text-slate-500 mt-2">
                *Con $100.000/mes de facturacion
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <span className="text-slate-400">Otros procesadores</span>
                <span className="text-red-400 line-through font-medium text-lg">4.5%</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                <span className="font-semibold text-white">Junin Pagos</span>
                <span className="font-bold text-2xl text-cyan-400">2.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
