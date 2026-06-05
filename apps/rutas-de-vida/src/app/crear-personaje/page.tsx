'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Sparkles, ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Gender = 'MALE' | 'FEMALE' | null;

export default function CrearPersonaje() {
  const [step, setStep] = useState<1 | 2>(1);
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState<Gender>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleNextStep = () => {
    if (nombre.trim().length >= 2) {
      setStep(2);
    } else {
      setIsWobbling(true);
      setTimeout(() => setIsWobbling(false), 400);
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
      setErrorMsg('Error de conexión. Asegúrate de que el servidor está encendido.');
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercentage = step === 1 ? 50 : 100;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto p-6 flex items-center gap-6">
        <button 
          onClick={() => {
            if (step === 2) setStep(1);
            else router.push('/');
          }}
          className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
        >
          {step === 1 ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: step === 1 ? 0 : '50%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="absolute top-0 left-0 h-full bg-[#58CC02] rounded-full"
          >
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/30 rounded-full" />
          </motion.div>
        </div>
      </header>

      {/* Error Toast */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 bg-rose-500 text-white px-6 py-3 rounded-2xl shadow-lg font-bold flex items-center gap-2 max-w-[90%] w-max"
          >
            <X className="w-5 h-5" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full p-6 relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full flex flex-col items-center"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8 text-slate-800 text-center">
                ¡Dale un nombre a tu personaje!
              </h1>
              
              <div className="w-full max-w-md">
                <div className="flex items-start gap-4 mb-8 bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-[#FF005A] shrink-0 flex items-center justify-center border-4 border-white shadow-[0_4px_0_#D9004C] -mt-2">
                    <UserIcon className="w-8 h-8 text-white" />
                  </div>
                  <motion.div 
                    animate={isWobbling ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`bg-white p-4 rounded-2xl rounded-tl-none border-2 shadow-sm relative w-full transition-colors ${isWobbling ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  >
                    <div className={`absolute -left-[10px] top-4 w-4 h-4 bg-white border-l-2 border-t-2 -rotate-45 transition-colors ${isWobbling ? 'border-red-400 bg-red-50' : 'border-gray-200'}`} />
                    <input
                      type="text"
                      id="nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                      className={`w-full text-xl font-bold focus:outline-none bg-transparent ${isWobbling ? 'text-red-500 placeholder-red-300' : 'text-slate-700 placeholder-gray-300'}`}
                      placeholder="Escribe un nombre..."
                      autoFocus
                    />
                  </motion.div>
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
              className="w-full flex flex-col items-center"
            >
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-8 text-slate-800 text-center">
                ¿Cómo luce {nombre}?
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                {/* Male Card */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGenero('MALE')}
                  className={`relative p-6 rounded-3xl transition-all duration-300 border-4 flex flex-col items-center gap-4
                    ${genero === 'MALE' 
                      ? 'border-[#00E1FF] bg-[#00E1FF]/10 text-[#009EBA] shadow-[0_6px_0_#00B4CC] translate-y-[-4px]' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-slate-600 shadow-[0_6px_0_#E5E5E5]'
                    }
                  `}
                >
                  <div className="relative w-40 h-40 pointer-events-none">
                    <Image 
                      src="/male_character.png" 
                      alt="Hombre" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold text-xl">Hombre</span>
                </motion.button>

                {/* Female Card */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGenero('FEMALE')}
                  className={`relative p-6 rounded-3xl transition-all duration-300 border-4 flex flex-col items-center gap-4
                    ${genero === 'FEMALE' 
                      ? 'border-[#FF96CB] bg-[#FF96CB]/10 text-[#E05E9C] shadow-[0_6px_0_#E05E9C] translate-y-[-4px]' 
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-slate-600 shadow-[0_6px_0_#E5E5E5]'
                    }
                  `}
                >
                  <div className="relative w-40 h-40 pointer-events-none">
                    <Image 
                      src="/female_character.png" 
                      alt="Mujer" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold text-xl">Mujer</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Action Button Area */}
      <div className="w-full border-t-2 border-gray-200 bg-white p-6 pb-8 z-40">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="hidden sm:block"></div>
          
          {step === 1 ? (
            <button
              onClick={handleNextStep}
              disabled={nombre.trim().length < 2}
              className={`px-12 py-3 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all w-full sm:w-auto
                ${nombre.trim().length >= 2
                  ? 'bg-[#FF005A] text-white hover:bg-[#E0004F] hover:shadow-[0_4px_0_#D9004C] active:translate-y-1 active:shadow-none shadow-[0_6px_0_#D9004C]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Continuar
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!genero || isSubmitting}
              className={`flex items-center justify-center gap-2 px-12 py-3 rounded-2xl font-bold text-lg uppercase tracking-wider transition-all w-full sm:w-auto
                ${genero && !isSubmitting
                  ? 'bg-[#58CC02] text-white hover:bg-[#46A302] hover:shadow-[0_4px_0_#3B8A02] active:translate-y-1 active:shadow-none shadow-[0_6px_0_#46A302]' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <span>Creando...</span>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Comenzar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
