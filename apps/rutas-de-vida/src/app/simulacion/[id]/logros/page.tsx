'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Lock, Trophy, Heart, Brain, Zap } from 'lucide-react';

export default function LogrosPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const logros = [
    { id: 1, title: 'Primeros Pasos', desc: 'Completaste tu primera decisión.', icon: <Star />, color: 'bg-yellow-400', unlocked: true },
    { id: 2, title: 'Corazón de Oro', desc: 'Alcanzaste 70 en Afectivo.', icon: <Heart />, color: 'bg-pink-400', unlocked: false },
    { id: 3, title: 'Mente Brillante', desc: 'Alcanzaste 70 en Cognitivo.', icon: <Brain />, color: 'bg-sky-400', unlocked: false },
    { id: 4, title: 'Racha Semanal', desc: '7 decisiones seguidas.', icon: <Zap />, color: 'bg-orange-400', unlocked: false },
    { id: 5, title: 'Creciendo', desc: 'Avanzaste a la Niñez.', icon: <Trophy />, color: 'bg-[#58CC02]', unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center">
      <header className="w-full max-w-2xl p-6 flex items-center gap-4 border-b-2 border-gray-100">
        <button 
          onClick={() => router.push(`/simulacion/${characterId}`)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 flex-1 text-center pr-10">Logros</h1>
      </header>

      <main className="w-full max-w-2xl p-6 flex flex-col gap-6 mt-4">
        <h2 className="text-xl font-bold text-slate-700 mb-2">Tus Insignias</h2>
        
        <div className="space-y-4">
          {logros.map(logro => (
            <div 
              key={logro.id} 
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                ${logro.unlocked 
                  ? 'border-gray-200 bg-white shadow-[0_4px_0_#E5E5E5]' 
                  : 'border-gray-100 bg-gray-50 opacity-60'
                }
              `}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shrink-0
                ${logro.unlocked ? logro.color : 'bg-gray-300'}
              `}>
                {logro.unlocked ? logro.icon : <Lock />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">{logro.title}</h3>
                <p className="text-slate-500 font-medium">{logro.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
