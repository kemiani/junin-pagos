import Image from "next/image";
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
        {/* Header con imagen */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Nuestros servicios
            </h2>
            <p className="text-slate-400 max-w-lg">
              Soluciones de cobranzas digitales para comercios del interior. 
              Simple, rapido y con las comisiones mas bajas del mercado.
            </p>
          </div>
          
          {/* Imagen del QR con glow */}
          <div className="hidden lg:flex justify-center items-center relative">
            {/* Glow dorado difuminado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 bg-amber-500/15 rounded-full blur-3xl" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 bg-yellow-400/10 rounded-full blur-2xl" />
            </div>
            
            {/* Imagen con animacion float */}
            <div className="relative animate-float" style={{ animationDelay: "1s" }}>
              <Image
                src="/phone-qr.png"
                alt="Celular escaneando codigo QR - Cobranzas digitales"
                width={320}
                height={320}
                className="drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* Cards de servicios */}
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
