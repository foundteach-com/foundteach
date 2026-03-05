import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      {/* Header */}
      <header className="header">
        <nav className="nav container">
          <Link
            href="/"
            className="logo-text"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <Image
              src="/logo_foundteach.png"
              alt="FoundTeach Logo"
              width={32}
              height={32}
              style={{ height: "32px", width: "auto" }}
            />
            FoundTeach
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/" className="active">
                INICIO
              </Link>
            </li>
            <li>
              <Link href="#nosotros">NOSOTROS</Link>
            </li>
            <li>
              <Link href="#servicios">SERVICIOS</Link>
            </li>
            <li>
              <Link href="#contacto">CONTACTO</Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="hero-bg-gradient"></div>
        <div className="container hero-premium-layout">
          <div className="hero-text-side">
            <p
              style={{
                fontFamily: "var(--font-din-next)",
                color: "var(--color-primary)",
                fontWeight: 700,
                letterSpacing: "0.15em",
                marginBottom: "1rem",
                textTransform: "uppercase",
              }}
            >
              Tu Socio Tecnológico
            </p>
            <h1 className="hero-title-main" style={{ fontWeight: 700 }}>
              TRANSFORMAMOS IDEAS EN <br />
              <span className="highlight-premium">SOFTWARE DE IMPACTO</span>
            </h1>
            <p
              style={{
                fontSize: "1.15rem",
                color: "#555",
                marginBottom: "3rem",
                lineHeight: 1.6,
                fontWeight: 300,
                maxWidth: "600px",
              }}
            >
              Diseñamos y desarrollamos aplicaciones web y móviles a medida.
              <br />
              Ayudamos a escalar tu negocio con tecnología moderna y segura.
            </p>
            <Link
              href="https://wa.me/573208325534?text=Hola,%20me%20interesa%20cotizar%20un%20proyecto%20de%20software."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-premium-cta"
            >
              COTIZAR AHORA
            </Link>
          </div>

          <div className="hero-visual-side">
            <div className="software-team-art active-bob">
              <div className="art-engineer-1"></div>
              <div className="art-engineer-2"></div>
              <div className="art-screen-center">
                <div className="screen-code-flow"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="section">
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Desarrollo a medida</h3>
              <p>
                Aplicaciones web, móviles y de escritorio diseñadas según tus
                necesidades.
              </p>
            </div>
            <div className="service-card">
              <h3>Consultoría tecnológica</h3>
              <p>Análisis de tu stack actual y recomendaciones de mejora.</p>
            </div>
            <div className="service-card">
              <h3>Transformación digital</h3>
              <p>Modernización de sistemas legacy y migración a la nube.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "4rem 0",
          background: "white",
          textAlign: "center",
          borderTop: "1px solid #eee",
        }}
      >
        <div className="container">
          <p>© 2026 FoundTeach. Ingeniería de software.</p>
        </div>
      </footer>
    </main>
  );
}
