"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { MobileMenu } from "./MobileMenu";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <nav className="nav container">
        <Link
          href="/"
          className="logo-text"
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <Image
            src="/logo_foundteach.png"
            alt="FoundTeach Logo"
            width={34}
            height={34}
            className="header-logo-img"
          />
          FoundTeach
        </Link>
        <ul className="nav-links" style={{ alignItems: "center" }}>
          <li><Link href="/">INICIO</Link></li>
          <li><Link href="/nosotros">NOSOTROS</Link></li>
          <li><Link href="/#servicios">SERVICIOS</Link></li>
          <li><Link href="/#tecnologias">STACK</Link></li>
          <li><Link href="/#contacto">CONTACTO</Link></li>
          <li>
            <Link href="https://wa.me/573208325534" target="_blank" className="btn btn-premium-cta" style={{ padding: "0.6rem 1.5rem", fontSize: "0.8rem", marginLeft: "1rem", color: "#FFFFFF" }}>
              COTIZA
            </Link>
          </li>
        </ul>
        <MobileMenu />
      </nav>
    </header>
  );
};
