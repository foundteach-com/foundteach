'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Game } from '@/components/Game';
import { RegisterForm } from '@/components/RegisterForm';
import { LogOut } from 'lucide-react';

interface Player {
  name: string;
  studentCode: string;
}

const SESSION_KEY = 'geomatch_player';

export default function Home() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if player is already registered in this session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        setPlayer(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setIsLoading(false);
  }, []);

  const handleRegister = (name: string, studentCode: string) => {
    const p: Player = { name, studentCode };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(p));
    setPlayer(p);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setPlayer(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!player ? (
        <motion.div
          key="register"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <RegisterForm onRegister={handleRegister} />
        </motion.div>
      ) : (
        <motion.main
          key="game"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center"
        >
          {/* Game Header */}
          <div className="max-w-4xl w-full mb-8">
            {/* Title */}
            <div className="text-center mb-4">
              <h1 className="text-5xl md:text-6xl font-black text-indigo-900 tracking-tight mb-3">
                GeoMath Match
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Selecciona las figuras cuyos lados o caras sumen el número objetivo.
              </p>
            </div>

            {/* Player badge + logout */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-2.5 bg-white border border-indigo-100 rounded-full px-4 py-2 shadow-sm">
                <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <span className="font-bold text-slate-800">{player.name}</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="font-mono font-semibold text-indigo-600 text-xs tracking-wider">
                    {player.studentCode}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors bg-white border border-slate-200 rounded-full px-3 py-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            </div>
          </div>

          {/* Game Board */}
          <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <Game playerName={player.name} studentCode={player.studentCode} />
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
}
