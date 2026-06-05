import { motion, AnimatePresence } from 'framer-motion';

export function RewardParticles({ show, type }: { show: boolean; type: 'xp' | 'monedas' | 'vida' | 'stat' }) {
  if (!show) return null;
  
  let emojis = ['✨', '⭐', '🌟'];
  if (type === 'xp') emojis = ['🔥', '✨', '🔥'];
  else if (type === 'monedas') emojis = ['🪙', '💎', '🪙'];
  else if (type === 'vida') emojis = ['💔'];
  else if (type === 'stat') emojis = ['📈', '⭐', '✨'];

  const count = type === 'vida' ? 5 : 15;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-[200]">
          {Array.from({ length: count }).map((_, i) => {
            // Generar ángulos aleatorios para que salgan en abanico
            const angle = (Math.random() * Math.PI) - (Math.PI / 2); // -90 a 90 grados hacia arriba (0 es arriba)
            const distance = 100 + Math.random() * 150;
            const yEnd = type === 'vida' ? 100 + Math.random() * 50 : -Math.cos(angle) * distance;
            const xEnd = Math.sin(angle) * distance + (Math.random() * 60 - 30);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: 0, scale: 0.5, rotate: 0 }}
                animate={{
                  opacity: 0,
                  y: yEnd,
                  x: xEnd,
                  scale: 1.5 + Math.random(),
                  rotate: Math.random() * 360 - 180,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 + Math.random() * 0.5, delay: i * 0.03, ease: "easeOut" }}
                className="absolute font-bold text-3xl drop-shadow-md"
                style={{
                  top: '50%',
                  left: '50%',
                  marginTop: '-20px',
                  marginLeft: '-20px'
                }}
              >
                {emojis[i % emojis.length]}
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
