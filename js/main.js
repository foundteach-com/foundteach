// FoundTeach - Scripts principales

document.addEventListener('DOMContentLoaded', () => {
  // Menú móvil
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-active');
      document.body.classList.toggle('nav-open');
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        document.body.classList.remove('nav-open');
      });
    });
  }

  // Scroll suave para anclas (ya manejado por CSS con scroll-behavior: smooth)
  // Animaciones al hacer scroll (opcional)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.service-card, .section-title, .section-badge').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
});
