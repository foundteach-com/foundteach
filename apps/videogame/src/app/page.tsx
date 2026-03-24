"use client";

import { useGameState } from "../hooks/useGameState";
import LevelMap from "../components/LevelMap";
import ChallengeScreen from "../components/ChallengeScreen";
import GarzieCharacter from "../components/GarzieCharacter";
import { Star } from "lucide-react";

export default function Home() {
  const { isMapScreen, score } = useGameState();

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex flex-col bg-gradient-to-b from-[var(--color-llano-sky)] to-[var(--color-llano-sand)]">
      
      {/* Top HUD */}
      <header className="w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[var(--color-llano-orange)]">
            <span className="font-extrabold text-[#ea580c] text-xl">G</span>
          </div>
          <h1 className="font-extrabold text-2xl text-[var(--color-llano-earth)] tracking-tight">Garzie MVP</h1>
        </div>
        
        <div className="bg-white px-6 py-2 rounded-full shadow-md border-2 border-yellow-400 flex items-center gap-2">
          <Star className="text-yellow-400 fill-yellow-400 w-5 h-5" />
          <span className="font-bold text-lg text-gray-800">{score}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 w-full flex items-center justify-center relative z-10 p-4">
        <div className="w-full max-w-5xl h-full max-h-[800px] flex items-center justify-center">
          {isMapScreen ? <LevelMap /> : <ChallengeScreen />}
        </div>
      </div>

      {/* Garzie HUD (Bottom area) */}
      <div className="fixed bottom-0 left-0 w-full p-8 flex justify-center pointer-events-none z-30">
        <div className="max-w-4xl w-full pointer-events-auto">
          <GarzieCharacter />
        </div>
      </div>
      
      {/* Sun Decoration */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-50 z-0 pointer-events-none" />
      
      {/* Ground Decoration (Llanos horizon) */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-[var(--color-llano-green)]/20 to-transparent z-0 pointer-events-none" />

    </main>
  );
}
