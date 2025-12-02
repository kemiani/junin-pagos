import { Logo } from "./Logo";
import { BUSINESS } from "@/lib/constants";

// Constante de año para evitar new Date() en Server Components
const BUILD_YEAR = 2025;

export function Footer() {
  return (
    <footer className="bg-slate-900 py-8" role="contentinfo">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <Logo white />
        <div className="text-slate-400 text-sm text-center md:text-right">
          <p>
            {BUSINESS.legalName} - CUIT {BUSINESS.cuit}
          </p>
          <p className="text-slate-500 text-xs mt-1">
            {BUILD_YEAR} Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
