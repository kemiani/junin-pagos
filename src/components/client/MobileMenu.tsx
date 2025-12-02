"use client";

import { useState, useCallback } from "react";
import { COLORS } from "@/lib/constants";

interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  navLinks: NavLink[];
}

export function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden p-2"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div
          id="mobile-menu"
          className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-3 shadow-lg"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block text-slate-600 text-sm hover:text-cyan-600 transition-colors py-2"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contacto"
            onClick={closeMenu}
            className="block text-white px-4 py-2 rounded-lg text-sm text-center font-medium"
            style={{ backgroundColor: COLORS.primary }}
          >
            Contactanos
          </a>
        </div>
      )}
    </>
  );
}
