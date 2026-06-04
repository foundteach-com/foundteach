'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Users, Heart, Shield, MessageCircle, Home, BookOpen, Globe, User, ArrowRight } from 'lucide-react';

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

export default function SimulacionPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [summary, setSummary] = useState<CharacterSummary | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [currentDecision, setCurrentDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTakingDecision, setIsTakingDecision] = useState(false);

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/rdv/progress/${characterId}/summary`);
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
      const res = await fetch(`${API_URL}/rdv/decisions?stage=${stage}`);
      if (!res.ok) throw new Error('Error al cargar decisiones');
      const data: Decision[] = await res.json();
      setDecisions(data);
      
      // Select the first decision for now if available
      if (data.length > 0) {
        // En un juego real, habría lógica para elegir la decisión basada en progreso,
        // Aquí tomamos una aleatoria o la primera
        const randomIndex = Math.floor(Math.random() * data.length);
        setCurrentDecision(data[randomIndex]);
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

  const handleDecision = async (optionId: string) => {
    if (!currentDecision) return;
    setIsTakingDecision(true);

    try {
      const res = await fetch(`${API_URL}/rdv/progress/decide`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          decisionId: currentDecision.id,
          optionId
        }),
      });

      if (!res.ok) {
        throw new Error('Error al enviar la decisión');
      }

      // Refresh state
      await initialize();
    } catch (err) {
      console.error(err);
      alert('Hubo un error al registrar tu decisión.');
    } finally {
      setIsTakingDecision(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[var(--color-brand-accent)]"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl text-red-400">Error al cargar la simulación</h1>
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20">Volver al Inicio</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-4 sm:p-8 relative">
      {/* Background ambient effects */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-[var(--color-brand-purple)] rounded-full mix-blend-multiply filter blur-[200px] opacity-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[800px] h-[800px] bg-[var(--color-brand-indigo)] rounded-full mix-blend-multiply filter blur-[200px] opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Panel: Character Stats */}
        <div className="lg:col-span-3 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-6 rounded-3xl"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-[var(--color-brand-purple)] to-[var(--color-brand-accent)] p-1 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <div className="bg-[#09090b] w-full h-full rounded-full flex items-center justify-center overflow-hidden relative">
                  <User className="w-8 h-8 text-white/50" />
                </div>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">{summary.character.nombre}</h2>
              <p className="text-sm text-gray-400 uppercase tracking-widest mt-1">
                {summary.character.etapaActual.replace('_', ' ')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Desarrollo</h3>
              <StatBar icon={<Activity size={16} />} label="Físico" value={summary.stats.fisico} color="bg-green-500" />
              <StatBar icon={<Brain size={16} />} label="Cognitivo" value={summary.stats.cognitivo} color="bg-blue-500" />
              <StatBar icon={<Users size={16} />} label="Social" value={summary.stats.social} color="bg-purple-500" />
              <StatBar icon={<Heart size={16} />} label="Afectivo" value={summary.stats.afectivo} color="bg-pink-500" />
              <StatBar icon={<Shield size={16} />} label="Ético" value={summary.stats.etico} color="bg-amber-500" />
              <StatBar icon={<MessageCircle size={16} />} label="Comunic." value={summary.stats.comunicativo} color="bg-cyan-500" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-6 rounded-3xl"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Contextos</h3>
            <div className="space-y-4">
              <StatBar icon={<Home size={16} />} label="Familia" value={summary.context.familia} color="bg-orange-500" />
              <StatBar icon={<BookOpen size={16} />} label="Escuela" value={summary.context.escuela} color="bg-indigo-500" />
              <StatBar icon={<Globe size={16} />} label="Sociedad" value={summary.context.sociedad} color="bg-teal-500" />
            </div>
          </motion.div>
        </div>

        {/* Center Panel: Main Gameplay / Decision */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {currentDecision ? (
              <motion.div
                key={currentDecision.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-panel p-8 sm:p-12 rounded-3xl h-full flex flex-col justify-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-accent)]" />
                
                <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-[var(--color-brand-accent)] text-xs font-medium tracking-wider uppercase mb-6 self-start">
                  Evento Crítico
                </span>
                
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
                  {currentDecision.titulo}
                </h2>
                
                <p className="text-lg text-gray-300 leading-relaxed mb-12 max-w-3xl">
                  {currentDecision.descripcion}
                </p>

                <div className="space-y-4 max-w-2xl">
                  {currentDecision.options.map((option, index) => (
                    <button
                      key={option.id}
                      onClick={() => handleDecision(option.id)}
                      disabled={isTakingDecision}
                      className="w-full text-left p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="text-gray-200 text-lg pr-4">{option.texto}</span>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-brand-accent)] group-hover:text-white transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-decisions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-12 rounded-3xl h-full flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Globe className="w-12 h-12 text-gray-500" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white mb-4">Un Momento de Paz</h2>
                <p className="text-gray-400 max-w-md">
                  Actualmente no hay decisiones críticas disponibles para esta etapa de desarrollo. Pronto surgirán nuevos retos en el camino de {summary.character.nombre}.
                </p>
                <p className="mt-4 text-xs text-gray-600">(Asegúrate de haber corrido las migraciones y seeders en el backend para tener decisiones cargadas en la BD).</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
      </div>
    </main>
  );
}

function StatBar({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 text-gray-300`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-xs font-medium text-gray-400">{label}</span>
          <span className="text-xs font-bold text-white">{value}</span>
        </div>
        <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}
