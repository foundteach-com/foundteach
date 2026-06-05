'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, Users, Heart, Shield, MessageCircle,
  Home, BookOpen, Globe, User, ArrowRight, Sparkles,
  CheckCircle2, AlertCircle, Trophy, Navigation, Target,
  Star, MoreHorizontal, X, Flame, Coins, ShoppingBag, Medal,
} from 'lucide-react';
import { playSuccessSound } from '../../../utils/audio';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Mapa de etapas a nombres en español
const ETAPA_LABELS: Record<string, string> = {
  EARLY_CHILDHOOD: 'Primera Infancia',
  CHILDHOOD: 'Niñez',
  ADOLESCENCE: 'Adolescencia',
  YOUTH: 'Juventud',
  ADULTHOOD: 'Adultez',
  OLD_AGE: 'Vejez',
};

interface CharacterSummary {
  character: {
    id: string;
    nombre: string;
    genero: 'MALE' | 'FEMALE';
    etapaActual: string;
    xp: number;
    monedas: number;
    vidas: number;
  };
  stats: {
    fisico: number;
    cognitivo: number;
    social: number;
    afectivo: number;
    etico: number;
    comunicativo: number;
  };
  context: {
    familia: number;
    escuela: number;
    amigos: number;
    comunidad: number;
    sociedad: number;
  };
  relationships: Array<{ tipo: string; valor: number }>;
  decisionsCount: number;
}

interface Decision {
  id: string;
  etapa: string;
  titulo: string;
  descripcion: string;
  options: Array<{
    id: string;
    texto: string;
  }>;
}

interface ProgressEntry {
  decisionId: string;
}

// Componente de partículas de recompensa
function RewardParticles({ show, type }: { show: boolean; type: 'xp' | 'monedas' | 'vida' }) {
  if (!show) return null;
  const emojis = type === 'xp' ? ['🔥', '+10 XP'] : type === 'monedas' ? ['🪙', '+5'] : ['💔'];
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
              animate={{
                opacity: 0,
                y: type === 'vida' ? 50 : -150,
                x: (i % 3 - 1) * 60 + (Math.random() * 40 - 20),
                scale: 1.5,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: i * 0.08 }}
              className="absolute font-bold text-2xl"
              style={{
                top: '60%',
                left: `${30 + i * 8}%`,
              }}
            >
              {emojis[i % emojis.length]}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default function SimulacionPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [summary, setSummary] = useState<CharacterSummary | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [completedDecisionsCount, setCompletedDecisionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Vistas
  const [viewMode, setViewMode] = useState<'dashboard' | 'playing'>('dashboard');

  // Estados de la partida
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isTakingDecision, setIsTakingDecision] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState<'success' | 'warning'>('success');
  const [perdioVida, setPerdioVida] = useState(false);

  // Partículas de recompensa
  const [showXpParticles, setShowXpParticles] = useState(false);
  const [showMonedaParticles, setShowMonedaParticles] = useState(false);
  const [showVidaParticles, setShowVidaParticles] = useState(false);

  // Animación de avanzar de etapa
  const [showStageUpModal, setShowStageUpModal] = useState(false);
  const [nextStageName, setNextStageName] = useState('');

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/rdv/progress/${characterId}/summary`);
      if (!res.ok) throw new Error('Error al cargar estado del personaje');
      const data: CharacterSummary = await res.json();
      setSummary(data);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [characterId]);

  const fetchDecisions = useCallback(async (stage: string) => {
    try {
      const res = await fetch(`${API_URL}/api/rdv/decisions?stage=${stage}`);
      if (!res.ok) throw new Error('Error al cargar decisiones');
      const allDecisions: Decision[] = await res.json();

      const progressRes = await fetch(`${API_URL}/api/rdv/progress/${characterId}`);
      const progress: ProgressEntry[] = progressRes.ok ? await progressRes.json() : [];
      const takenIds = new Set(progress.map((p) => p.decisionId));

      setCompletedDecisionsCount(takenIds.size);
      setDecisions(allDecisions);

      const pending = allDecisions.filter((d) => !takenIds.has(d.id));
      setCurrentDecision(pending.length > 0 ? pending[0] : null);
    } catch (err) {
      console.error(err);
    }
  }, [characterId]);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    const charSummary = await fetchState();
    if (charSummary) {
      await fetchDecisions(charSummary.character.etapaActual);
    }
    setIsLoading(false);
  }, [fetchState, fetchDecisions]);

  useEffect(() => {
    if (characterId) {
      initialize();
    }
  }, [characterId, initialize]);

  const handleStartNode = () => {
    if (currentDecision) {
      setViewMode('playing');
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (isTakingDecision || showDrawer) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirmDecision = async () => {
    if (!selectedOptionId || !currentDecision) return;
    setIsTakingDecision(true);

    try {
      const res = await fetch(`${API_URL}/api/rdv/progress/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          decisionId: currentDecision.id,
          optionId: selectedOptionId,
        }),
      });

      if (!res.ok) throw new Error('Error al enviar la decisión');
      const data = await res.json();

      playSuccessSound();
      const perdio = data.perdioVida === true;
      setPerdioVida(perdio);
      setDrawerVariant(perdio ? 'warning' : 'success');

      // Mostrar partículas
      setShowXpParticles(true);
      setShowMonedaParticles(true);
      if (perdio) setShowVidaParticles(true);

      setTimeout(() => {
        setShowXpParticles(false);
        setShowMonedaParticles(false);
        setShowVidaParticles(false);
      }, 1500);

      setShowDrawer(true);
    } catch (err) {
      console.error(err);
      alert('Hubo un error al registrar tu decisión.');
    } finally {
      setIsTakingDecision(false);
    }
  };

  const handleContinue = async () => {
    setShowDrawer(false);
    setSelectedOptionId(null);
    setPerdioVida(false);
    setViewMode('dashboard');
    await initialize();
  };

  const handleAdvanceStage = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/api/rdv/progress/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al avanzar de etapa');
      }
      const data = await res.json();
      const siguienteNombre = ETAPA_LABELS[data.etapaActual] || data.etapaActual;
      setNextStageName(siguienteNombre);
      setShowStageUpModal(true);
      playSuccessSound();
      await initialize();
    } catch (error) {
      console.error(error);
      alert('Error al avanzar: ' + (error as Error).message);
      setIsLoading(false);
    }
  };

  if (isLoading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-[#FF005A]"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-white">
        <h1 className="text-2xl text-red-500 font-bold">Error al cargar</h1>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-[#FF005A] text-white rounded-full font-bold">Volver</button>
      </div>
    );
  }

  const statColors = {
    fisico: { bar: 'bg-[#58CC02]', bg: 'bg-[#58CC02]/10', text: 'text-[#58CC02]', icon: 'text-[#58CC02]' },
    cognitivo: { bar: 'bg-[#00E1FF]', bg: 'bg-[#00E1FF]/10', text: 'text-[#00B4CC]', icon: 'text-[#00B4CC]' },
    social: { bar: 'bg-[#CE82FF]', bg: 'bg-[#CE82FF]/10', text: 'text-[#A64BDB]', icon: 'text-[#A64BDB]' },
    afectivo: { bar: 'bg-[#FF96CB]', bg: 'bg-[#FF96CB]/10', text: 'text-[#E05E9C]', icon: 'text-[#E05E9C]' },
    etico: { bar: 'bg-[#FFC800]', bg: 'bg-[#FFC800]/10', text: 'text-[#CC9F00]', icon: 'text-[#CC9F00]' },
    comunicativo: { bar: 'bg-[#FF005A]', bg: 'bg-[#FF005A]/10', text: 'text-[#FF005A]', icon: 'text-[#FF005A]' },
  };

  // --- DASHBOARD ---
  const renderDashboard = () => (
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
          <StatBar icon={<Activity size={18} />} label="Físico" value={summary.stats.fisico} colors={statColors.fisico} />
          <StatBar icon={<Brain size={18} />} label="Cognitivo" value={summary.stats.cognitivo} colors={statColors.cognitivo} />
          <StatBar icon={<Users size={18} />} label="Social" value={summary.stats.social} colors={statColors.social} />
          <StatBar icon={<Heart size={18} />} label="Afectivo" value={summary.stats.afectivo} colors={statColors.afectivo} />
          <StatBar icon={<Shield size={18} />} label="Ético" value={summary.stats.etico} colors={statColors.etico} />
          <StatBar icon={<MessageCircle size={18} />} label="Comunicativo" value={summary.stats.comunicativo} colors={statColors.comunicativo} />
        </div>

        <h3 className="font-bold text-slate-700 mb-4 text-lg mt-4">Contexto</h3>
        <div className="space-y-4">
          <StatBar icon={<Home size={18} />} label="Familia" value={summary.context.familia} colors={{ bar: 'bg-[#FF96CB]', bg: 'bg-[#FF96CB]/10', text: 'text-[#E05E9C]', icon: 'text-[#E05E9C]' }} />
          <StatBar icon={<BookOpen size={18} />} label="Escuela" value={summary.context.escuela} colors={{ bar: 'bg-[#00E1FF]', bg: 'bg-[#00E1FF]/10', text: 'text-[#00B4CC]', icon: 'text-[#00B4CC]' }} />
        </div>

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

  // --- VISTA DE LA PREGUNTA ---
  const renderPlaying = () => {
    if (!currentDecision) return null;

    const totalDecisionsInStage = Math.max(decisions.length, 1);
    const progressPercentage = Math.min(100, Math.round((completedDecisionsCount / totalDecisionsInStage) * 100));

    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">

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
          <div className="flex items-center gap-1">
            {Array.from({ length: summary.character.vidas }).map((_, i) => (
              <span key={i} className="text-xl">❤️</span>
            ))}
          </div>
        </header>

        {/* Zona de juego */}
        <main className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            {currentDecision.titulo}
          </h2>

          <div className="flex items-start gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
            <div className="w-12 h-12 rounded-full bg-[#FF005A] shrink-0 flex items-center justify-center border-2 border-[#D9004C] mt-1 shadow-sm">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-gray-200 shadow-sm relative">
              <div className="absolute -left-[10px] top-4 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-200 -rotate-45" />
              <p className="text-lg text-slate-700 leading-relaxed font-medium">
                {currentDecision.descripcion}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {currentDecision.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={isTakingDecision || showDrawer}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between
                    ${isSelected
                      ? 'border-[#00E1FF] bg-[#00E1FF]/10 text-[#009EBA]'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-slate-600 hover:border-gray-300'
                    } ${(isTakingDecision || showDrawer) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="text-lg font-medium">{option.texto}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#00E1FF] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </main>

        {/* Botón de acción */}
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
      </div>
    );
  };

  return viewMode === 'dashboard' ? renderDashboard() : renderPlaying();
}

// --- SUBCOMPONENTES ---

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-colors
        ${active ? 'bg-[#FF005A]/10 text-[#FF005A] border-2 border-[#FF005A]/20' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-2 border-transparent'}
      `}
    >
      {icon}
      <span className="font-bold uppercase tracking-wider text-sm">{label}</span>
    </button>
  );
}

function StatBar({ icon, label, value, colors }: { icon: React.ReactNode; label: string; value: number; colors: { bar: string; bg: string; text: string; icon: string } }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 ${colors.icon}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-bold text-slate-700">{label}</span>
          <span className={`text-sm font-bold ${colors.text}`}>{value}</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 10, mass: 1 }}
            className={`h-full rounded-full ${colors.bar}`}
          >
            <div className="w-full h-1/3 bg-white/30" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
