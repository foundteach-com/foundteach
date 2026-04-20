"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "INICIO" },
  { href: "#nosotros", label: "NOSOTROS" },
  { href: "#servicios", label: "SERVICIOS" },
  { href: "#tecnologias", label: "TECNOLOGÍAS" },
  { href: "#contacto", label: "CONTACTO" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="hamburger"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`hamburger-line ${open ? "open" : ""}`}></span>
        <span className={`hamburger-line ${open ? "open" : ""}`}></span>
        <span className={`hamburger-line ${open ? "open" : ""}`}></span>
      </button>

      {open && (
        <div className="mobile-menu-overlay" onClick={() => setOpen(false)}>
          <nav
            className="mobile-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <ul>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="https://wa.me/573208325534?text=Hola,%20me%20interesa%20cotizar%20un%20proyecto%20de%20software."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-premium-cta mobile-menu-cta"
              onClick={() => setOpen(false)}
            >
              COTIZAR AHORA
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
