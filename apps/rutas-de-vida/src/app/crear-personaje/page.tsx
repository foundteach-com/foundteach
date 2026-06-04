'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User as UserIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Gender = 'MALE' | 'FEMALE' | null;

export default function CrearPersonaje() {
  const [step, setStep] = useState<1 | 2>(1);
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState<Gender>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleNextStep = () => {
    if (nombre.trim().length >= 2) {
      setStep(2);
    }
  };

  const handleCreate = async () => {
    if (!genero) return;
    
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/rdv/characters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          genero,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear el personaje');
      }

      const character = await response.json();
      
      // Redirigimos a la vista de la simulación
      router.push(`/simulacion/${character.id}`);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Ocurrió un error al intentar crear el personaje. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-brand-accent)] rounded-full mix-blend-multiply filter blur-[150px] opacity-10 animate-float" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-brand-purple)] rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-float" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-4xl p-8 sm:p-12 rounded-3xl relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-white">Nacimiento del Personaje</h1>
          <p className="text-gray-400">Define la identidad de tu simulación vital.</p>
        </div>

        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center justify-center h-full pt-10"
              >
                <div className="w-full max-w-md">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-4 text-center">
                    ¿Cómo se llamará tu personaje?
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-6 w-6 text-gray-500 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                      className="glass-input block w-full pl-12 pr-4 py-4 rounded-2xl text-xl placeholder-gray-600 focus:ring-0 focus:border-transparent"
                      placeholder="Ej. Mateo o Valentina"
                      autoFocus
                    />
                  </div>
                  
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={handleNextStep}
                      disabled={nombre.trim().length < 2}
                      className="group flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-all border border-white/10 hover:border-white/30"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col items-center h-full"
              >
                <p className="text-xl text-center mb-8 text-gray-300">
                  Selecciona el género de <span className="text-white font-bold">{nombre}</span>
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
                  {/* Male Card */}
                  <button
                    onClick={() => setGenero('MALE')}
                    className={`relative p-1 rounded-3xl transition-all duration-300 overflow-hidden ${
                      genero === 'MALE' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)]' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="bg-[#0f0f13] h-full w-full rounded-[22px] overflow-hidden group">
                      <div className="relative h-64 w-full">
                        <Image 
                          src="/male_character.png" 
                          alt="Hombre" 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-transparent to-transparent" />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className={`font-display text-xl font-medium ${genero === 'MALE' ? 'text-white' : 'text-gray-400'}`}>Hombre</h3>
                      </div>
                    </div>
                  </button>

                  {/* Female Card */}
                  <button
                    onClick={() => setGenero('FEMALE')}
                    className={`relative p-1 rounded-3xl transition-all duration-300 overflow-hidden ${
                      genero === 'FEMALE' 
                        ? 'bg-gradient-to-br from-pink-500 to-amber-500 scale-105 shadow-[0_0_30px_rgba(245,158,11,0.3)]' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="bg-[#0f0f13] h-full w-full rounded-[22px] overflow-hidden group">
                      <div className="relative h-64 w-full">
                        <Image 
                          src="/female_character.png" 
                          alt="Mujer" 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f13] via-transparent to-transparent" />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className={`font-display text-xl font-medium ${genero === 'FEMALE' ? 'text-white' : 'text-gray-400'}`}>Mujer</h3>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-all border border-white/10"
                  >
                    Volver
                  </button>
                  
                  {genero && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleCreate}
                      disabled={isSubmitting}
                      className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[var(--color-brand-accent)] to-orange-600 text-white rounded-full transition-all animate-glow hover:scale-105 disabled:opacity-70 disabled:animate-none"
                    >
                      {isSubmitting ? (
                        <span>Naciendo...</span>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Comenzar Vida</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}
