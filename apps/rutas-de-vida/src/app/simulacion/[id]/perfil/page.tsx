'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Flame, Coins, Award, Calendar } from 'lucide-react';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const ETAPA_LABELS: Record<string, string> = {
  EARLY_CHILDHOOD: 'Primera Infancia',
  CHILDHOOD: 'Niñez',
  ADOLESCENCE: 'Adolescencia',
  YOUTH: 'Juventud',
  ADULTHOOD: 'Adultez',
  OLD_AGE: 'Vejez',
};

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
        <h1 className="text-2xl font-bold text-slate-800 flex-1 text-center pr-10">Mi Perfil</h1>
      </header>

      <main className="w-full max-w-2xl p-6 flex flex-col items-center gap-8 mt-4">

        {/* Avatar e información */}
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
          <p className="text-slate-500 font-medium tracking-wide uppercase text-sm">
            {ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}
          </p>
          {/* Vidas */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-2xl ${i < summary.character.vidas ? '' : 'grayscale opacity-30'}`}>❤️</span>
            ))}
          </div>
        </div>

        {/* Cuadrícula de estadísticas */}
        <div className="grid grid-cols-2 w-full gap-4">
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <Flame className="w-8 h-8 fill-orange-500 text-orange-600" />
            <span className="font-bold text-xl text-slate-700">{summary.character.xp}</span>
            <span className="text-sm font-bold text-slate-400">Puntos de Experiencia</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <Coins className="w-8 h-8 fill-sky-500 text-sky-600" />
            <span className="font-bold text-xl text-slate-700">{summary.character.monedas}</span>
            <span className="text-sm font-bold text-slate-400">Monedas</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <Award className="w-8 h-8 text-[#FF005A]" />
            <span className="font-bold text-xl text-slate-700">{summary.decisionsCount}</span>
            <span className="text-sm font-bold text-slate-400">Decisiones Tomadas</span>
          </div>
          <div className="border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_4px_0_#E5E5E5]">
            <span className="text-3xl">❤️</span>
            <span className="font-bold text-xl text-slate-700">{summary.character.vidas} / 5</span>
            <span className="text-sm font-bold text-slate-400">Vidas Restantes</span>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="w-full bg-gray-50 rounded-2xl p-6 border-2 border-gray-100">
          <h3 className="font-bold text-slate-700 text-lg mb-4">Habilidades Actuales</h3>
          <div className="space-y-3">
            {[
              { label: 'Físico', value: summary.stats.fisico, color: 'bg-[#58CC02]' },
              { label: 'Cognitivo', value: summary.stats.cognitivo, color: 'bg-[#00E1FF]' },
              { label: 'Social', value: summary.stats.social, color: 'bg-[#CE82FF]' },
              { label: 'Afectivo', value: summary.stats.afectivo, color: 'bg-[#FF96CB]' },
              { label: 'Ético', value: summary.stats.etico, color: 'bg-[#FFC800]' },
              { label: 'Comunicativo', value: summary.stats.comunicativo, color: 'bg-[#FF005A]' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-600">{stat.label}</span>
                  <span className="text-sm font-bold text-slate-500">{stat.value}/100</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${stat.color} transition-all duration-500`}
                    style={{ width: `${stat.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
