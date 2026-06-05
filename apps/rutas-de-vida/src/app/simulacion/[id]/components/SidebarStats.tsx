import { useRouter } from 'next/navigation';
import { Activity, Brain, Users, Heart, Shield, MessageCircle, Home, BookOpen, Globe, Target, User, ShoppingBag, Medal } from 'lucide-react';
import { ETAPA_LABELS, STAT_COLORS, CONTEXT_COLORS } from '../../../../utils/constants';
import { StatBar } from '../../../../components/StatBar';
import { DailyQuests } from '../../../../components/DailyQuests';
import type { CharacterSummary } from '../../../../types';

export function SidebarStats({ characterId, summary }: { characterId: string; summary: CharacterSummary }) {
  const router = useRouter();

  return (
    <aside className="hidden lg:flex w-80 border-l border-gray-200 flex-col p-6 fixed right-0 h-full bg-white overflow-y-auto pb-24">
      <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-200">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#FF005A] to-[#FF96CB] p-[2px]">
          <div className="bg-white w-full h-full rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-[#FF005A]" />
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg leading-tight">{summary.character.nombre}</h3>
          <p className="text-sm font-semibold text-gray-400">
            {ETAPA_LABELS[summary.character.etapaActual] || summary.character.etapaActual}
          </p>
        </div>
      </div>

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
