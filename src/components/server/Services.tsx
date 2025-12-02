import { SERVICES } from "@/lib/constants";
import { PaymentsIcon, TransferIcon, ServicesIcon } from "./Icons";

const iconMap = {
  payments: PaymentsIcon,
  transfer: TransferIcon,
  services: ServicesIcon,
};

function ServiceCard({ icon, title, desc }: { icon: keyof typeof iconMap; title: string; desc: string }) {
  const Icon = iconMap[icon];

  return (
    <article className="glass-card rounded-2xl p-8 transition-all duration-300 group hover:scale-[1.02]">
      <div className="w-14 h-14 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
        <Icon className="w-7 h-7 text-cyan-400" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </article>
  );
}

export function Services() {
  return (
    <section id="servicios" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Nuestros servicios
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto">
            Soluciones de cobranzas para comercios del interior
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.title}
              icon={service.icon as keyof typeof iconMap}
              title={service.title}
              desc={service.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
