import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
      {/* Header */}
      <nav className="p-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl text-white">F</div>
          <span className="text-xl font-bold tracking-tight">FoundTeach <span className="text-indigo-500 underline underline-offset-4 decoration-2 text-white">Videogame</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <a href="#" className="hover:text-white transition-colors">Inicio</a>
          <a href="#" className="hover:text-white transition-colors">Características</a>
          <a href="#" className="hover:text-white transition-colors">Soporte</a>
        </div>
        <button className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all transform hover:scale-105 active:scale-95">
          Jugar Ahora
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="max-w-4xl space-y-8">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            EL FUTURO DE LA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 italic">EDUCACIÓN</span> ES AQUÍ.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
            Bienvenido a la plataforma de videojuegos de FoundTeach. 
            Donde las matemáticas se encuentran con la aventura épica.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group">
              Empezar Aventura
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/10 transition-all backdrop-blur-sm">
              Ver Demo
            </button>
          </div>
        </div>

        {/* Floating preview section */}
        <div className="mt-20 w-full max-w-5xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
          <div className="aspect-video bg-gradient-to-br from-indigo-900/20 to-black relative flex items-center justify-center group cursor-pointer">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-0 transition-all duration-700"></div>
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-all z-10 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="absolute bottom-6 left-6 text-left">
              <p className="text-sm font-bold text-indigo-400 tracking-widest uppercase">Próximamente</p>
              <h3 className="text-2xl font-bold">GeoMath: Quest of Numbers</h3>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-10 border-t border-white/5 text-gray-500 text-sm flex flex-col md:flex-row justify-between items-center gap-6 mt-auto">
        <div>© 2026 FoundTeach EdTech S.A.S. Todos los derechos reservados.</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </footer>
    </div>
  );
}
