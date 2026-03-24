"use client";

import { motion, Variants } from "framer-motion";
import { useGameState, GarzieState } from "../hooks/useGameState";

const GarzieVariants: Variants = {
  IDLE: {
    y: [0, -5, 0],
    rotate: [0, 2, -2, 0],
    transition: { repeat: Infinity, duration: 3, ease: "easeInOut" },
  },
  THINKING: {
    y: [0, -10, 0],
    rotate: [0, 5, 0],
    transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
    scale: [1, 1.05, 1],
  },
  HAPPY: {
    y: [0, -20, 0],
    scale: [1, 1.1, 1],
    transition: { repeat: 3, duration: 0.5, ease: "easeOut" },
  },
  SAD: {
    y: [0, 5],
    rotate: [0, -10],
    scale: [1, 0.95],
    transition: { duration: 0.5 },
  },
};

export default function GarzieCharacter() {
  const { garzieState, garzieMessage } = useGameState();

  return (
    <div className="flex items-end gap-4 max-w-sm">
      {/* Garzie Avatar */}
      <motion.div
        className="w-24 h-32 rounded-full flex flex-col items-center justify-start pt-4 relative shadow-lg border-4 border-[var(--color-garzie-pink-dark)] overflow-hidden bg-[var(--color-garzie-pink)]"
        variants={GarzieVariants}
        animate={garzieState}
        initial="IDLE"
      >
        {/* Simple Garzie Face */}
        <div className="w-16 h-16 bg-white rounded-full flex gap-2 justify-center items-center shadow-inner relative">
           {/* Eyes */}
           <div className={`w-3 h-4 bg-black rounded-full transition-all ${garzieState === 'SAD' ? 'h-1 mt-2' : ''}`} />
           <div className={`w-3 h-4 bg-black rounded-full transition-all ${garzieState === 'SAD' ? 'h-1 mt-2' : ''}`} />
           {/* Beak */}
           <div className="absolute -bottom-4 w-12 h-8 bg-yellow-400 rounded-full" />
        </div>
      </motion.div>

      {/* Dialogue Box */}
      {garzieMessage && (
        <motion.div
          key={garzieMessage}
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="relative bg-white text-gray-800 p-4 rounded-2xl shadow-xl border-2 border-gray-200 flat-shadow font-bubble text-sm font-semibold"
        >
          {/* Triangle pointer */}
          <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white border-l-2 border-b-2 border-gray-200 transform -translate-y-1/2 rotate-45" />
          {garzieMessage}
        </motion.div>
      )}
    </div>
  );
}
