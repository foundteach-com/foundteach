'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Brain, Globe, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-float" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-sky-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-float" style={{ animationDelay: '4s' }} />

      <div className="z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold tracking-wider uppercase mb-6 border border-purple-200/50">
            <Sparkles className="w-4 h-4" />
            Simulación Educativa Interactiva
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-8 text-slate-800">
            Tu Vida. <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500">
              Tus Decisiones.
            </span>
            <br /> Tu Desarrollo.
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Explora las etapas del desarrollo humano desde la primera infancia hasta la vejez. Cada decisión moldea tu camino cognitivo, social y emocional.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Link
            href="/crear-personaje"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-display font-semibold text-lg rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_8px_30px_rgba(139,92,246,0.35)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.5)]"
          >
            <span className="relative z-10">Iniciar Simulación</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
          </Link>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24"
        >
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-teal-500" />}
            title="Enfoque Ecológico"
            description="Interactúa con tu familia, escuela y sociedad. Tu entorno importa."
            accentColor="from-teal-50 to-cyan-50"
            borderColor="border-teal-200/60"
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-purple-500" />}
            title="Sistemas Relacionales"
            description="Forja lazos con tus padres, amigos y parejas a lo largo de tu vida."
            accentColor="from-purple-50 to-pink-50"
            borderColor="border-purple-200/60"
          />
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-amber-500" />}
            title="Ciclo Vital Completo"
            description="Crece, aprende y enfrenta los retos de cada etapa de la existencia."
            accentColor="from-amber-50 to-orange-50"
            borderColor="border-amber-200/60"
          />
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description, accentColor, borderColor }: { icon: React.ReactNode, title: string, description: string, accentColor: string, borderColor: string }) {
  return (
    <div className={`bg-gradient-to-br ${accentColor} p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 border ${borderColor} shadow-sm hover:shadow-lg`}>
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-xl text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
