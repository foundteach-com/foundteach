"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, Gamepad2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AuthLandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login / register success, redirect to the game
    router.push("/game");
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex items-center justify-center bg-zinc-900 font-sans">
      {/* Background Animated Gradients / Blob effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/30 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/30 blur-[130px] rounded-full mix-blend-screen pointer-events-none" />
      
      {/* Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center justify-between p-6 gap-12">
        
        {/* Left Side: Branding / Intro */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-600 shadow-2xl flex items-center justify-center mb-2 shadow-orange-500/50">
            <Gamepad2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-500 tracking-tight leading-tight">
            Descubre <br/> Garzie Web
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl max-w-md font-medium leading-relaxed">
            Un mundo interactivo para aprender matemáticas jugando. Entra, supera retos y conviértete en el maestro de los números reales.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex -space-x-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex justify-center items-center shadow-md">
                  <span className="text-xs text-zinc-400 font-semibold">{i+1}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-400 font-medium">+2,000 jugadores en línea</p>
          </div>
        </motion.div>

        {/* Right Side: Glassmorphism Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
            
            {/* Tabs */}
            <div className="flex items-center bg-black/20 p-1.5 rounded-2xl mb-8">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${isLogin ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${!isLogin ? 'bg-orange-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
              >
                Crear cuenta
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-5 relative">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0, y: -20 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-2"
                  >
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                      required={!isLogin}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider pl-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Contraseña</label>
                  {isLogin && <a href="#" className="text-xs text-orange-400 font-medium hover:underline">¿Olvidaste tu contraseña?</a>}
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0px 10px 20px rgba(249, 115, 22, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg flex justify-center items-center gap-2 group"
              >
                {isLogin ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar a Jugar
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Comenzar Aventura
                  </>
                )}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>
            
            {/* Social Oauth / Other */}
            <div className="mt-8">
              <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-medium text-zinc-500 uppercase">o continúa con</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              
              <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
            </div>

          </div>
        </motion.div>
      </div>

    </main>
  );
}
