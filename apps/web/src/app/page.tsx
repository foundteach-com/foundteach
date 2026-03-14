import Link from "next/link";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { MobileMenu } from "@/components/MobileMenu";

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
              <Link href="/" className="active">INICIO</Link>
            </li>
            <li>
              <Link href="#nosotros">NOSOTROS</Link>
            </li>
            <li>
              <Link href="#servicios">SERVICIOS</Link>
            </li>
            <li>
              <Link href="#tecnologias">TECNOLOGÍAS</Link>
            </li>
            <li>
              <Link href="#contacto">CONTACTO</Link>
            </li>
          </ul>
          <MobileMenu />
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="hero-bg-gradient"></div>
        <div className="container hero-premium-layout">
          <div className="hero-text-side">
            <p className="hero-eyebrow">Tu Socio Tecnológico</p>
            <h1 className="hero-title-main">
              TRANSFORMAMOS IDEAS EN <br />
              <span className="highlight-premium">SOFTWARE DE IMPACTO</span>
            </h1>
            <p className="hero-subtitle">
              Diseñamos y desarrollamos aplicaciones web y móviles a medida.
              <br />
              Ayudamos a escalar tu negocio con tecnología moderna y segura.
            </p>
            <div className="hero-cta-group">
              <Link
                href="https://wa.me/573208325534?text=Hola,%20me%20interesa%20cotizar%20un%20proyecto%20de%20software."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-premium-cta"
              >
                COTIZAR AHORA
              </Link>
              <Link href="#nosotros" className="btn btn-ghost">
                Conócenos →
              </Link>
            </div>
          </div>

          <div className="hero-visual-side">
            <div className="active-bob" style={{ position: "relative", width: "100%", maxWidth: "550px", aspectRatio: "1/1" }}>
              <Image
                src="/hero-laptop.png"
                alt="Equipo de computo escribiendo código 3D"
                fill
                style={{
                  objectFit: "contain",
                  mixBlendMode: "multiply",
                  filter: "contrast(1.05)"
                }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number">+1</span>
            <span className="stat-label">Proyectos entregados</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">+1</span>
            <span className="stat-label">Clientes satisfechos</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">+1</span>
            <span className="stat-label">Años de experiencia</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">Compromiso con el cliente</span>
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section id="nosotros" className="section section-nosotros">
        <div className="container nosotros-layout">
          <div className="nosotros-text">
            <p className="section-eyebrow">Quiénes somos</p>
            <h2 className="section-title-left">
              Ingeniería de software con <span className="highlight-premium">propósito</span>
            </h2>
            <p className="nosotros-description">
              FoundTeach es una empresa de ingeniería de software enfocada en construir
              soluciones digitales que resuelvan problemas reales. Trabajamos con startups,
              pymes y empresas que quieren dar el salto tecnológico sin perder el tiempo.
            </p>
            <p className="nosotros-description">
              Nos apasiona el código limpio, la arquitectura sólida y los productos que
              los usuarios disfrutan usar. No somos una agencia más: somos el equipo técnico
              que tu empresa necesita.
            </p>
            <div className="nosotros-values">
              <div className="value-item">
                <span className="value-icon">🎯</span>
                <div>
                  <strong>Enfoque en resultados</strong>
                  <p>Cada línea de código tiene un propósito claro.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">🤝</span>
                <div>
                  <strong>Transparencia total</strong>
                  <p>Comunicación directa en cada etapa del proyecto.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">⚡</span>
                <div>
                  <strong>Agilidad real</strong>
                  <p>Entregas rápidas sin sacrificar la calidad.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nosotros-visual">
            <div className="nosotros-card-grid">
              <div className="nosotros-card accent-blue">
                <span className="nosotros-card-icon">🌎</span>
                <p>Clientes en Colombia, USA y España</p>
              </div>
              <div className="nosotros-card accent-pink">
                <span className="nosotros-card-icon">🚀</span>
                <p>Startups que lanzaron con nosotros en menos de 3 meses</p>
              </div>
              <div className="nosotros-card accent-light">
                <span className="nosotros-card-icon">🏆</span>
                <p>Equipo Senior en React, Node, Cloud y Mobile</p>
              </div>
              <div className="nosotros-card accent-dark">
                <span className="nosotros-card-icon">🧠</span>
                <p>Integramos IA en productos reales</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="section section-services-bg">
        <div className="container">
          <p className="section-eyebrow text-center">Lo que hacemos</p>
          <h2 className="section-title">Nuestros Servicios</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-card-icon">💻</div>
              <h3>Desarrollo a medida</h3>
              <p>
                Aplicaciones web, móviles y de escritorio diseñadas según tus
                necesidades específicas. Stack moderno, código limpio.
              </p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">☁️</div>
              <h3>Consultoría tecnológica</h3>
              <p>
                Análisis de tu stack actual, auditorías de código y
                recomendaciones de mejora para escalar con confianza.
              </p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🔄</div>
              <h3>Transformación digital</h3>
              <p>
                Modernización de sistemas legacy, migración a la nube e
                integración de APIs y servicios de terceros.
              </p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🤖</div>
              <h3>Integración con IA</h3>
              <p>
                Incorporamos modelos de lenguaje, visión por computador y
                automatización inteligente en tu producto.
              </p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">📱</div>
              <h3>Apps móviles</h3>
              <p>
                Aplicaciones iOS y Android nativas o híbridas (React Native)
                diseñadas para el usuario final.
              </p>
            </div>
            <div className="service-card">
              <div className="service-card-icon">🎓</div>
              <h3>Plataformas Edu-Tech</h3>
              <p>
                Construimos plataformas educativas interactivas. Desde LMS
                hasta mini juegos de aprendizaje como{" "}
                <Link href="https://play.foundteach.com" target="_blank" className="inline-link">
                  GeoMath Match ↗
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tecnologías Section */}
      <section id="tecnologias" className="section">
        <div className="container">
          <p className="section-eyebrow text-center">Nuestro stack</p>
          <h2 className="section-title">Tecnologías que dominamos</h2>
          <div className="tech-grid">
            {[
              { name: "React", category: "Frontend" },
              { name: "Next.js", category: "Frontend" },
              { name: "TypeScript", category: "Lenguaje" },
              { name: "Node.js", category: "Backend" },
              { name: "NestJS", category: "Backend" },
              { name: "PostgreSQL", category: "Base de Datos" },
              { name: "Prisma", category: "ORM" },
              { name: "React Native", category: "Móvil" },
              { name: "AWS", category: "Cloud" },
              { name: "Docker", category: "DevOps" },
              { name: "Git & GitHub", category: "DevOps" },
              { name: "OpenAI API", category: "IA" },
            ].map((tech) => (
              <div key={tech.name} className="tech-pill">
                <span className="tech-name">{tech.name}</span>
                <span className="tech-category">{tech.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="section section-contact-bg">
        <div className="container contact-layout">
          <div className="contact-info">
            <p className="section-eyebrow">Hablemos</p>
            <h2 className="section-title-left">
              ¿Listo para construir algo <span className="highlight-premium">increíble?</span>
            </h2>
            <p className="contact-description">
              Cuéntanos tu idea. Nuestro equipo la analiza y te respondemos con
              una propuesta técnica en menos de 48 horas.
            </p>
            <div className="contact-options">
              <Link
                href="https://wa.me/573208325534"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-option"
              >
                <span className="contact-option-icon">💬</span>
                <div>
                  <strong>WhatsApp directo</strong>
                  <p>+57 320 832 5534</p>
                </div>
              </Link>
              <a href="mailto:hola@foundteach.com" className="contact-option">
                <span className="contact-option-icon">📧</span>
                <div>
                  <strong>Correo electrónico</strong>
                  <p>hola@foundteach.com</p>
                </div>
              </a>
            </div>
          </div>
          <div className="contact-form-wrapper">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-layout">
          <div className="footer-brand">
            <Link
              href="/"
              className="logo-text"
              style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}
            >
              <Image
                src="/logo_foundteach.png"
                alt="FoundTeach Logo"
                width={28}
                height={28}
                style={{ height: "28px", width: "auto" }}
              />
              FoundTeach
            </Link>
            <p className="footer-tagline">
              Ingeniería de software con propósito. <br />
              Construimos el futuro digital de tu empresa.
            </p>
          </div>
          <div className="footer-links-group">
            <h4>Navegación</h4>
            <ul>
              <li><Link href="#nosotros">Nosotros</Link></li>
              <li><Link href="#servicios">Servicios</Link></li>
              <li><Link href="#tecnologias">Tecnologías</Link></li>
              <li><Link href="#contacto">Contacto</Link></li>
            </ul>
          </div>
          <div className="footer-links-group">
            <h4>Plataformas</h4>
            <ul>
              <li><Link href="https://play.foundteach.com" target="_blank">GeoMath Match 🎮</Link></li>
              <li><Link href="https://admin.foundteach.com" target="_blank">Panel Admin</Link></li>
            </ul>
          </div>
          <div className="footer-links-group">
            <h4>Contacto</h4>
            <ul>
              <li><a href="mailto:hola@foundteach.com">hola@foundteach.com</a></li>
              <li>
                <Link
                  href="https://wa.me/573208325534"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 FoundTeach · Ingeniería de Software · Colombia</p>
        </div>
      </footer>
    </main>
  );
}
