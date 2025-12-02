import { SERVICES } from "@/lib/constants";
import { PaymentsIcon, TransferIcon, ServicesIcon } from "./Icons";

const iconMap = {
  payments: PaymentsIcon,
  transfer: TransferIcon,
  services: ServicesIcon,
};

function ServiceCard({
  icon,
  title,
  desc,
}: {
  icon: keyof typeof iconMap;
  title: string;
  desc: string;
}) {
  const Icon = iconMap[icon];

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-cyan-200 transition-all duration-300 p-6 group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 bg-cyan-600/10">
        <Icon className="w-6 h-6 text-cyan-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
    </article>
  );
}

export function Services() {
  return (
    <section id="servicios" className="py-16 bg-white" aria-labelledby="services-heading">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="services-heading" className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
            Nuestros servicios
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto">
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
