import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Brain, Users, Heart, Shield, MessageCircle, Home, BookOpen, Globe, Target, ShoppingBag, Medal } from 'lucide-react';
import { ETAPA_LABELS, STAT_COLORS, CONTEXT_COLORS } from '../../../../utils/constants';
import { StatBar } from '../../../../components/StatBar';
import { DailyQuests } from '../../../../components/DailyQuests';
import type { CharacterSummary } from '../../../../types';

const getStageEmoji = (stage: string) => {
  switch (stage) {
    case 'EARLY_CHILDHOOD': return '👶';
    case 'CHILDHOOD': return '🧒';
    case 'ADOLESCENCE': return '🧑';
    case 'YOUTH': return '🎓';
    case 'ADULTHOOD': return '💼';
    case 'OLD_AGE': return '🧓';
    default: return '🙂';
  }
};

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
    <aside className="hidden lg:flex w-80 border-l border-gray-200 flex-col p-6 fixed right-0 h-full bg-white overflow-y-auto pb-24">
      <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-2xl border border-gray-200 relative overflow-hidden group hover:border-[#FF005A]/30 transition-colors cursor-default">
        <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF005A]/5 rounded-bl-full -z-10 group-hover:bg-[#FF005A]/10 transition-colors" />
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF005A] to-[#FF96CB] p-[2px] shadow-sm">
          <div className="bg-white w-full h-full rounded-full flex items-center justify-center text-2xl">
            {getStageEmoji(summary.character.etapaActual)}
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg leading-tight">{summary.character.nombre}</h3>
          <p className="text-sm font-semibold text-gray-500">
            {ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}
          </p>
        </div>
      </div>

      {stageProgress && (
        <div className="mb-8 px-2">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Progreso de Etapa</span>
            <span className="text-xs font-bold text-[#FF005A]">{stageProgress.current} / {stageProgress.total}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.round((stageProgress.current / stageProgress.total) * 100))}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-[#FF005A] rounded-full relative"
            >
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30" />
            </motion.div>
          </div>
        </div>
      )}

      <hr className="border-gray-100 mb-6" />

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
