"use client";

import { motion } from "framer-motion";
import { useGameState, MathChallenge } from "../hooks/useGameState";
import { MapPin, Lock } from "lucide-react";

// Mock Data for MVP Levels (Tauramena theme math questions)
const LEVELS_DATA: Record<number, MathChallenge[]> = {
  1: [
    {
      id: "lvl1-q1",
      question: "Tauramena tiene paisajes hermosos. Si plantamos 3 árboles y luego quitamos 3 (3 + (-3) = ?). Seleccione la propiedad correspondiente.",
      options: ["Propiedad de cerradura", "Propiedad asociativa", "Propiedad del inverso", "Elemento neutro"],
      correctOptionIndex: 2,
      explanation: "Sumar un número con su inverso aditivo siempre da como resultado 0.",
      hint: "Piensa en el opuesto de un número.",
    }
  ],
  2: [
    {
      id: "lvl2-q1",
      question: "¿Qué propiedad de los números reales se ilustra en (4 + 2) + 1 = 4 + (2 + 1)?",
      options: ["Propiedad Conmutativa", "Propiedad Asociativa", "Propiedad Distributiva", "Elemento Neutro"],
      correctOptionIndex: 1,
      explanation: "El orden en el que se agrupan los números usando paréntesis no altera la suma.",
      hint: "Observa cómo se agrupan los números.",
    }
  ],
  3: [
    {
      id: "lvl3-q1",
      question: "En un hato llanero hay 5 grupos de 2 caballos. Si lo calculas como 2 grupos de 5 caballos, ¿qué propiedad usaste? (5 * 2 = 2 * 5)",
      options: ["Asociativa", "Clausurativa", "Conmutativa", "Inverso multiplicativo"],
      correctOptionIndex: 2,
      explanation: "El orden de los factores no altera el producto.",
      hint: "El orden se ha invertido o conmutado.",
    }
  ],
  4: [
    {
      id: "lvl4-q1",
      question: "¿Cuál de los siguientes números NO es un número real?",
      options: ["π (Pi)", "√-1", "-0.5", "1000"],
      correctOptionIndex: 1,
      explanation: "La raíz cuadrada de un número negativo pertenece a los números imaginarios, no a los reales.",
      hint: "Las raíces pares de números negativos tienen un problema.",
    }
  ],
  5: [
    {
      id: "lvl5-q1",
      question: "La propiedad distributiva dice que: 3 * (4 + 2) es igual a...",
      options: ["(3+4) * 2", "(3*4) + (3*2)", "3 + 4 + 2", "3 * 4 * 2"],
      correctOptionIndex: 1,
      explanation: "El número fuera del paréntesis se multiplica por cada término dentro del paréntesis y luego se suman.",
      hint: "Distribuye la multiplicación en cada elemento de la suma.",
    }
  ]
};

export default function LevelMap() {
  const { unlockedLevels, startGame } = useGameState();

  const handleLevelClick = (level: number) => {
    if (level <= unlockedLevels) {
      startGame(level, LEVELS_DATA[level]);
    }
  };

  return (
    <div className="w-full h-full relative p-8 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-[var(--color-llano-earth)] mb-2 drop-shadow-md">Mapa de Tauramena</h1>
        <p className="text-lg text-[var(--color-llano-orange)] font-medium">Selecciona una parada en el llano para aprender.</p>
      </div>

      <div className="relative w-full max-w-2xl h-64 bg-[var(--color-llano-sand)] rounded-3xl border-4 border-amber-600/20 overflow-hidden flat-shadow">
        {/* Simple drawn path */}
        <svg className="absolute inset-0 w-full h-full stroke-amber-600/40" preserveAspectRatio="none">
           <path d="M 10 50 Q 25 10 50 50 T 90 50" fill="transparent" strokeWidth="2" strokeDasharray="5,5" vectorEffect="non-scaling-stroke"/>
        </svg>

        <div className="absolute inset-0 flex items-center justify-around px-8">
          {[1, 2, 3, 4, 5].map((level) => {
            const isUnlocked = level <= unlockedLevels;
            const isCurrent = level === unlockedLevels;
            
            return (
              <motion.button
                key={level}
                whileHover={isUnlocked ? { scale: 1.1, y: -5 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                onClick={() => handleLevelClick(level)}
                className={`flex flex-col items-center gap-2 z-10 ${!isUnlocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 shadow-lg ${
                  isCurrent ? 'bg-[var(--color-garzie-pink)] border-white animate-bounce' 
                  : isUnlocked ? 'bg-[var(--color-llano-green)] border-white' 
                  : 'bg-gray-400 border-gray-200'
                }`}>
                  {isUnlocked ? (
                     <span className="text-white font-bold text-xl">{level}</span>
                  ) : (
                     <Lock className="text-white w-6 h-6" />
                  )}
                </div>
                <span className={`font-bold text-sm ${isUnlocked ? 'text-amber-900' : 'text-gray-500'}`}>
                  Nivel {level}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  );
}
