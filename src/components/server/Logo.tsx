import Image from "next/image";

interface LogoProps {
  size?: number;
}

export function Logo({ size = 100 }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Glow sutil */}
        <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full" />
        <Image
          src="/logo-jp.png"
          alt="Junin Pagos"
          width={size}
          height={size}
          className="relative drop-shadow-lg scale-x-[1.18]"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight">
          <span className="text-cyan-400">Junin</span>
          <span className="text-white"> Pagos</span>
        </span>
        <span className="text-[10px] text-cyan-400/60 tracking-[0.15em] uppercase">
          Cobranzas digitales
        </span>
      </div>
    </div>
  );
}
