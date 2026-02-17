import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* Header */}
      <header className="header">
        <nav className="nav container">
          <Link href="/" className="logo-text">
            FoundTeach
          </Link>
          <ul className="nav-links">
            <li><Link href="/" className="active">INICIO</Link></li>
            <li><Link href="#nosotros">NOSOTROS</Link></li>
            <li><Link href="#servicios">SERVICIOS</Link></li>
            <li><Link href="#contacto">CONTACTO</Link></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="hero-bg-gradient"></div>
        <div className="container hero-premium-layout">
          <div className="hero-text-side">
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)", fontWeight: 700, letterSpacing: "0.2em", marginBottom: "1rem" }}>
              INGENIERÍA DE SOFTWARE
            </p>
            <h1 className="hero-title-main">
              DESARROLLÁ TU <br />
              <span className="highlight-premium">PROYECTO DIGITAL</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#555", marginBottom: "3rem", lineHeight: 1.6 }}>
              Soluciones robustas y escalables creadas por un equipo <br />
              de expertos apasionados por el código.
            </p>
            <Link href="#contacto" className="btn btn-premium-cta">
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
              <p>Aplicaciones web, móviles y de escritorio diseñadas según tus necesidades.</p>
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
      <footer style={{ padding: "4rem 0", background: "white", textAlign: "center", borderTop: "1px solid #eee" }}>
        <div className="container">
          <p>© 2026 FoundTeach. Ingeniería de software.</p>
        </div>
      </footer>
    </main>
  );
}
