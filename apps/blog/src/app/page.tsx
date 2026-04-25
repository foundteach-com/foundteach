export default function Home() {
  return (
    <main className="hero-section">
      <div className="glass-panel">
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>
          ¡Bienvenido al nuevo Blog!
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
          Este es el espacio donde compartiremos nuestras mejores ideas, novedades de la plataforma y contenido educativo de valor.
        </p>
        
        <div className="actions">
          <a href="#" className="btn-primary">Explorar Artículos</a>
          <a href="https://foundteach.com" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
            Visitar FoundTeach
          </a>
        </div>
      </div>
    </main>
  );
}
