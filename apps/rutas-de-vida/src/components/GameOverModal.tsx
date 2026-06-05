'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShoppingBag, RefreshCw } from 'lucide-react';

interface GameOverModalProps {
  characterId: string;
  characterName: string;
  xp: number;
  decisionsCount: number;
}

export function GameOverModal({ characterId, characterName, xp, decisionsCount }: GameOverModalProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 180, delay: 0.1 }}
        className="bg-white rounded-3xl p-8 flex flex-col items-center gap-5 max-w-sm w-full text-center shadow-2xl"
      >
        {/* Emoji animado */}
        <motion.div
          animate={{ rotate: [0, -12, 12, -10, 10, -5, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-7xl"
        >
          💔
        </motion.div>

        {/* Título */}
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-800">¡Sin vidas!</h2>
          <p className="text-slate-500 mt-2 leading-relaxed">
            {characterName} se quedó sin vidas. Recupera algunos corazones para seguir avanzando.
          </p>
        </div>

        {/* Estadísticas de la partida */}
        <div className="w-full bg-gray-50 rounded-2xl p-4 flex justify-around border-2 border-gray-100">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🔥</span>
            <span className="font-bold text-slate-700">{xp} XP</span>
            <span className="text-xs text-slate-400 font-medium">Ganados</span>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🧩</span>
            <span className="font-bold text-slate-700">{decisionsCount}</span>
            <span className="text-xs text-slate-400 font-medium">Decisiones</span>
          </div>
          <div className="w-px bg-gray-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">💔</span>
            <span className="font-bold text-slate-700">0 / 5</span>
            <span className="text-xs text-slate-400 font-medium">Vidas</span>
          </div>
        </div>

        {/* Botón principal: ir a la tienda */}
        <button
          onClick={() => router.push(`/simulacion/${characterId}/tienda`)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-xl text-white bg-[#FF005A] shadow-[0_6px_0_#D9004C] hover:bg-[#D9004C] active:translate-y-1 active:shadow-none transition-all"
        >
          <ShoppingBag className="w-6 h-6" />
          Recuperar Vidas
        </button>

        {/* Botón secundario: crear nuevo personaje */}
        <button
          onClick={() => router.push('/crear-personaje')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-base text-slate-500 hover:bg-gray-100 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Crear nuevo personaje
        </button>
      </motion.div>
    </motion.div>
  );
}
