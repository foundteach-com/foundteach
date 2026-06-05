import { Trophy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DailyQuestsSummary {
  decisionsCount: number;
  xp: number;
  escudoRacha: boolean;
}

interface Quest {
  id: number;
  title: string;
  desc: string;
  progress: number;
  total: number;
  reward: number;
  done: boolean;
}

export function DailyQuests({ summary }: { summary: DailyQuestsSummary }) {
  const quests: Quest[] = [
    {
      id: 1,
      title: 'Aprende algo nuevo',
      desc: 'Completa 2 decisiones',
      progress: Math.min(summary.decisionsCount, 2),
      total: 2,
      reward: 20,
      done: summary.decisionsCount >= 2,
    },
    {
      id: 2,
      title: 'Imparable',
      desc: 'Acumula 50 XP',
      progress: Math.min(summary.xp, 50),
      total: 50,
      reward: 15,
      done: summary.xp >= 50,
    },
    {
      id: 3,
      title: 'Proteccionista',
      desc: 'Activa un escudo de racha',
      progress: summary.escudoRacha ? 1 : 0,
      total: 1,
      reward: 30,
      done: summary.escudoRacha,
    },
  ];

  const completedCount = quests.filter(q => q.done).length;

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-700 text-lg">Misiones Diarias</h3>
        <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
          {completedCount}/{quests.length}
        </span>
      </div>

      <div className="space-y-4">
        {quests.map((q) => {
          const percentage = Math.min(100, Math.round((q.progress / q.total) * 100));

          return (
            <div
              key={q.id}
              className={`border-2 p-4 rounded-2xl transition-colors ${
                q.done ? 'bg-[#58CC02]/5 border-[#58CC02]/30' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className={`font-bold text-sm ${q.done ? 'text-[#46A302]' : 'text-slate-800'}`}>
                    {q.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{q.desc}</p>
                </div>
                {q.done ? (
                  <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0" />
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                    <Trophy className="w-3 h-3" />
                    +{q.reward}
                  </div>
                )}
              </div>

              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                  className={`h-full rounded-full ${q.done ? 'bg-[#58CC02]' : 'bg-amber-400'}`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-right font-medium">
                {q.progress} / {q.total}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
