import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { RewardParticles } from '../../../../components/RewardParticles';
import { playSuccessSound, playWarningSound } from '../../../../utils/audio';
import { ETAPA_LABELS, STAT_COLORS } from '../../../../utils/constants';
import { getCharacterAvatar, getDecisionBackground } from '../../../../utils/visuals';
import Image from 'next/image';
import type { useSimulation } from '../hooks/useSimulation';

export function PlayingView({ state }: { state: ReturnType<typeof useSimulation> }) {
  const {
    summary, decisions, currentDecision, completedDecisionsCount,
    setViewMode, selectedOptionId, isTakingDecision, showDrawer, drawerVariant,
    showXpParticles, showMonedaParticles, showVidaParticles,
    handleSelectOption, handleConfirmDecision, handleContinue
  } = state;

  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentDecision) {
      setIsTyping(true);
      const t = setTimeout(() => setIsTyping(false), 1500);
      return () => clearTimeout(t);
    }
  }, [currentDecision]);

  useEffect(() => {
    if (showDrawer) {
      if (drawerVariant === 'success') {
        playSuccessSound();
      } else {
        playWarningSound();
      }
    }
  }, [showDrawer, drawerVariant]);

  if (!currentDecision || !summary) return null;

  const totalDecisionsInStage = Math.max(decisions.length, 1);
  const progressPercentage = Math.min(100, Math.round((completedDecisionsCount / totalDecisionsInStage) * 100));

  const bgImage = getDecisionBackground(currentDecision.titulo, currentDecision.descripcion);
  const avatarImage = getCharacterAvatar(summary.character.genero, summary.character.etapaActual);

  return (
    <div className="min-h-screen relative flex flex-col font-sans overflow-hidden bg-gray-50">
      
      {/* Fondo Dinámico con Ken Burns effect */}
      {bgImage && (
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          {/* Overlay para garantizar legibilidad */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
        </motion.div>
      )}

      {/* Contenedor principal con z-index para estar por encima del fondo */}
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Partículas de recompensa */}
      <RewardParticles show={showXpParticles} type="xp" />
      <RewardParticles show={showMonedaParticles} type="monedas" />
      <RewardParticles show={showVidaParticles} type="vida" />

      {/* Cabecera */}
      <header className="w-full max-w-4xl mx-auto p-4 flex items-center gap-4">
        <button
          onClick={() => setViewMode('dashboard')}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Barra de progreso */}
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 h-full bg-[#58CC02] rounded-full"
          >
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
          </motion.div>
        </div>

        {/* Vidas en la vista de juego */}
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50">
          {Array.from({ length: summary.character.vidas }).map((_, i) => (
            <span key={i} className="text-xl">❤️</span>
          ))}
        </div>
      </header>

      {/* Zona de juego */}
      <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6">
        <div className="w-full text-center mb-4">
          <span className="text-sm font-bold uppercase tracking-widest text-[#FF005A] bg-[#FF005A]/10 px-4 py-1.5 rounded-full">
            {ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {currentDecision.titulo}
        </h2>

        <div className="flex items-start gap-4 mb-8 bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-white/60 shadow-lg">
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-white shrink-0 flex items-center justify-center border-4 border-white shadow-xl relative overflow-hidden"
          >
            <Image src={avatarImage} alt="Avatar" fill className="object-cover" />
          </motion.div>
          <div className="bg-white/90 backdrop-blur-xl p-5 rounded-2xl rounded-tl-none border border-white/80 shadow-sm relative flex-1">
            <div className="absolute -left-[10px] top-4 w-4 h-4 bg-white/90 border-l border-t border-white/80 -rotate-45" />
            {isTyping ? (
              <div className="flex items-center gap-1.5 h-7 px-2">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }} className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }} className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
              </div>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg text-slate-700 leading-relaxed font-medium">
                {currentDecision.descripcion}
              </motion.p>
            )}
          </div>
        </div>

        {summary.character.vidas <= 0 ? (
          <div className="space-y-6">
            <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-rose-700 mb-2">Estás exhausto</h3>
              <p className="text-rose-600 mb-4">
                Has perdido todas tus energías. Debes tomar un descanso para continuar. 
                Recuperarás 1 ❤️ pero perderás 15 XP.
              </p>
              <button
                onClick={state.handleRest}
                disabled={isTakingDecision}
                className="w-full sm:w-auto px-8 py-3 bg-rose-500 text-white rounded-2xl font-bold uppercase tracking-wider hover:bg-rose-600 active:translate-y-1 shadow-[0_4px_0_#be123c] active:shadow-none transition-all disabled:opacity-50"
              >
                {isTakingDecision ? 'Descansando...' : 'Descansar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDecision.options.map((option, index) => {
              const isSelected = selectedOptionId === option.id;
              const letter = String.fromCharCode(65 + index); // A, B, C
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isTakingDecision || showDrawer || isTyping}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 backdrop-blur-md
                    ${isSelected
                      ? 'border-[#00E1FF] bg-[#00E1FF]/20 text-[#009EBA] scale-[1.02] shadow-md'
                      : 'border-white/80 bg-white/70 hover:bg-white/90 text-slate-700 hover:border-white hover:scale-[1.01] shadow-sm'
                    } ${(isTakingDecision || showDrawer || isTyping) ? 'opacity-50 cursor-not-allowed transform-none hover:scale-100' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 transition-colors
                    ${isSelected ? 'bg-[#00E1FF] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {letter}
                  </div>
                  <span className="text-lg font-medium flex-1">{option.texto}</span>
                  {isSelected && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-[#00E1FF] text-white flex items-center justify-center shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* Botón de acción (Oculto si no hay vidas) */}
      {summary.character.vidas > 0 && (
        <div className="w-full border-t-2 border-gray-200 bg-white p-6 pb-8 z-40">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div className="hidden sm:block"></div>
            <button
              disabled={!selectedOptionId || isTakingDecision || showDrawer}
              onClick={handleConfirmDecision}
              className={`px-12 py-3 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all w-full sm:w-auto
                ${selectedOptionId
                  ? 'bg-[#58CC02] text-white hover:bg-[#46A302] hover:shadow-[0_4px_0_#3B8A02] active:translate-y-1 active:shadow-none shadow-[0_6px_0_#46A302]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isTakingDecision ? 'Procesando...' : 'Comprobar'}
            </button>
          </div>
        </div>
      )}

      {/* Drawer de retroalimentación */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 w-full p-6 sm:p-8 z-50 border-t-2
              ${drawerVariant === 'success' ? 'bg-[#D7FFB8] border-[#58CC02]' : 'bg-[#FFDFE0] border-[#FF4B4B]'}
            `}
          >
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-white
                  ${drawerVariant === 'success' ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                  {drawerVariant === 'success'
                    ? <CheckCircle2 className="w-8 h-8" />
                    : <AlertCircle className="w-8 h-8" />
                  }
                </div>
                <div>
                  <h3 className={`font-display text-2xl font-bold mb-1
                    ${drawerVariant === 'success' ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                    {drawerVariant === 'success' ? '¡Muy bien!' : '¡Cuidado!'}
                  </h3>
                  {drawerVariant === 'warning' && (
                    <p className="text-[#FF4B4B] font-medium">
                      Esta decisión afectó negativamente tus estadísticas. ❤️ -1 vida
                    </p>
                  )}
                  <p className="text-sm font-semibold opacity-70 mt-1">
                    {drawerVariant === 'success' ? '+10 XP  •  +5 Monedas' : '+10 XP  •  +5 Monedas  •  -1 ❤️'}
                  </p>
                  
                  {state.statChanges && state.statChanges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {state.statChanges.map((change, i) => {
                        const isPositive = change.delta > 0;
                        const statKey = change.label.toLowerCase() as keyof typeof STAT_COLORS;
                        const colorInfo = STAT_COLORS[statKey] || { text: 'text-gray-600', bg: 'bg-gray-100' };
                        
                        return (
                          <div key={i} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${colorInfo.bg} ${colorInfo.text}`}>
                            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {change.label.charAt(0).toUpperCase() + change.label.slice(1)} {isPositive ? '+' : ''}{change.delta}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleContinue}
                className={`w-full sm:w-auto px-12 py-3 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all
                  ${drawerVariant === 'success'
                    ? 'bg-[#58CC02] text-white hover:bg-[#46A302] shadow-[0_4px_0_#46A302] active:translate-y-1 active:shadow-none'
                    : 'bg-[#FF4B4B] text-white hover:bg-[#EA2B2B] shadow-[0_4px_0_#EA2B2B] active:translate-y-1 active:shadow-none'
                  }
                `}
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Fin del contenedor relativo z-10 */}
      </div>
    </div>
  );
}
