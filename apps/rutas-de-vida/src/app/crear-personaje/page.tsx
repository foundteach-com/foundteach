'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, User as UserIcon, Sparkles, ArrowLeft } from 'lucide-react';
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
      const response = await fetch(`${apiUrl}/api/rdv/characters`, {
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
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-amber-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-float" />
      <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[30%] left-[50%] w-[300px] h-[300px] bg-pink-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-float" style={{ animationDelay: '3s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-4xl p-8 sm:p-12 rounded-3xl relative z-10"
      >
        {/* Step indicator */}
        <div className="flex justify-center gap-3 mb-8">
          <div className={`h-2 rounded-full transition-all duration-500 ${step === 1 ? 'w-12 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-6 bg-slate-200'}`} />
          <div className={`h-2 rounded-full transition-all duration-500 ${step === 2 ? 'w-12 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-6 bg-slate-200'}`} />
        </div>

        <div className="text-center mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3 text-slate-800">
            {step === 1 ? '¡Crea tu personaje!' : '¿Cómo luce?'}
          </h1>
          <p className="text-slate-400">
            {step === 1 ? 'Dale un nombre increíble a tu simulación vital.' : `Selecciona el género de ${nombre}`}
          </p>
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
                  {/* Avatar placeholder */}
                  <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-4 border-white shadow-lg">
                    <UserIcon className="w-10 h-10 text-purple-400" />
                  </div>

                  <label htmlFor="nombre" className="block text-sm font-semibold text-slate-500 mb-3 text-center uppercase tracking-wider">
                    ¿Cómo se llamará tu personaje?
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                      className="glass-input block w-full pl-12 pr-4 py-4 rounded-2xl text-xl focus:ring-0 font-medium"
                      placeholder="Ej. Mateo o Valentina"
                      autoFocus
                    />
                  </div>
                  
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={handleNextStep}
                      disabled={nombre.trim().length < 2}
                      className="group flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-200 disabled:to-slate-300 disabled:cursor-not-allowed text-white disabled:text-slate-400 font-semibold rounded-full transition-all shadow-lg hover:shadow-xl disabled:shadow-none hover:scale-105 disabled:scale-100"
                    >
                      <span>Continuar</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mb-10">
                  {/* Male Card */}
                  <button
                    onClick={() => setGenero('MALE')}
                    className={`relative p-1 rounded-3xl transition-all duration-300 overflow-hidden ${
                      genero === 'MALE' 
                        ? 'bg-gradient-to-br from-blue-400 to-purple-500 scale-105 shadow-[0_8px_30px_rgba(99,102,241,0.3)]' 
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    <div className="bg-white h-full w-full rounded-[22px] overflow-hidden group">
                      <div className="relative h-64 w-full bg-gradient-to-br from-blue-50 to-purple-50">
                        <Image 
                          src="/male_character.png" 
                          alt="Hombre" 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className={`font-display text-xl font-semibold ${genero === 'MALE' ? 'text-purple-600' : 'text-slate-500'}`}>Hombre</h3>
                      </div>
                    </div>
                  </button>

                  {/* Female Card */}
                  <button
                    onClick={() => setGenero('FEMALE')}
                    className={`relative p-1 rounded-3xl transition-all duration-300 overflow-hidden ${
                      genero === 'FEMALE' 
                        ? 'bg-gradient-to-br from-pink-400 to-amber-400 scale-105 shadow-[0_8px_30px_rgba(236,72,153,0.3)]' 
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                  >
                    <div className="bg-white h-full w-full rounded-[22px] overflow-hidden group">
                      <div className="relative h-64 w-full bg-gradient-to-br from-pink-50 to-amber-50">
                        <Image 
                          src="/female_character.png" 
                          alt="Mujer" 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className={`font-display text-xl font-semibold ${genero === 'FEMALE' ? 'text-pink-600' : 'text-slate-500'}`}>Mujer</h3>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-full transition-all border border-slate-200 shadow-sm hover:shadow"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver</span>
                  </button>
                  
                  {genero && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleCreate}
                      disabled={isSubmitting}
                      className="group flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-70"
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
