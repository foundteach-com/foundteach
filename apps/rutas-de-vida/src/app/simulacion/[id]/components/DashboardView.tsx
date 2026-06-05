import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Activity, Brain, Users, Heart, Shield, MessageCircle,
  Home, BookOpen, Globe, User, ArrowRight, Trophy,
  Navigation, Target, Star, Flame, Coins, ShoppingBag, Medal, CheckCircle2
} from 'lucide-react';
import { ETAPA_LABELS, STAT_COLORS, CONTEXT_COLORS } from '../../../../utils/constants';
import { ActivePowers } from '../../../../components/ActivePowers';
import { DailyQuests } from '../../../../components/DailyQuests';
import { NavItem } from '../../../../components/NavItem';
import { StatBar } from '../../../../components/StatBar';
import type { useSimulation } from '../hooks/useSimulation';

export function DashboardView({ 
  characterId, 
  state 
}: { 
  characterId: string; 
  state: ReturnType<typeof useSimulation>;
}) {
  const router = useRouter();
  const {
    summary, decisions, currentDecision, completedDecisionsCount, isLoading,
    showStageUpModal, setShowStageUpModal, nextStageName, handleAdvanceStage, handleStartNode
  } = state;

  if (!summary) return null;

  return (
    <div className="flex min-h-screen bg-white text-slate-800 font-sans">
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

      {/* Sidebar izquierdo */}
      <aside className="hidden lg:flex w-64 border-r border-gray-200 flex-col p-4 fixed h-full bg-white z-10">
        <div className="mb-10 pl-4 mt-4">
          <h1 className="font-display text-3xl font-bold text-[#FF005A] tracking-tight">foundteach</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <NavItem icon={<Navigation />} label="Aprender" active onClick={() => {}} />
          <NavItem icon={<Target />} label="Práctica" onClick={() => {}} />
          <NavItem icon={<Medal />} label="Ligas" onClick={() => router.push(`/simulacion/${characterId}/ligas`)} />
          <NavItem icon={<ShoppingBag />} label="Tienda" onClick={() => router.push(`/simulacion/${characterId}/tienda`)} />
          <NavItem icon={<Star />} label="Logros" onClick={() => router.push(`/simulacion/${characterId}/logros`)} />
          <NavItem icon={<User />} label="Perfil" onClick={() => router.push(`/simulacion/${characterId}/perfil`)} />
        </nav>
      </aside>

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

      {/* Sidebar derecho */}
      <aside className="hidden lg:flex w-80 border-l border-gray-200 flex-col p-6 fixed right-0 h-full bg-white overflow-y-auto">
        <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF005A] to-[#FF96CB] p-[2px]">
            <div className="bg-white w-full h-full rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-[#FF005A]" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg leading-tight">{summary.character.nombre}</h3>
            <p className="text-sm font-semibold text-gray-400">
              {ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}
            </p>
          </div>
        </div>

        <h3 className="font-bold text-slate-700 mb-4 text-lg">Estadísticas</h3>
        <div className="space-y-4 mb-8">
          <StatBar icon={<Activity size={18} />} label="Físico" value={summary.stats.fisico} colors={STAT_COLORS.fisico} />
          <StatBar icon={<Brain size={18} />} label="Cognitivo" value={summary.stats.cognitivo} colors={STAT_COLORS.cognitivo} />
          <StatBar icon={<Users size={18} />} label="Social" value={summary.stats.social} colors={STAT_COLORS.social} />
          <StatBar icon={<Heart size={18} />} label="Afectivo" value={summary.stats.afectivo} colors={STAT_COLORS.afectivo} />
          <StatBar icon={<Shield size={18} />} label="Ético" value={summary.stats.etico} colors={STAT_COLORS.etico} />
          <StatBar icon={<MessageCircle size={18} />} label="Comunicativo" value={summary.stats.comunicativo} colors={STAT_COLORS.comunicativo} />
        </div>

        <h3 className="font-bold text-slate-700 mb-4 text-lg mt-4">Contexto</h3>
        <div className="space-y-4">
          <StatBar icon={<Home size={18} />} label="Familia" value={summary.context.familia} colors={CONTEXT_COLORS.familia} />
          <StatBar icon={<BookOpen size={18} />} label="Escuela" value={summary.context.escuela} colors={CONTEXT_COLORS.escuela} />
          <StatBar icon={<Users size={18} />} label="Amigos" value={summary.context.amigos} colors={CONTEXT_COLORS.amigos} />
          <StatBar icon={<Target size={18} />} label="Comunidad" value={summary.context.comunidad} colors={CONTEXT_COLORS.comunidad} />
          <StatBar icon={<Globe size={18} />} label="Sociedad" value={summary.context.sociedad} colors={CONTEXT_COLORS.sociedad} />
        </div>

        <DailyQuests summary={{
          decisionsCount: summary.decisionsCount,
          xp: summary.character.xp,
          escudoRacha: summary.character.escudoRacha,
        }} />

        {/* Acceso rápido móvil */}
        <div className="mt-8 pt-6 border-t border-gray-100 space-y-2">
          <button
            onClick={() => router.push(`/simulacion/${characterId}/tienda`)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-2 border-transparent transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold text-sm">Ir a la Tienda</span>
          </button>
          <button
            onClick={() => router.push(`/simulacion/${characterId}/ligas`)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-2 border-transparent transition-colors"
          >
            <Medal className="w-5 h-5" />
            <span className="font-bold text-sm">Ver Ligas</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
