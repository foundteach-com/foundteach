"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameState } from "../hooks/useGameState";

export default function ChallengeScreen() {
  const { 
    activeChallenge, 
    currentLevel, 
    submitAnswer, 
    returnToMap, 
    garzieState,
    setGarzieState 
  } = useGameState();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Reset local state when a new challenge begins
    setSelectedOption(null);
    setHasAnswered(false);
    setIsCorrect(false);
  }, [activeChallenge?.id]);

  if (!activeChallenge) return null;

  const handleSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedOption(index);
    setHasAnswered(true);

    const correct = index === activeChallenge.correctOptionIndex;
    setIsCorrect(correct);
    submitAnswer(index);
  };

  const handleNext = () => {
    if (isCorrect) {
      returnToMap();
    } else {
      // Re-try logic
      setHasAnswered(false);
      setSelectedOption(null);
      setGarzieState("THINKING", "¿Qué tal si buscamos otra opción?");
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl p-8 shadow-xl flat-shadow border-2 border-gray-100 relative overflow-hidden">
      
      {/* Decorative top bar */}
      <div className="absolute top-0 left-0 w-full h-4 bg-[var(--color-llano-orange)] opacity-80" />

      {/* Header */}
      <div className="flex justify-between items-center mb-8 pt-2">
        <h2 className="text-xl font-bold text-gray-800">Nivel {currentLevel}</h2>
        <button 
          onClick={returnToMap}
          className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          Volver al mapa
        </button>
      </div>

      {/* Question */}
      <div className="bg-amber-50 rounded-2xl p-6 mb-8 border border-amber-200">
        <p className="text-2xl font-semibold text-gray-800 text-center">
          {activeChallenge.question}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {activeChallenge.options.map((option, index) => {
            const isSelected = selectedOption === index;
            const isAnswerCorrect = index === activeChallenge.correctOptionIndex;
            
            let buttonClass = "bg-white border-2 border-gray-200 text-gray-700 hover:border-[var(--color-garzie-pink)] hover:bg-fuchsia-50";
            
            if (hasAnswered) {
              if (isSelected && !isAnswerCorrect) {
                buttonClass = "bg-red-100 border-2 border-red-500 text-red-800";
              } else if (isAnswerCorrect) {
                buttonClass = "bg-green-100 border-2 border-green-500 text-green-800";
              } else {
                buttonClass = "bg-gray-50 border-2 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed";
              }
            }

            return (
              <motion.button
                key={index}
                whileHover={!hasAnswered ? { scale: 1.02 } : {}}
                whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(index)}
                disabled={hasAnswered}
                className={`p-4 rounded-xl font-medium text-lg text-left transition-colors flat-shadow ${buttonClass}`}
              >
                {option}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Button */}
      {hasAnswered && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex justify-end"
        >
          <button 
            onClick={handleNext}
            className={`px-8 py-3 rounded-xl font-bold text-white text-lg flat-button ${
              isCorrect ? 'bg-[var(--color-llano-green)]' : 'bg-red-500'
            }`}
          >
            {isCorrect ? '¡Continuar!' : 'Intentar de nuevo'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
