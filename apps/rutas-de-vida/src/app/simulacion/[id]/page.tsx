'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Users, Heart, Shield, MessageCircle, Home, BookOpen, Globe, User, ArrowRight, Sparkles, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CharacterSummary {
  character: {
    id: string;
    nombre: string;
    genero: 'MALE' | 'FEMALE';
    etapaActual: string;
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

export default function SimulacionPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [summary, setSummary] = useState<CharacterSummary | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [totalDecisionsInStage, setTotalDecisionsInStage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Duolingo-style UI States
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isTakingDecision, setIsTakingDecision] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState<'success' | 'warning'>('success');
  const [lastChoiceText, setLastChoiceText] = useState('');

  const fetchState = async () => {
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
  };

  const fetchDecisions = async (stage: string) => {
    try {
      const res = await fetch(`${API_URL}/api/rdv/decisions?stage=${stage}`);
      if (!res.ok) throw new Error('Error al cargar decisiones');
      const allDecisions: Decision[] = await res.json();
      
      // The total decisions in this stage
      setTotalDecisionsInStage(Math.max(1, allDecisions.length));

      const progressRes = await fetch(`${API_URL}/api/rdv/progress/${characterId}`);
      const progress: ProgressEntry[] = progressRes.ok ? await progressRes.json() : [];
      const takenIds = new Set(progress.map((p) => p.decisionId));

      const pending = allDecisions.filter((d) => !takenIds.has(d.id));
      setDecisions(pending);

      if (pending.length > 0) {
        setCurrentDecision(pending[0]);
      } else {
        setCurrentDecision(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const initialize = async () => {
    setIsLoading(true);
    const charSummary = await fetchState();
    if (charSummary) {
      await fetchDecisions(charSummary.character.etapaActual);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (characterId) {
      initialize();
    }
  }, [characterId]);

  const handleSelectOption = (optionId: string) => {
    if (isTakingDecision || showDrawer) return;
    setSelectedOptionId(optionId);
  };

  const handleConfirmDecision = async () => {
    if (!selectedOptionId || !currentDecision) return;
    setIsTakingDecision(true);

    const chosenOption = currentDecision.options.find((o) => o.id === selectedOptionId);
    setLastChoiceText(chosenOption?.texto || '');

    try {
      const res = await fetch(`${API_URL}/api/rdv/progress/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          decisionId: currentDecision.id,
          optionId: selectedOptionId
        }),
      });

      if (!res.ok) {
        throw new Error('Error al enviar la decisión');
      }

      setDrawerVariant('success');
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
    await initialize();
  };

  if (isLoading && !summary) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-light-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-500"></div>
          <p className="text-slate-400 font-medium">Cargando tu aventura...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl text-red-500 font-bold">Error al cargar la simulación</h1>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 font-medium transition-colors">Volver al Inicio</button>
      </div>
    );
  }

  // Calculate Progress
  const completedInStage = summary.decisionsCount;
  const progressPercentage = Math.min(100, Math.round((completedInStage / totalDecisionsInStage) * 100));

  // Stat colors for light theme
  const statColors = {
    fisico: { bar: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
    cognitivo: { bar: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    social: { bar: 'bg-purple-400', bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
    afectivo: { bar: 'bg-pink-400', bg: 'bg-pink-50', text: 'text-pink-600', icon: 'text-pink-500' },
    etico: { bar: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-600', icon: 'text-amber-500' },
    comunicativo: { bar: 'bg-cyan-400', bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'text-cyan-500' },
  };

  return (
    <main className="min-h-screen pb-32 sm:pb-8 p-4 sm:p-8 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-purple-200 rounded-full mix-blend-multiply filter blur-[200px] opacity-30 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[200px] opacity-20 pointer-events-none" />
      <div className="fixed top-[40%] left-[30%] w-[400px] h-[400px] bg-sky-200 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Panel: Character Stats */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 rounded-3xl"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 p-1 mb-4 shadow-lg">
                <div className="bg-white w-full h-full rounded-full flex items-center justify-center overflow-hidden relative">
                  <User className="w-8 h-8 text-purple-300" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-800">{summary.character.nombre}</h2>
              <p className="text-sm text-slate-400 uppercase tracking-widest mt-1 font-medium">
                {summary.character.etapaActual.replace('_', ' ')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Desarrollo</h3>
              <StatBar icon={<Activity size={16} />} label="Físico" value={summary.stats.fisico} colors={statColors.fisico} />
              <StatBar icon={<Brain size={16} />} label="Cognitivo" value={summary.stats.cognitivo} colors={statColors.cognitivo} />
              <StatBar icon={<Users size={16} />} label="Social" value={summary.stats.social} colors={statColors.social} />
              <StatBar icon={<Heart size={16} />} label="Afectivo" value={summary.stats.afectivo} colors={statColors.afectivo} />
              <StatBar icon={<Shield size={16} />} label="Ético" value={summary.stats.etico} colors={statColors.etico} />
              <StatBar icon={<MessageCircle size={16} />} label="Comunic." value={summary.stats.comunicativo} colors={statColors.comunicativo} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-3xl"
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contextos</h3>
            <div className="space-y-4">
              <StatBar icon={<Home size={16} />} label="Familia" value={summary.context.familia} colors={{ bar: 'bg-orange-400', bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' }} />
              <StatBar icon={<BookOpen size={16} />} label="Escuela" value={summary.context.escuela} colors={{ bar: 'bg-indigo-400', bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' }} />
              <StatBar icon={<Globe size={16} />} label="Sociedad" value={summary.context.sociedad} colors={{ bar: 'bg-teal-400', bg: 'bg-teal-50', text: 'text-teal-600', icon: 'text-teal-500' }} />
            </div>
          </motion.div>
        </div>

        {/* Center Panel: Main Gameplay / Decision */}
        <div className="lg:col-span-9 flex flex-col">
          
          {/* Top Progress Bar (Duolingo Style) */}
          <div className="w-full mb-6 glass-panel rounded-full p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden relative border border-slate-200/50">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              >
                {/* Shine effect */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-white/40 rounded-full" />
              </motion.div>
            </div>
            <span className="font-bold text-slate-600 w-12 text-right text-sm">{progressPercentage}%</span>
          </div>

          {/* Game Area */}
          <div className="flex-1 h-full">
            <AnimatePresence mode="wait">
              {currentDecision ? (
                <motion.div
                  key={currentDecision.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full flex flex-col justify-center max-w-4xl mx-auto"
                >
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 mb-4 text-center leading-tight">
                    {currentDecision.titulo}
                  </h2>
                  
                  <p className="text-xl text-slate-500 leading-relaxed mb-10 text-center">
                    {currentDecision.descripcion}
                  </p>

                  <div className="space-y-4 mb-8">
                    {currentDecision.options.map((option, index) => {
                      const isSelected = selectedOptionId === option.id;
                      return (
                        <motion.button
                          key={option.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleSelectOption(option.id)}
                          disabled={isTakingDecision || showDrawer}
                          className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between
                            ${isSelected 
                              ? 'border-purple-400 bg-purple-50 text-purple-800 shadow-[0_4px_20px_rgba(139,92,246,0.15)]' 
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300'
                            } ${(isTakingDecision || showDrawer) ? 'opacity-50 cursor-not-allowed hover:bg-white' : ''}`}
                        >
                          <span className="text-lg font-medium pr-4">{option.texto}</span>
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                            ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-slate-300'}`}
                          >
                            {isSelected && <div className="w-3 h-3 bg-white rounded-full" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                </motion.div>
              ) : (
                <motion.div
                  key="no-decisions"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-12 rounded-3xl h-full flex flex-col items-center justify-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-6 shadow-inner">
                    <Trophy className="w-12 h-12 text-amber-500" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">¡Etapa Completada!</h2>
                  <p className="text-slate-500 max-w-md">
                    Has tomado todas las decisiones críticas de esta etapa. Pronto surgirán nuevos retos en el camino de {summary.character.nombre}.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Action Button (Only visible if not showing drawer and there is a decision) */}
      {!showDrawer && currentDecision && (
        <div className="fixed bottom-0 left-0 w-full p-6 sm:p-8 flex justify-center border-t border-slate-200/50 bg-white/80 backdrop-blur-md z-40">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-3"></div>
            <div className="lg:col-span-9 flex justify-end">
              <button
                disabled={!selectedOptionId || isTakingDecision}
                onClick={handleConfirmDecision}
                className={`px-12 py-4 rounded-2xl font-bold text-xl transition-all w-full sm:w-auto
                  ${selectedOptionId 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:scale-105 shadow-[0_6px_0_rgba(126,58,207,0.5)] active:translate-y-1 active:shadow-[0_2px_0_rgba(126,58,207,0.5)]' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }
                `}
              >
                {isTakingDecision ? 'Procesando...' : 'Comprobar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Feedback Drawer (Duolingo Style) */}
      <AnimatePresence>
        {showDrawer && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed bottom-0 left-0 w-full p-6 sm:p-8 z-50 border-t-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]
              ${drawerVariant === 'success' ? 'bg-emerald-400 border-emerald-500' : 'bg-orange-400 border-orange-500'}
            `}
          >
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="hidden lg:block lg:col-span-3"></div>
              <div className="lg:col-span-9 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                <div className="flex items-center gap-6 text-white w-full sm:w-auto">
                  <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                    {drawerVariant === 'success' ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-1">
                      {drawerVariant === 'success' ? '¡Excelente decisión!' : '¡Interesante elección!'}
                    </h3>
                    <p className="text-white/90 text-lg">
                      Tus estadísticas han sido actualizadas.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-bold text-xl uppercase tracking-wider transition-all
                    ${drawerVariant === 'success' 
                      ? 'bg-white text-emerald-600 hover:bg-emerald-50 shadow-[0_6px_0_rgba(5,150,105,0.4)] active:translate-y-1 active:shadow-none' 
                      : 'bg-white text-orange-600 hover:bg-orange-50 shadow-[0_6px_0_rgba(234,88,12,0.4)] active:translate-y-1 active:shadow-none'
                    }
                  `}
                >
                  Continuar
                </button>
                
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

function StatBar({ icon, label, value, colors }: { icon: React.ReactNode; label: string; value: number; colors: { bar: string; bg: string; text: string; icon: string } }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 ${colors.icon}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-semibold text-slate-500">{label}</span>
          <span className={`text-xs font-bold ${colors.text}`}>{value}</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${colors.bar}`}
          />
        </div>
      </div>
    </div>
  );
}
