import Link from "next/link";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// ─── Tipos ───────────────────────────────────────────────────────────────────
interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  sortOrder: number;
}

// ─── Servicios por defecto ───────────────────────────────────────────────────
const DEFAULT_SERVICES: Service[] = [
  {
    id: 'default-1',
    title: 'Desarrollo Web & Móvil',
    description: 'Arquitecturas limpias y alto rendimiento. Construimos ERPs, Sistemas SaaS y Aplicaciones Nativas listas para escalar.',
    icon: '💻',
    sortOrder: 0,
  },
  {
    id: 'default-2',
    title: 'Business Intelligence',
    description: 'Transformamos tus datos en tableros de Power BI en tiempo real para decisiones estratégicas inmediatas.',
    icon: '📊',
    sortOrder: 1,
  },
  {
    id: 'default-3',
    title: 'Consultoría y Automatización',
    description: 'Conectamos tus sistemas ineficientes utilizando APIs y automatizamos tus flujos de trabajo repetitivos.',
    icon: '⚡',
    sortOrder: 2,
  },
];

// ─── Carga de datos ────────────────────────────────────────────────────────
async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch('https://api.foundteach.com/api/services/public', {
      next: { revalidate: 60 },
    });
    if (!res.ok) return DEFAULT_SERVICES;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data : DEFAULT_SERVICES;
  } catch {
    return DEFAULT_SERVICES;
  }
}

export default async function Home() {
  const services = await getServices();
  return (
    <main>
      {/* Abstract Background Orbs */}
      <div className="bg-orbs">
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
      </div>

      {/* Header Interactivo */}
      <Header />

      {/* Hero Section */}
      <section className="hero-premium">
        <div className="container hero-premium-layout">
          <div className="hero-text-side animate-on-scroll is-visible">
            <span className="hero-eyebrow">Tu Socio Tecnológico</span>
            <h1 className="hero-title-main">
              Construimos <br />
              <span className="gradient-text">Software de Impacto</span>
            </h1>
            <p className="hero-subtitle">
              Diseñamos ecosistemas digitales a medida, escalables y seguros. Llevamos la ingeniería de software de primer nivel directamente a tu empresa.
            </p>
            <div className="hero-cta-group">
              <Link href="https://wa.me/573208325534" target="_blank" className="btn btn-premium-cta">
                Cotiza
              </Link>
              <Link href="#servicios" className="btn btn-ghost">
                Ver servicios
              </Link>
            </div>
          </div>

          <div className="hero-visual-side">
            <div className="hero-glow-back"></div>
            <div className="active-bob" style={{ position: "relative", width: "100%", maxWidth: "600px", aspectRatio: "1/1", zIndex: 10 }}>
              <Image src="/hero-laptop.png" alt="Software Engineering" fill style={{ objectFit: "contain", filter: "contrast(1.05) drop-shadow(0 20px 40px rgba(0,112,243,0.15))" }} priority />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar animate-on-scroll">
        <div className="container stats-grid">
          <div className="stat-item"><span className="stat-number">+10</span><span className="stat-label">Proyectos Exitosos</span></div>
          <div className="stat-divider"></div>
          <div className="stat-item"><span className="stat-number">99%</span><span className="stat-label">Uptime Garantizado</span></div>
          <div className="stat-divider"></div>
          <div className="stat-item"><span className="stat-number">5+</span><span className="stat-label">Años de Expertise</span></div>
          <div className="stat-divider"></div>
          <div className="stat-item"><span className="stat-number">100%</span><span className="stat-label">Código Transparente</span></div>
        </div>
      </section>


      {/* Services Section */}
      <section id="servicios" className="section">
        <div className="container">
          <p className="section-eyebrow text-center">Nuestra Oferta</p>
          <h2 className="section-title">Dominio Tecnológico Total</h2>
          <div className="services-grid animate-on-scroll">
            {services.map((service) => (
              <div key={service.id} className="service-card glass-panel">
                <div className="service-card-icon">{service.icon || '💻'}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnologías Section */}
      <section id="tecnologias" className="section">
        <div className="container">
          <p className="section-eyebrow text-center">Powering the Future</p>
          <h2 className="section-title">El Stack Definitivo</h2>
          <div className="tech-grid animate-on-scroll">
            {[
              { name: "Next.js 16", category: "Core Web" },
              { name: "React 19", category: "UI Library" },
              { name: "TypeScript", category: "Strict Typing" },
              { name: "NestJS", category: "Backend Engine" },
              { name: "PostgreSQL", category: "Relational DB" },
              { name: "Prisma", category: "Modern ORM" },
              { name: "Docker", category: "Containerization" },
              { name: "AWS & DigitalOcean", category: "Cloud" },
              { name: "Power BI", category: "Data Vis" },
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
      <section id="contacto" className="section">
        <div className="container contact-layout">
          <div className="contact-info animate-on-scroll">
            <p className="section-eyebrow">A un mensaje de distancia</p>
            <h2 className="section-title-left">
              Llevemos tu <span className="highlight-premium">Visión</span> al Siguiente Nivel
            </h2>
            <p className="contact-description">
              Nuestro equipo analizará tus requerimientos técnicos y te entregará una propuesta arquitectónica en tiempo récord. Déjanos tus datos o contáctanos directamente.
            </p>
            <div className="contact-options">
              <Link href="https://wa.me/573208325534" target="_blank" className="contact-option glass-panel">
                <span className="contact-option-icon">💬</span>
                <div><strong>Línea Directa WhatsApp</strong><p>+57 320 832 5534</p></div>
              </Link>
              <a href="mailto:manuel.martinez@mannez.com" className="contact-option glass-panel">
                <span className="contact-option-icon">📧</span>
                <div><strong>Correo Corporativo</strong><p>manuel.martinez@mannez.com</p></div>
              </a>
            </div>
          </div>
          <div className="contact-form-wrapper glass-panel animate-on-scroll" style={{ animationDelay: "0.2s" }}>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
