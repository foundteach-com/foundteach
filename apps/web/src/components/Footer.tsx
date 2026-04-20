import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-layout">
        <div className="footer-brand">
          <Link href="/" className="logo-text" style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
            <Image src="/logo_foundteach.png" alt="FoundTeach Logo" width={30} height={30} style={{ height: "30px", width: "auto" }} />
            FoundTeach
          </Link>
          <p className="footer-tagline">
            FoundTeach EdTech S.A.S.<br />
            Ingeniería de software ultra premium para empresas pioneras.
          </p>
        </div>
        <div className="footer-links-group">
          <h4>Secciones</h4>
          <ul>
            <li><Link href="/nosotros">Nuestra filosofía</Link></li>
            <li><Link href="/#servicios">Ecosistema</Link></li>
            <li><Link href="/#tecnologias">Stack tecnológico</Link></li>
          </ul>
        </div>
        <div className="footer-links-group">
          <h4>Plataformas</h4>
          <ul>
            <li><Link href="https://app.foundteach.com" target="_blank">Campus Educativo API</Link></li>
            <li><Link href="https://admin.foundteach.com" target="_blank">FoundTeach Admin ⌘</Link></li>
          </ul>
        </div>
        <div className="footer-links-group">
          <h4>Desarrollo</h4>
          <ul>
            <li><a href="mailto:manuel.martinez@mannez.com">Soporte Técnico</a></li>
            <li><Link href="https://wa.me/573208325534" target="_blank">Cotizar Proyecto</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} FoundTeach EdTech S.A.S · All systems operational.</p>
      </div>
    </footer>
  );
}
