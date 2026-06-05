import { motion } from 'framer-motion';

export function StatBar({ icon, label, value, colors }: { icon: React.ReactNode; label: string; value: number; colors: { bar: string; bg: string; text: string; icon: string } }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center shrink-0 ${colors.icon}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-bold text-slate-700">{label}</span>
          <span className={`text-sm font-bold ${colors.text}`}>{value}</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 10, mass: 1 }}
            className={`h-full rounded-full ${colors.bar}`}
          >
            <div className="w-full h-1/3 bg-white/30" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
