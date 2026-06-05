'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Flame, Coins, Calendar, Award } from 'lucide-react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function PerfilPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/rdv/progress/${characterId}/summary`)
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(console.error);
  }, [characterId]);

  if (!summary) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FF005A]"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col items-center">
      <header className="w-full max-w-2xl p-6 flex items-center gap-4 border-b-2 border-gray-100">
        <button 
          onClick={() => router.push(`/simulacion/${characterId}`)}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800 flex-1 text-center pr-10">Perfil</h1>
      </header>

      <main className="w-full max-w-2xl p-6 flex flex-col items-center gap-8 mt-4">
        
        {/* Avatar and Info */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative shadow-sm">
            <Image 
              src={summary.character.genero === 'MALE' ? '/male_character.png' : '/female_character.png'} 
              alt="Avatar" 
              fill 
              className="object-contain mt-4"
            />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-800">{summary.character.nombre}</h2>
          <p className="text-slate-500 font-medium tracking-wide uppercase">{summary.character.etapaActual.replace('_', ' ')}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 w-full gap-4">
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <Flame className="w-8 h-8 fill-orange-500 text-orange-600" />
            <span className="font-bold text-xl text-slate-700">{summary.character.xp}</span>
            <span className="text-sm font-bold text-slate-400">Total XP</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <Coins className="w-8 h-8 fill-sky-500 text-sky-600" />
            <span className="font-bold text-xl text-slate-700">{summary.character.monedas}</span>
            <span className="text-sm font-bold text-slate-400">Monedas</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <Award className="w-8 h-8 text-[#FF005A]" />
            <span className="font-bold text-xl text-slate-700">{summary.decisionsCount}</span>
            <span className="text-sm font-bold text-slate-400">Decisiones</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <Calendar className="w-8 h-8 text-[#58CC02]" />
            <span className="font-bold text-xl text-slate-700">Día 1</span>
            <span className="text-sm font-bold text-slate-400">Racha</span>
          </div>
        </div>
      </main>
    </div>
  );
}
