import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Brain, Users, Heart, Shield, MessageCircle, Home, BookOpen, Globe, Target, ShoppingBag, Medal } from 'lucide-react';
import { ETAPA_LABELS, STAT_COLORS, CONTEXT_COLORS } from '../../../../utils/constants';
import { getCharacterAvatar } from '../../../../utils/visuals';
import { StatBar } from '../../../../components/StatBar';
import { DailyQuests } from '../../../../components/DailyQuests';
import type { CharacterSummary } from '../../../../types';
import Image from 'next/image';

// Stage emojis are handled via avatars now, but keeping for reference if needed elsewhere

export function SidebarStats({ 
  characterId, 
  summary,
  stageProgress
}: { 
  characterId: string; 
  summary: CharacterSummary;
  stageProgress?: { current: number; total: number };
}) {
  const router = useRouter();

  return (
    <aside className="hidden lg:flex w-full max-w-96 border-l border-gray-200 flex-col p-8 fixed right-0 h-full bg-white overflow-y-auto pb-24" style={{ width: '420px' }}>
      <div className="flex items-center gap-4 mb-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 relative overflow-hidden group hover:border-[#FF005A]/30 transition-colors cursor-default">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF005A]/5 rounded-bl-full -z-10 group-hover:bg-[#FF005A]/10 transition-colors" />
        <div className="w-20 h-20 rounded-full bg-white shrink-0 flex items-center justify-center border-2 border-gray-100 shadow-sm relative overflow-hidden">
          <Image src={getCharacterAvatar(summary.character.genero, summary.character.etapaActual)} alt="Avatar" fill className="object-cover" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg leading-tight">{summary.character.nombre}</h3>
          <p className="text-sm font-semibold text-gray-500">
            {ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}
          </p>
        </div>
      </div>

      {stageProgress && (
        <div className="mb-10 p-5 bg-gradient-to-br from-[#FF005A]/5 to-[#FF005A]/2 rounded-2xl border border-[#FF005A]/20">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Progreso de Etapa</span>
            <span className="text-lg font-extrabold text-[#FF005A]">{stageProgress.current} / {stageProgress.total}</span>
          </div>
          <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-sm">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round((stageProgress.current / stageProgress.total) * 100))}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#FF005A] to-[#FF1A7B] rounded-full relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/40" />
            </motion.div>
          </div>
        </div>
      )}

      <hr className="border-gray-100 mb-8" />
      <h3 className="font-bold text-slate-700 mb-4 text-lg">Estadísticas</h3>
      <div className="space-y-4 mb-8">
        <StatBar icon={<Activity size={18} />} label="Físico" value={summary.stats.fisico} colors={STAT_COLORS.fisico} />
        <StatBar icon={<Brain size={18} />} label="Cognitivo" value={summary.stats.cognitivo} colors={STAT_COLORS.cognitivo} />
        <StatBar icon={<Users size={18} />} label="Social" value={summary.stats.social} colors={STAT_COLORS.social} />
        <StatBar icon={<Heart size={18} />} label="Afectivo" value={summary.stats.afectivo} colors={STAT_COLORS.afectivo} />
        <StatBar icon={<Shield size={18} />} label="Ético" value={summary.stats.etico} colors={STAT_COLORS.etico} />
        <StatBar icon={<MessageCircle size={18} />} label="Comunicativo" value={summary.stats.comunicativo} colors={STAT_COLORS.comunicativo} />
      </div>

      <h3 className="font-bold text-slate-700 mb-4 text-lg mt-4">Contexto</h3>
      <div className="space-y-4">
        <StatBar icon={<Home size={18} />} label="Familia" value={summary.context.familia} colors={CONTEXT_COLORS.familia} />
        <StatBar icon={<BookOpen size={18} />} label="Escuela" value={summary.context.escuela} colors={CONTEXT_COLORS.escuela} />
        <StatBar icon={<Users size={18} />} label="Amigos" value={summary.context.amigos} colors={CONTEXT_COLORS.amigos} />
        <StatBar icon={<Target size={18} />} label="Comunidad" value={summary.context.comunidad} colors={CONTEXT_COLORS.comunidad} />
        <StatBar icon={<Globe size={18} />} label="Sociedad" value={summary.context.sociedad} colors={CONTEXT_COLORS.sociedad} />
      </div>

      <DailyQuests summary={{
        decisionsCount: summary.decisionsCount,
        xp: summary.character.xp,
        escudoRacha: summary.character.escudoRacha,
      }} />

    </aside>
  );
}
