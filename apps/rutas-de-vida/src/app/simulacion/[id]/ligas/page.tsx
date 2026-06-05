'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Medal, Trophy, Crown, Flame } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const ETAPA_LABELS: Record<string, string> = {
  EARLY_CHILDHOOD: 'Primera Infancia',
  CHILDHOOD: 'Niñez',
  ADOLESCENCE: 'Adolescencia',
  YOUTH: 'Juventud',
  ADULTHOOD: 'Adultez',
  OLD_AGE: 'Vejez',
};

interface Jugador {
  id: string;
  nombre: string;
  genero: 'MALE' | 'FEMALE';
  etapaActual: string;
  xp: number;
  monedas: number;
}

const LIGAS = [
  { nombre: 'Liga Bronce', minXp: 0, maxXp: 199, emoji: '🥉', color: 'from-amber-700 to-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { nombre: 'Liga Plata', minXp: 200, maxXp: 499, emoji: '🥈', color: 'from-gray-400 to-gray-300', textColor: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { nombre: 'Liga Oro', minXp: 500, maxXp: 999, emoji: '🥇', color: 'from-yellow-500 to-amber-400', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { nombre: 'Liga Diamante', minXp: 1000, maxXp: Infinity, emoji: '💎', color: 'from-sky-500 to-cyan-400', textColor: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
];

function getLiga(xp: number) {
  return LIGAS.find(l => xp >= l.minXp && xp <= l.maxXp) || LIGAS[0];
}

export default function LigasPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [miPersonaje, setMiPersonaje] = useState<{ xp: number; nombre: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [ligasRes, summaryRes] = await Promise.all([
          fetch(`${API_URL}/api/rdv/progress/ligas`),
          fetch(`${API_URL}/api/rdv/progress/${characterId}/summary`),
        ]);

        if (ligasRes.ok) {
          const data: Jugador[] = await ligasRes.json();
          setJugadores(data);
        }
        if (summaryRes.ok) {
          const data = await summaryRes.json();
          setMiPersonaje({ xp: data.character.xp, nombre: data.character.nombre });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, [characterId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FF005A]"></div>
      </div>
    );
  }

  const miLiga = miPersonaje ? getLiga(miPersonaje.xp) : LIGAS[0];
  const jugadoresEnMiLiga = jugadores.filter(j => {
    const l = getLiga(j.xp);
    return l.nombre === miLiga.nombre;
  });
  const miPosicion = jugadoresEnMiLiga.findIndex(j => j.id === characterId) + 1;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push(`/simulacion/${characterId}`)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Medal className="w-6 h-6 text-[#FF005A]" />
            <h1 className="text-2xl font-bold text-slate-800">Ligas</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">

        {/* Tu Liga actual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${miLiga.color} rounded-3xl p-6 text-white mb-6 shadow-xl`}
        >
          <div className="flex items-center gap-4">
            <div className="text-6xl">{miLiga.emoji}</div>
            <div>
              <p className="text-white/80 font-semibold text-sm uppercase tracking-wider">Tu liga actual</p>
              <h2 className="text-3xl font-bold">{miLiga.nombre}</h2>
              {miPosicion > 0 && (
                <p className="text-white/80 mt-1">Posición #{miPosicion} de {jugadoresEnMiLiga.length} jugadores</p>
              )}
            </div>
          </div>
          <div className="mt-4 bg-white/20 rounded-2xl p-3 flex items-center gap-3">
            <Flame className="w-5 h-5 text-orange-300 fill-orange-300" />
            <span className="font-bold">{miPersonaje?.xp ?? 0} XP total</span>
            {miLiga.maxXp < Infinity && (
              <span className="text-white/70 text-sm ml-auto">
                {miLiga.maxXp - (miPersonaje?.xp ?? 0)} XP para la siguiente liga
              </span>
            )}
          </div>
        </motion.div>

        {/* Mapa de ligas */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {LIGAS.map((liga, i) => {
            const esActual = liga.nombre === miLiga.nombre;
            return (
              <div
                key={liga.nombre}
                className={`flex-1 min-w-[100px] rounded-2xl p-3 text-center border-2 transition-all
                  ${esActual ? `${liga.bgColor} ${liga.borderColor}` : 'bg-white border-gray-100 opacity-50'}`}
              >
                <div className="text-2xl mb-1">{liga.emoji}</div>
                <p className={`text-xs font-bold ${esActual ? liga.textColor : 'text-gray-400'}`}>
                  {liga.nombre.replace('Liga ', '')}
                </p>
                <p className="text-xs text-gray-400">{liga.minXp}+ XP</p>
              </div>
            );
          })}
        </div>

        {/* Tabla de clasificación de mi liga */}
        <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${miLiga.textColor}`}>
          <Trophy className="w-5 h-5" />
          Clasificación — {miLiga.nombre}
        </h2>

        {jugadoresEnMiLiga.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center">
            <div className="text-5xl mb-3">🏆</div>
            <p className="text-slate-500 font-medium">Aún no hay otros jugadores en tu liga. ¡Sigue jugando para subir!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {jugadoresEnMiLiga.map((jugador, index) => {
              const esMio = jugador.id === characterId;
              const posicion = index + 1;
              const posEmoji = posicion === 1 ? '🥇' : posicion === 2 ? '🥈' : posicion === 3 ? '🥉' : `#${posicion}`;

              return (
                <motion.div
                  key={jugador.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                    ${esMio
                      ? `${miLiga.bgColor} ${miLiga.borderColor} shadow-md`
                      : 'bg-white border-gray-100'
                    }
                  `}
                >
                  <div className="w-10 text-center font-bold text-xl shrink-0">
                    {posEmoji}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF005A] to-[#FF96CB] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                    {jugador.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800">{jugador.nombre}</h3>
                      {esMio && (
                        <span className="px-2 py-0.5 text-xs font-bold text-white bg-[#FF005A] rounded-full">Tú</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {ETAPA_LABELS[jugador.etapaActual] || jugador.etapaActual}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-orange-500 shrink-0">
                    <Flame className="w-4 h-4 fill-orange-400" />
                    <span>{jugador.xp} XP</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Tip motivacional */}
        <div className="mt-8 bg-gradient-to-r from-[#CE82FF]/20 to-[#FF96CB]/20 border-2 border-[#CE82FF]/30 rounded-2xl p-5 flex gap-4">
          <Crown className="w-8 h-8 text-[#CE82FF] shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-slate-700 mb-1">¿Cómo subir de liga?</h3>
            <p className="text-slate-500 text-sm">Toma más decisiones en la simulación para ganar XP. Al acumular suficiente XP, subirás automáticamente a la siguiente liga.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
