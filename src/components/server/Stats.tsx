import { STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/client/Counter";

export function StatsSection() {
  return (
    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4" role="list" aria-label="Estadísticas de Junin Pagos">
      {STATS.map((stat, index) => (
        <div
          key={stat.label}
          className="text-center p-4"
          role="listitem"
        >
          <div className="text-2xl mb-1" aria-hidden="true">
            {stat.icon}
          </div>
          <div className="text-2xl font-bold text-slate-800">
            <AnimatedCounter
              end={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              delay={index * 100}
            />
          </div>
          <div className="text-slate-500 text-xs mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
