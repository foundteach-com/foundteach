'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Globe, Users, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [showPoem, setShowPoem] = useState(false);
  const router = useRouter();

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-10 sm:px-12 sm:py-16 relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-[-12%] left-[-8%] w-[min(46vw,520px)] h-[min(46vw,520px)] bg-purple-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-float" />
      <div className="absolute bottom-[-12%] right-[-8%] w-[min(46vw,520px)] h-[min(46vw,520px)] bg-pink-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[15%] w-[min(35vw,360px)] h-[min(35vw,360px)] bg-sky-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-float" style={{ animationDelay: '4s' }} />

      <div className="z-10 text-center w-full max-w-[min(1120px,100%)] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-semibold tracking-wider uppercase mb-6 border border-purple-200/50">
            <Sparkles className="w-4 h-4" />
            Simulación Educativa Interactiva
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 text-slate-800 leading-tight">
            Tu Vida. <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500">
              Tus Decisiones.
            </span>
            <br /> Tu Desarrollo.
          </h1>
          <p className="text-base sm:text-lg text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Explora las etapas del desarrollo humano desde la primera infancia hasta la vejez. Cada decisión moldea tu camino cognitivo, social y emocional.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={() => setShowPoem(true)}
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 sm:px-12 sm:py-5 bg-[#58CC02] text-white font-bold text-lg sm:text-xl uppercase tracking-wider rounded-2xl transition-all shadow-[0_8px_0_#46A302] hover:bg-[#46A302] active:translate-y-2 active:shadow-none"
          >
            <span>Iniciar Simulación</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {showPoem ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 w-full flex justify-center"
          >
            <div className="w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur-xl text-slate-800">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-8">En el camino de la vida</h2>
              <div className="space-y-5 text-sm sm:text-base leading-relaxed">
                <p>En el camino de la vida,</p>
                <p>el destino siempre es avanzar,</p>
                <p>sin importar la etapa en llegarmos a estar</p>
                <p>ni lo que el futuro nos pueda deparar.</p>
                <p>Desde que nacemos hay una mano amiga</p>
                <p>que nos ayuda a gatear y caminar,</p>
                <p>y aunque el tiempo cambie muchas cosas,</p>
                <p>siempre necesitamos alguien con quien contar.</p>
                <p>Cuando somos niños soñamos despiertos,</p>
                <p>sin pensar en lo que tenemos que luchar;</p>
                <p>si algún día una estrella fugaz pasara frente a mí,</p>
                <p>pediría volver a mi niñez y con mis padres poder compartir.</p>
                <p>Mi familia se separó desde muy niña</p>
                <p>Sin poder disfrutar de una linda familia</p>
                <p>Pero eso no fue impedimento para ser buena chica</p>
                <p>Porque siempre me rodee de gente de Aguachica</p>
                <p>Elegí llenar mi alma de esperanza,</p>
                <p>de fuerza, de fe y de valor,</p>
                <p>para compartir con quienes han llegado</p>
                <p>a iluminar mi vida con su amor.</p>
                <p>Vivamos el momento, vivamos el hoy,</p>
                <p>disfrutemos cada regalo que Dios nos da,</p>
                <p>porque nadie sabe cuándo llega el momento</p>
                <p>en que de este mundo uno se va.</p>
                <p>Hoy solo le pido a Dios una promesa: que</p>
                <p>me permita a mi hijo felicidad brindarle,</p>
                <p>acompañarlo en cada uno de sus pasos</p>
                <p>y siempre a su lado yo poder estar.</p>
                <p>Que nunca le falte mi abrazo, ni</p>
                <p>el amor que una madre le puede dar,</p>
                <p>porque mi mayor sueño en esta vida</p>
                <p>es verlo crecer y poder acompañarlo.</p>
                <p className="font-semibold mt-4">Adriana Marcela Macea Jacome</p>
              </div>
              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => router.push('/crear-personaje')}
                  className="inline-flex items-center justify-center rounded-2xl bg-[#58CC02] px-10 py-3 text-base font-bold uppercase tracking-wider text-white shadow-[0_8px_0_#46A302] hover:bg-[#46A302] active:translate-y-1 active:shadow-none"
                >
                  Continuar
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {!showPoem && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-16 md:mt-24"
          >
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-teal-500" />}
              title="Enfoque Ecológico"
              description="Interactúa con tu familia, escuela y sociedad. Tu entorno importa."
              accentColor="from-teal-50 to-cyan-50"
              borderColor="border-teal-200/60"
              delay={0}
            />
            <FeatureCard 
              icon={<Users className="w-6 h-6 text-purple-500" />}
              title="Sistemas Relacionales"
              description="Forja lazos con tus padres, amigos y parejas a lo largo de tu vida."
              accentColor="from-purple-50 to-pink-50"
              borderColor="border-purple-200/60"
              delay={0.5}
            />
            <FeatureCard 
              icon={<Brain className="w-6 h-6 text-amber-500" />}
              title="Ciclo Vital Completo"
              description="Crece, aprende y enfrenta los retos de cada etapa de la existencia."
              accentColor="from-amber-50 to-orange-50"
              borderColor="border-amber-200/60"
              delay={1}
            />
          </motion.div>
        )}

        <footer className="mt-16 w-full px-4 sm:px-6">
          <div className="w-full flex justify-center bg-white/90 backdrop-blur-xl border-t border-slate-200 py-10">
            <div className="w-full max-w-[1200px] flex flex-col items-center gap-8 px-4 sm:px-6">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32">
                <Image
                  src="https://foundteach-assets.sfo3.cdn.digitaloceanspaces.com/logo-unimagdalena.png"
                  alt="Universidad del Magdalena"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center space-y-2 text-slate-800">
                <p className="text-sm sm:text-base font-semibold uppercase tracking-[0.2em] text-slate-500">Universidad del Magdalena</p>
                <p className="text-sm sm:text-base font-semibold">Facultad de Ciencias de la Educación</p>
                <p className="text-sm sm:text-base font-semibold">Licenciatura en Matemáticas</p>
                <p className="text-sm sm:text-base font-semibold">Desarrollo Humano &amp; Educación</p>
                <p className="text-sm sm:text-base font-semibold text-slate-600">
                  Adriana Marcela Macea Jacome&nbsp;|&nbsp;Mayorlis Martínez Domínguez&nbsp;|&nbsp;Manuel Antonio Martínez Sogamoso
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description, accentColor, borderColor, delay }: { icon: React.ReactNode, title: string, description: string, accentColor: string, borderColor: string, delay: number }) {
  return (
    <div className={`bg-gradient-to-br ${accentColor} p-6 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 border-2 ${borderColor} shadow-sm hover:shadow-lg`}>
      <motion.div 
        animate={{ y: [0, -8, 0] }} 
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay }}
        className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-[0_4px_0_rgba(0,0,0,0.05)] border border-gray-100"
      >
        {icon}
      </motion.div>
      <h3 className="font-display font-bold text-xl text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{description}</p>
    </div>
  );
}
