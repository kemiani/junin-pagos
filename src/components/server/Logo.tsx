interface LogoProps {
  size?: number;
}

function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full" />
      <svg width={size} height={size} viewBox="0 0 48 48" className="relative">
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="50%" stopColor="#0891B2" />
            <stop offset="100%" stopColor="#0E7490" />
          </linearGradient>
        </defs>
        <path
          d="M24 4L6 12v12c0 11 8 18 18 20 10-2 18-9 18-20V12L24 4z"
          fill="url(#shieldGrad)"
        />
        <path
          d="M16 24l6 6 10-12"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function Logo({ size = 40 }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <LogoIcon size={size} />
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
