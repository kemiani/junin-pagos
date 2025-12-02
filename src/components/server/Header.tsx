import { Logo } from "./Logo";
import { MobileMenu } from "@/components/client/MobileMenu";

const navLinks = [
  { href: "#servicios", label: "Servicios" },
  { href: "#ventajas", label: "Ventajas" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-6 py-1 flex items-center justify-between">
        <a href="/" aria-label="Junin Pagos - Inicio">
          <Logo />
        </a>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all"
          >
            Contactanos
          </a>
        </div>

        <MobileMenu navLinks={navLinks} />
      </nav>
    </header>
  );
}
