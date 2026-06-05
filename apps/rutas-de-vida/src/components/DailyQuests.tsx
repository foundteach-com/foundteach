import { Trophy, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function DailyQuests() {
  // Datos mockeados para la vista visual
  const quests = [
    { id: 1, title: 'Aprende algo nuevo', desc: 'Completa 2 decisiones', progress: 1, total: 2, reward: 20 },
    { id: 2, title: 'Imparable', desc: 'Gana 50 XP', progress: 50, total: 50, reward: 15 },
    { id: 3, title: 'Proteccionista', desc: 'Usa un escudo de racha', progress: 0, total: 1, reward: 30 },
  ];

  return (
    <div className="mt-8 border-t border-gray-100 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-700 text-lg">Misiones Diarias</h3>
        <Trophy className="w-5 h-5 text-amber-500" />
      </div>

      <div className="space-y-4">
        {quests.map((q) => {
          const isComplete = q.progress >= q.total;
          const percentage = Math.min(100, Math.round((q.progress / q.total) * 100));

          return (
            <div key={q.id} className="bg-white border-2 border-gray-100 p-4 rounded-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className={`font-bold text-sm ${isComplete ? 'text-gray-400 line-through' : 'text-slate-800'}`}>
                    {q.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{q.desc}</p>
                </div>
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-[#58CC02]" />
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg">
                    <Trophy className="w-3 h-3" />
                    +{q.reward}
                  </div>
                )}
              </div>

              {!isComplete && (
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mt-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 10 }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
