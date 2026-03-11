import { Game } from '@/components/Game';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black text-indigo-900 tracking-tight mb-4">
          GeoMath Match
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
          Aprende geometría sumando lados y caras. ¡Selecciona las figuras correctas para alcanzar el número objetivo!
        </p>
      </div>
      
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <Game />
      </div>
    </main>
  );
}
