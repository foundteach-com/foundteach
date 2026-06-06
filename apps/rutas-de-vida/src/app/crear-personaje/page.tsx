'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { User as UserIcon, Sparkles, ArrowLeft, X } from 'lucide-react';
import Image from 'next/image';
import { Quicksand } from 'next/font/google';

const quicksand = Quicksand({ subsets: ['latin'], weight: ['400', '600', '700'], display: 'swap' });

type Gender = 'MALE' | 'FEMALE' | null;

export default function CrearPersonaje() {
  const [showPoem, setShowPoem] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [nombre, setNombre] = useState('');
  const [genero, setGenero] = useState<Gender>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWobbling, setIsWobbling] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('poem') === 'true') {
        setShowPoem(true);
      }
    }
  }, []);

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
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      {showPoem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={`${quicksand.className} w-full max-w-3xl max-h-[calc(100vh-4rem)] flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl backdrop-blur-xl text-slate-900`}
          >
            <div className="flex flex-col gap-4 h-full min-h-0">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-center">En el camino de la vida</h2>
              <div className="mt-4 grid gap-4 text-lg sm:text-xl leading-[1.2] text-center text-slate-700 overflow-y-auto pr-2 flex-1 min-h-0 shadow-inner rounded-3xl bg-slate-50/80 p-6">
                <p>En el camino de la vida,</p>
                <p>el destino siempre es avanzar,</p>
                <p>sin importar la etapa en llegarmos a estar</p>
                <p>ni lo que el futuro nos pueda deparar.</p>
                <p className="font-semibold">•</p>
                <p>Desde que nacemos hay una mano amiga</p>
                <p>que nos ayuda a gatear y caminar,</p>
                <p>y aunque el tiempo cambie muchas cosas,</p>
                <p>siempre necesitamos alguien con quien contar.</p>
                <p className="font-semibold">•</p>
                <p>Cuando somos niños soñamos despiertos,</p>
                <p>sin pensar en lo que tenemos que luchar;</p>
                <p>si algún día una estrella fugaz pasara frente a mí,</p>
                <p>pediría volver a mi niñez y con mis padres poder compartir.</p>
                <p className="font-semibold">•</p>
                <p>Mi familia se separó desde muy niña</p>
                <p>Sin poder disfrutar de una linda familia</p>
                <p>Pero eso no fue impedimento para ser buena chica</p>
                <p>Porque siempre me rodee de gente de Aguachica</p>
                <p className="font-semibold">•</p>
                <p>Elegí llenar mi alma de esperanza,</p>
                <p>de fuerza, de fe y de valor,</p>
                <p>para compartir con quienes han llegado</p>
                <p>a iluminar mi vida con su amor.</p>
                <p className="font-semibold">•</p>
                <p>Vivamos el momento, vivamos el hoy,</p>
                <p>disfrutemos cada regalo que Dios nos da,</p>
                <p>porque nadie sabe cuándo llega el momento</p>
                <p>en que de este mundo uno se va.</p>
                <p className="font-semibold">•</p>
                <p>Hoy solo le pido a Dios una promesa: que</p>
                <p>me permita a mi hijo felicidad brindarle,</p>
                <p>acompañarlo en cada uno de sus pasos</p>
                <p>y siempre a su lado yo poder estar.</p>
                <p className="font-semibold">•</p>
                <p>Que nunca le falte mi abrazo, ni</p>
                <p>el amor que una madre le puede dar,</p>
                <p>porque mi mayor sueño en esta vida</p>
                <p>es verlo crecer y poder acompañarlo.</p>
                <p className="font-semibold mt-2">Adriana Marcela Macea Jacome</p>
              </div>
              <div className="mt-8 h-px w-full bg-slate-200" />
              <div className="mt-6 flex-shrink-0 flex flex-col gap-4 sm:flex-row sm:justify-center items-center bg-white/0 py-4 shadow-[0_-10px_20px_-10px_rgba(2,6,23,0.06)]">
                <button
                  onClick={() => {
                    setShowPoem(false);
                    router.replace('/crear-personaje');
                  }}
                  className="inline-flex items-center justify-center rounded-3xl bg-gradient-to-br from-[#58CC02] to-[#46A302] px-12 py-3 text-lg font-extrabold uppercase tracking-wider text-white shadow-lg transform transition-transform hover:scale-[1.02] active:translate-y-0.5"
                >
                  INICIAR SIMULACIÓN
                </button>
                <button
                  onClick={() => setShowPoem(false)}
                  className="inline-flex items-center justify-center rounded-3xl border border-slate-300 bg-white px-8 py-3 text-base font-bold uppercase tracking-wider text-slate-700 shadow-sm hover:bg-slate-50 active:translate-y-1"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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
