"use client";

import { create } from "zustand";

export type GarzieState = "IDLE" | "THINKING" | "HAPPY" | "SAD";

export interface MathChallenge {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  hint: string;
}

interface GameState {
  // Player state
  score: number;
  unlockedLevels: number;
  currentLevel: number | null;
  
  // Character State
  garzieState: GarzieState;
  garzieMessage: string | null;
  
  // Game Flow
  isMapScreen: boolean;
  activeChallenge: MathChallenge | null;
  
  // Actions
  startGame: (level: number, challenges: MathChallenge[]) => void;
  returnToMap: () => void;
  submitAnswer: (optionIndex: number) => void;
  setGarzieState: (state: GarzieState, message?: string | null) => void;
  addScore: (points: number) => void;
}

export const useGameState = create<GameState>((set, get) => ({
  score: 0,
  unlockedLevels: 1, // First level is unlocked by default
  currentLevel: null,
  garzieState: "IDLE",
  garzieMessage: "¡Hola! Soy Garzie. ¡Vamos a aprender matemáticas!",
  isMapScreen: true,
  activeChallenge: null,

  startGame: (level, challenges) => {
    // For the MVP, we just load the first challenge of the level
    set({
      isMapScreen: false,
      currentLevel: level,
      activeChallenge: challenges[0] || null,
      garzieState: "THINKING",
      garzieMessage: "¿Puedes resolver este reto?"
    });
  },

  returnToMap: () => set({ 
    isMapScreen: true, 
    currentLevel: null, 
    activeChallenge: null,
    garzieState: "IDLE",
    garzieMessage: "¡Buen trabajo! Elige tu próximo destino."
  }),

  submitAnswer: (optionIndex) => {
    const { activeChallenge } = get();
    if (!activeChallenge) return;

    if (optionIndex === activeChallenge.correctOptionIndex) {
      // Correct!
      set((state) => ({
        score: state.score + 10,
        garzieState: "HAPPY",
        garzieMessage: "¡Excelente! Esa es la respuesta correcta.",
        // Unlock next level if this was the highest level unlocked
        unlockedLevels: state.currentLevel === state.unlockedLevels 
          ? state.unlockedLevels + 1 
          : state.unlockedLevels
      }));
    } else {
      // Incorrect :(
      set({
        garzieState: "SAD",
        garzieMessage: `Ups... La respuesta era incorrecta. ${activeChallenge.explanation}`,
      });
    }
  },

  setGarzieState: (state, message = null) => set({ garzieState: state, garzieMessage: message }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
}));
