import { STATS } from "@/lib/constants";
import { AnimatedCounter } from "@/components/client/Counter";

export function StatsSection() {
  return (
    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
      {STATS.map((stat, index) => (
        <div
          key={stat.label}
          className="glass-card rounded-2xl p-6 transition-all duration-300 group"
        >
          <span className="text-3xl mb-3 block">{stat.icon}</span>
          <div className="text-3xl font-bold text-white mb-1">
            <AnimatedCounter
              end={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              delay={index * 150}
            />
          </div>
          <div className="text-sm text-slate-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
