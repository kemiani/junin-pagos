import { Logo } from "./Logo";
import { COLORS } from "@/lib/constants";
import { MobileMenu } from "@/components/client/MobileMenu";

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#ventajas", label: "Ventajas" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" aria-label="Junin Pagos - Inicio">
          <Logo />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-cyan-600 transition-colors text-sm"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="text-white px-5 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: COLORS.primary }}
          >
            Contactanos
          </a>
        </div>

        {/* Mobile Menu - Client Component */}
        <MobileMenu navLinks={navLinks} />
      </nav>
    </header>
  );
}
