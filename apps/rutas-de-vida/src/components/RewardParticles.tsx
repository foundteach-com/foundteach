import { motion, AnimatePresence } from 'framer-motion';

export function RewardParticles({ show, type }: { show: boolean; type: 'xp' | 'monedas' | 'vida' }) {
  if (!show) return null;
  const emojis = type === 'xp' ? ['🔥', '+10 XP'] : type === 'monedas' ? ['🪙', '+5'] : ['💔'];
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.5 }}
              animate={{
                opacity: 0,
                y: type === 'vida' ? 50 : -150,
                x: (i % 3 - 1) * 60 + (Math.random() * 40 - 20),
                scale: 1.5,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, delay: i * 0.08 }}
              className="absolute font-bold text-2xl"
              style={{
                top: '60%',
                left: `${30 + i * 8}%`,
              }}
            >
              {emojis[i % emojis.length]}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
