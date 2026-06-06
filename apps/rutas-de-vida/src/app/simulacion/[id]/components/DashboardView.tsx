'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Trophy, Star, Flame, Coins, BookOpen, CheckCircle2 } from 'lucide-react';
import { ETAPA_LABELS } from '../../../../utils/constants';
import { ActivePowers } from '../../../../components/ActivePowers';
import type { useSimulation } from '../hooks/useSimulation';
import { SidebarNav } from './SidebarNav';
import { SidebarStats } from './SidebarStats';
import { MobileBottomNav } from './MobileBottomNav';
import { LifeReportModal } from './LifeReportModal';

const getDecisionEmoji = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('escuela') || lowerTitle.includes('examen') || lowerTitle.includes('tarea') || lowerTitle.includes('lectura') || lowerTitle.includes('educación') || lowerTitle.includes('universidad')) return '🏫';
  if (lowerTitle.includes('familia') || lowerTitle.includes('padre') || lowerTitle.includes('madre') || lowerTitle.includes('hermano') || lowerTitle.includes('hogar')) return '🏠';
  if (lowerTitle.includes('amigo') || lowerTitle.includes('compañero') || lowerTitle.includes('grupo') || lowerTitle.includes('reunión')) return '👫';
  if (lowerTitle.includes('amor') || lowerTitle.includes('pareja') || lowerTitle.includes('relación') || lowerTitle.includes('matrimonial')) return '❤️';
  if (lowerTitle.includes('dinero') || lowerTitle.includes('trabajo') || lowerTitle.includes('jefe') || lowerTitle.includes('ascenso') || lowerTitle.includes('ahorro') || lowerTitle.includes('deuda')) return '💼';
  if (lowerTitle.includes('salud') || lowerTitle.includes('ejercicio') || lowerTitle.includes('deporte')) return '🏃';
  if (lowerTitle.includes('tecnología') || lowerTitle.includes('redes') || lowerTitle.includes('digital')) return '📱';
  if (lowerTitle.includes('fiesta') || lowerTitle.includes('alcohol') || lowerTitle.includes('drogas')) return '🎉';
  if (lowerTitle.includes('mascota') || lowerTitle.includes('animal')) return '🐶';
  if (lowerTitle.includes('arte') || lowerTitle.includes('dibujo') || lowerTitle.includes('pasatiempo')) return '🎨';
  if (lowerTitle.includes('voluntariado') || lowerTitle.includes('social') || lowerTitle.includes('comunidad') || lowerTitle.includes('vecino')) return '🤝';
  if (lowerTitle.includes('tormenta') || lowerTitle.includes('charco') || lowerTitle.includes('noche')) return '🌧️';
  if (lowerTitle.includes('legado') || lowerTitle.includes('herencia') || lowerTitle.includes('sabiduría')) return '📜';
  if (lowerTitle.includes('guardería') || lowerTitle.includes('juego') || lowerTitle.includes('bloques')) return '🧸';
  if (lowerTitle.includes('mentira') || lowerTitle.includes('pelea') || lowerTitle.includes('acoso')) return '⚠️';
  return '⭐';
};

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

  const [showReportModal, setShowReportModal] = useState(false);
  const router = useRouter();

  const sanitizeTitle = (t?: string) => (t || '').replace(/^\[[^\]]+\]\s*/i, '').trim();

  if (!summary) return null;

  return (
    <div className="flex min-h-screen bg-white text-slate-800 font-sans pb-20 lg:pb-0">
      {/* Modal final de felicitación al completar todas las etapas */}
      <AnimatePresence>
        {state.showFinalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[300] flex items-center justify-center p-4"
          >
            <motion.div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-2xl text-center">
              <h2 className="text-3xl font-display font-bold text-slate-800 mb-4">¡Felicidades!</h2>
              <p className="text-slate-600 mb-6">Has completado el recorrido. Aquí tienes un resumen de tus estadísticas finales:</p>
              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">XP</div>
                  <div className="font-bold text-lg text-orange-500">{summary.character.xp}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">Monedas</div>
                  <div className="font-bold text-lg text-sky-500">{summary.character.monedas}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">Progreso total</div>
                  <div className="font-bold text-lg text-slate-800">{summary.decisionsCount} decisiones</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-slate-500">Etapa final</div>
                  <div className="font-bold text-lg text-[#FF005A]">{ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}</div>
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    state.setShowFinalModal(false);
                    router.push('/');
                  }}
                  className="px-8 py-3 rounded-2xl bg-[#58CC02] text-white font-bold shadow-md hover:bg-[#46A302]"
                >
                  Terminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <main className="flex-1 lg:ml-64 lg:mr-[420px] flex flex-col items-center p-6 sm:p-10">

        {/* Barra superior de recompensas */}
        <div className="w-full max-w-[600px] flex justify-end items-center gap-6 mb-8 px-4">
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

          {/* Nodos del camino (Eventos Disponibles) */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="relative py-10 flex flex-col items-center w-full gap-12"
          >
            {decisions.map((decision, index) => {
              const isCompleted = index < completedDecisionsCount;
              const isCurrent = index === completedDecisionsCount;
              const offset = index % 2 === 0 ? 0 : index % 4 === 1 ? 40 : -40;
              const nextOffset = index < decisions.length - 1 ? ((index + 1) % 2 === 0 ? 0 : (index + 1) % 4 === 1 ? 40 : -40) : null;
              const diffX = nextOffset !== null ? nextOffset - offset : 0;

              return (
                <motion.div 
                  key={decision.id} 
                  variants={{
                    hidden: { opacity: 0, y: 20, scale: 0.8 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 15, stiffness: 200 } }
                  }}
                  className="relative w-full flex justify-center group" 
                  style={{ left: `${offset}px` }}
                >
                  {index < decisions.length - 1 && (
                      <svg className="absolute top-[calc(100%-10px)] left-1/2 w-1 h-12 z-0 overflow-visible" style={{ transform: 'translateX(-50%)' }}>
                        <path
                          d={`M 0 0 C 0 28, ${diffX} 28, ${diffX} 56`}
                          fill="none"
                          stroke={isCompleted ? "#58CC02" : "#E5E5E5"}
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={isCompleted ? "none" : "10 14"}
                        />
                      </svg>
                    )}

                  {isCurrent ? (
                    <div className="relative flex flex-col items-center cursor-pointer group z-10" onClick={handleStartNode}>
                      <div className="absolute -top-16 bg-white border-2 border-gray-200 rounded-2xl px-5 py-3 font-bold text-[#FF005A] shadow-md z-20 whitespace-nowrap animate-bounce text-base">
                        ¡EMPEZAR!
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 rotate-45" />
                      </div>
                      <div className="w-[96px] h-[96px] rounded-full bg-[#FF005A] shadow-[0_10px_0_#D9004C] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center border-4 border-white relative hover:brightness-110">
                        <span className="text-5xl relative z-10 drop-shadow-md">{getDecisionEmoji(decision.titulo)}</span>
                        <div className="absolute inset-0 rounded-full border-4 border-[#FF005A] animate-ping opacity-40" />
                        <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-pulse" />
                      </div>
                    </div>
                  ) : isCompleted ? (
                    <div className="w-[80px] h-[80px] rounded-full bg-[#58CC02] shadow-[0_8px_0_#46A302] flex items-center justify-center border-4 border-white opacity-95 z-10 relative cursor-default hover:-translate-y-1 transition-transform">
                      <span className="text-3xl drop-shadow-sm">{getDecisionEmoji(decision.titulo)}</span>
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-[#58CC02] fill-[#D7FFB8]" />
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-3 bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg">
                        {sanitizeTitle(decision.titulo)}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-[64px] h-[64px] rounded-full bg-[#E5E5E5] shadow-[0_6px_0_#CCCCCC] flex items-center justify-center border-4 border-white opacity-80 z-10 relative">
                      <span className="text-xl grayscale opacity-40">{getDecisionEmoji(decision.titulo)}</span>
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

            {/* Informe final de vida (Vejez) */}
            {summary.character.etapaActual === 'OLD_AGE' && (
              <motion.div 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="mt-8 flex flex-col items-center w-full max-w-xs"
              >
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full py-4 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all bg-slate-800 text-white hover:bg-slate-700 shadow-[0_6px_0_#0f172a] active:translate-y-2 active:shadow-none"
                >
                  Ver Informe de Vida
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      <SidebarStats 
        characterId={characterId} 
        summary={summary} 
        stageProgress={{ current: completedDecisionsCount, total: Math.max(decisions.length, 1) }}
      />
      
      <MobileBottomNav characterId={characterId} />

      {/* Modal del Informe Final */}
      <AnimatePresence>
        {showReportModal && (
          <LifeReportModal 
            characterId={characterId} 
            onClose={() => setShowReportModal(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
