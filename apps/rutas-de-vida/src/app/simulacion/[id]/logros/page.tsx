'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lock, Trophy } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Logro {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  color: string;
  unlocked: boolean;
}

export default function LogrosPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [logros, setLogros] = useState<Logro[]>([]);
  const [decisionsCount, setDecisionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`${API_URL}/api/rdv/progress/${characterId}/logros`);
        if (!res.ok) throw new Error('Error al cargar logros');
        const data = await res.json();
        setLogros(data.logros);
        setDecisionsCount(data.decisionsCount);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    cargar();
  }, [characterId]);

  const unlockedCount = logros.filter(l => l.unlocked).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FF005A]" />
      </div>
    );
  }

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
            <Trophy className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-slate-800">Logros</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">

        {/* Resumen de progreso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-400 to-yellow-300 rounded-3xl p-6 text-white mb-8 shadow-xl shadow-amber-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 font-semibold text-sm uppercase tracking-wider">Tus insignias</p>
              <h2 className="text-4xl font-bold mt-1">{unlockedCount} / {logros.length}</h2>
              <p className="text-white/80 mt-1 text-sm">{decisionsCount} decisiones tomadas en total</p>
            </div>
            <div className="text-6xl">🏅</div>
          </div>

          {/* Barra de progreso */}
          <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${logros.length > 0 ? (unlockedCount / logros.length) * 100 : 0}%` }}
              transition={{ type: 'spring', stiffness: 40, damping: 10, delay: 0.3 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </motion.div>

        {/* Lista de logros */}
        <div className="space-y-4">
          <AnimatePresence>
            {logros.map((logro, index) => (
              <motion.div
                key={logro.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07 }}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all
                  ${logro.unlocked
                    ? 'border-gray-200 bg-white shadow-[0_4px_0_#E5E5E5]'
                    : 'border-gray-100 bg-white opacity-50'
                  }
                `}
              >
                {/* Ícono */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm
                  ${logro.unlocked ? logro.color : 'bg-gray-200'}`}
                >
                  {logro.unlocked ? logro.emoji : <Lock className="w-6 h-6 text-gray-400" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg leading-tight ${logro.unlocked ? 'text-slate-800' : 'text-gray-400'}`}>
                    {logro.title}
                  </h3>
                  <p className={`text-sm font-medium mt-0.5 ${logro.unlocked ? 'text-slate-500' : 'text-gray-400'}`}>
                    {logro.desc}
                  </p>
                </div>

                {/* Badge */}
                {logro.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: index * 0.07 + 0.2 }}
                    className="text-2xl shrink-0"
                  >
                    ✅
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mensaje motivacional */}
        {unlockedCount < logros.length && (
          <div className="mt-8 bg-gradient-to-r from-[#CE82FF]/20 to-[#FF96CB]/20 border-2 border-[#CE82FF]/30 rounded-2xl p-5 flex gap-4">
            <Trophy className="w-8 h-8 text-[#CE82FF] shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-700 mb-1">¡Sigue adelante!</h3>
              <p className="text-slate-500 text-sm">
                Te faltan {logros.length - unlockedCount} logros por desbloquear. Toma más decisiones, mejora tus estadísticas y avanza de etapa.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
