'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Brain, Globe, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-brand-purple)] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-brand-indigo)] rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-float" style={{ animationDelay: '2s' }} />

      <div className="z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block py-1 px-3 rounded-full glass-panel text-[var(--color-brand-accent)] text-sm font-medium tracking-wider uppercase mb-6">
            Simulación Educativa Interactiva
          </span>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight mb-8">
            Tu Vida. <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-amber-500">
              Tus Decisiones.
            </span>
            <br /> Tu Desarrollo.
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
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
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--color-brand-purple)] to-[var(--color-brand-indigo)] text-white font-display font-semibold text-lg rounded-full overflow-hidden transition-all animate-glow hover:scale-105"
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
        >
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-blue-400" />}
            title="Enfoque Ecológico"
            description="Interactúa con tu familia, escuela y sociedad. Tu entorno importa."
          />
          <FeatureCard 
            icon={<Users className="w-6 h-6 text-purple-400" />}
            title="Sistemas Relacionales"
            description="Forja lazos con tus padres, amigos y parejas a lo largo de tu vida."
          />
          <FeatureCard 
            icon={<Brain className="w-6 h-6 text-amber-400" />}
            title="Ciclo Vital Completo"
            description="Crece, aprende y enfrenta los retos de cada etapa de la existencia."
          />
        </motion.div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
        {icon}
      </div>
      <h3 className="font-display font-semibold text-xl text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
