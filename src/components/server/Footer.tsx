import { Logo } from "./Logo";
import { BUSINESS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <Logo />
        <div className="text-slate-500 text-sm text-center md:text-right">
          <p>{BUSINESS.legalName} - CUIT {BUSINESS.cuit}</p>
          <p className="text-slate-600 text-xs mt-1">
            2025 Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
