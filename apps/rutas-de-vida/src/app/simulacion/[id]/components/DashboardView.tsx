import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy, Star, Flame, Coins, BookOpen, CheckCircle2 } from 'lucide-react';
import { ETAPA_LABELS } from '../../../../utils/constants';
import { ActivePowers } from '../../../../components/ActivePowers';
import type { useSimulation } from '../hooks/useSimulation';
import { SidebarNav } from './SidebarNav';
import { SidebarStats } from './SidebarStats';
import { MobileBottomNav } from './MobileBottomNav';

export function DashboardView({ 
  characterId, 
  state 
}: { 
  characterId: string; 
  state: ReturnType<typeof useSimulation>;
}) {
  const {
    summary, decisions, currentDecision, completedDecisionsCount, isLoading,
    showStageUpModal, setShowStageUpModal, nextStageName, handleAdvanceStage, handleStartNode
  } = state;

  if (!summary) return null;

  return (
    <div className="flex min-h-screen bg-white text-slate-800 font-sans pb-20 lg:pb-0">
      {/* Modal de subida de etapa */}
      <AnimatePresence>
        {showStageUpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="bg-white rounded-3xl p-10 flex flex-col items-center gap-6 max-w-sm w-full text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
                className="text-7xl"
              >
                🎉
              </motion.div>
              <div>
                <h2 className="text-3xl font-display font-bold text-slate-800">¡Creciste!</h2>
                <p className="text-slate-500 mt-2 text-lg">Ahora estás en la etapa de</p>
                <p className="text-2xl font-bold text-[#FF005A] mt-1">{nextStageName}</p>
              </div>
              <div className="flex gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">🔥</span>
                  <span className="font-bold text-orange-500">+50 XP</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">🪙</span>
                  <span className="font-bold text-sky-500">+20 Monedas</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">❤️</span>
                  <span className="font-bold text-red-500">Vidas llenas</span>
                </div>
              </div>
              <button
                onClick={() => setShowStageUpModal(false)}
                className="w-full py-4 rounded-2xl font-bold text-xl text-white bg-[#58CC02] shadow-[0_6px_0_#46A302] hover:bg-[#46A302] active:translate-y-1 active:shadow-none transition-all"
              >
                ¡A seguir creciendo!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <SidebarNav characterId={characterId} />

      {/* Contenido principal */}
      <main className="flex-1 lg:ml-64 lg:mr-80 flex flex-col items-center p-6 sm:p-10">

        {/* Barra superior de recompensas */}
        <div className="w-full max-w-[600px] flex justify-end items-center gap-6 mb-8 px-4">
          {/* Vidas / Corazones */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 1 }}
                animate={i >= summary.character.vidas ? { scale: [1, 1.2, 1] } : {}}
                className={`text-2xl transition-all ${i < summary.character.vidas ? '' : 'grayscale opacity-30'}`}
              >
                ❤️
              </motion.span>
            ))}
          </div>
          
          <ActivePowers 
            hasShield={summary.character.escudoRacha} 
            xpBoostCharges={summary.character.xpBoostCharges} 
          />

          <div className="flex items-center gap-2 font-bold text-orange-500">
            <Flame className="w-6 h-6 fill-orange-500" />
            <span className="text-lg">{summary.character.xp} XP</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sky-500">
            <Coins className="w-6 h-6 fill-sky-500 text-sky-600" />
            <span className="text-lg">{summary.character.monedas}</span>
          </div>
        </div>

        <div className="max-w-[600px] w-full flex flex-col items-center">

          {/* Cabecera de la etapa */}
          <div className="w-full bg-[#FF005A] rounded-2xl p-6 text-white mb-10 shadow-[0_8px_0_#D9004C] relative overflow-hidden flex justify-between items-center">
            <div className="relative z-10">
              <h2 className="font-bold text-xl mb-1 flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                ETAPA ACTUAL
              </h2>
              <p className="text-2xl font-display font-bold">
                {ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center relative z-10 border-2 border-white/40">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="absolute right-[-20%] top-[-50%] w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          </div>

          {/* Nodos del camino */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
            className="relative py-8 flex flex-col items-center w-full gap-8"
          >
            {decisions.map((decision, index) => {
              const isCompleted = index < completedDecisionsCount;
              const isCurrent = index === completedDecisionsCount;
              const offset = index % 2 === 0 ? 0 : index % 4 === 1 ? 40 : -40;

              return (
                <motion.div 
                  key={decision.id} 
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.8 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 200 } }
                  }}
                  className="relative w-full flex justify-center" 
                  style={{ left: `${offset}px` }}
                >
                  {isCurrent ? (
                    <div className="relative flex flex-col items-center cursor-pointer group" onClick={handleStartNode}>
                      <div className="absolute -top-12 bg-white border-2 border-gray-200 rounded-xl px-4 py-2 font-bold text-[#FF005A] shadow-md z-10 whitespace-nowrap animate-bounce">
                        ¡EMPEZAR!
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 rotate-45" />
                      </div>
                      <div className="w-20 h-20 rounded-full bg-[#FF005A] shadow-[0_8px_0_#D9004C] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center border-4 border-white z-0 hover:brightness-110 relative">
                        <Star className="w-10 h-10 text-white fill-white" />
                        <div className="absolute inset-0 rounded-full border-4 border-[#FF005A] animate-ping opacity-30" />
                      </div>
                    </div>
                  ) : isCompleted ? (
                    <div className="w-16 h-16 rounded-full bg-[#FF005A] shadow-[0_6px_0_#D9004C] flex items-center justify-center border-4 border-white opacity-80 z-0">
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#E5E5E5] shadow-[0_6px_0_#CCCCCC] flex items-center justify-center border-4 border-white opacity-60 z-0">
                      <Star className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Etapa completada: botón CRECER */}
            {!currentDecision && decisions.length > 0 && (
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scale: 0.8 },
                  visible: { opacity: 1, scale: 1, transition: { type: 'spring' } }
                }}
                className="mt-8 flex flex-col items-center w-full max-w-xs"
              >
                <div className="p-6 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl border-2 border-amber-200 text-center mb-6 shadow-sm w-full">
                  <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-bold text-xl text-amber-700">¡Etapa Completada!</h3>
                  <p className="text-amber-600 mt-1">Has superado todas las pruebas de esta etapa.</p>
                </div>
                <button
                  onClick={handleAdvanceStage}
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all bg-[#CE82FF] text-white hover:bg-[#A64BDB] hover:shadow-[0_4px_0_#8933B8] shadow-[0_6px_0_#8933B8] active:translate-y-2 active:shadow-none animate-bounce disabled:opacity-50 disabled:animate-none"
                >
                  {isLoading ? 'Cargando...' : '🌱 ¡CRECER!'}
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <SidebarStats characterId={characterId} summary={summary} />
      
      <MobileBottomNav characterId={characterId} />
    </div>
  );
}
