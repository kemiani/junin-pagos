import { COLORS } from "@/lib/constants";

interface LogoProps {
  white?: boolean;
  size?: number;
}

// Logo SVG del escudo - Server Component (0 JS)
function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 4L6 12v12c0 11 8 18 18 20 10-2 18-9 18-20V12L24 4z"
        fill="url(#shield-gradient)"
        stroke={COLORS.primary}
        strokeWidth="2"
      />
      <path
        d="M16 24l6 6 10-12"
        stroke={COLORS.primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="20" y="10" width="8" height="4" rx="2" fill={COLORS.primary} opacity="0.5" />
      <defs>
        <linearGradient id="shield-gradient" x1="6" y1="4" x2="42" y2="44">
          <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.1" />
          <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ white = false, size = 36 }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <LogoIcon size={size} />
      <span className="text-xl font-semibold tracking-tight">
        <span style={{ color: white ? "#67E8F9" : COLORS.primary }}>Junin</span>
        <span style={{ color: white ? "#F1F5F9" : COLORS.secondary }}> Pagos</span>
      </span>
    </div>
  );
}
