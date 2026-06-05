import { Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function ActivePowers({ hasShield, xpBoostCharges }: { hasShield: boolean, xpBoostCharges: number }) {
  if (!hasShield && xpBoostCharges <= 0) return null;

  return (
    <div className="flex items-center gap-3">
      {hasShield && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm"
        >
          <Shield className="w-5 h-5 text-blue-500 fill-blue-500" />
          <span className="text-sm font-bold text-blue-700">Protegido</span>
        </motion.div>
      )}

      {xpBoostCharges > 0 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-fuchsia-100 px-3 py-1.5 rounded-full border border-purple-200 shadow-sm"
        >
          <Zap className="w-5 h-5 text-purple-500 fill-purple-500" />
          <span className="text-sm font-bold text-purple-700">XP x2 ({xpBoostCharges})</span>
        </motion.div>
      )}
    </div>
  );
}
