import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros • FoundTeach",
  description: "Conoce el ADN de FoundTeach y nuestra filosofía de arquitectura y propósito.",
};

export default function Nosotros() {
  return (
    <main>
      <Header />
      
      {/* Espaciador para el header fijo */}
      <div style={{ height: "90px" }}></div>

      {/* Nosotros Section */}
      <section className="section" style={{ minHeight: "calc(100vh - 90px)", display: "flex", alignItems: "center" }}>
        <div className="container nosotros-layout">
          <div className="nosotros-text animate-on-scroll is-visible">
            <p className="section-eyebrow">ADN FoundTeach</p>
            <h1 className="section-title-left">
              Desarrollamos con <br /><span className="highlight-premium">Arquitectura y Propósito</span>
            </h1>
            <p className="nosotros-description">
              No somos una agencia genérica ni ensamblamos plantillas. Somos ingenieros de software dedicados a orquestar plataformas sólidas que no colapsan cuando tu negocio escala.
            </p>
            <div className="nosotros-values">
              <div className="value-item">
                <span className="value-icon">⚡</span>
                <div>
                  <strong>Agilidad Radical</strong>
                  <p>Iteramos rápido. Prototipamos y construimos con velocidad sin comprometer el testing.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-icon">🛡️</span>
                <div>
                  <strong>Código a Prueba de Balas</strong>
                  <p>Implementamos patrones de diseño y estándares de seguridad de grado bancario.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nosotros-visual animate-on-scroll is-visible">
            <div className="nosotros-background-glow"></div>
            <div className="nosotros-card-grid">
              <div className="nosotros-card glass-panel">
                <span className="nosotros-card-icon">💎</span>
                <p>Interfaces cristalinas y experiencias de usuario (UX) memorables.</p>
              </div>
              <div className="nosotros-card glass-panel" style={{ marginTop: "30px" }}>
                <span className="nosotros-card-icon">🧠</span>
                <p>Lógica de negocio robusta corriendo en infraestructuras Cloud.</p>
              </div>
              <div className="nosotros-card glass-panel" style={{ marginTop: "-30px" }}>
                <span className="nosotros-card-icon">🚀</span>
                <p>Despliegues continuos automatizados (CI/CD) sin interrupciones.</p>
              </div>
              <div className="nosotros-card glass-panel">
                <span className="nosotros-card-icon">🔐</span>
                <p>Auditorías estrictas y protección total de tus datos sensibles.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
