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

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) setPlayer(JSON.parse(saved));
    } catch { /* ignore */ }
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
      <div className="h-screen bg-slate-50 flex items-center justify-center">
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
        <motion.div
          key="game"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="h-screen overflow-hidden flex flex-col bg-slate-50"
        >
          {/* ── Top bar: compact, fixed height ──────────────────── */}
          <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-100 shadow-sm">
            <h1 className="text-lg sm:text-xl font-black text-indigo-900 tracking-tight">
              GeoMath Match
            </h1>
            <div className="flex items-center gap-2">
              {/* Player badge */}
              <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-slate-700 max-w-[160px] truncate">
                  {player.name}
                </span>
                <span className="font-mono text-xs font-semibold text-indigo-500 tracking-wider">
                  {player.studentCode}
                </span>
              </div>
              {/* Mobile: just the avatar */}
              <div className="sm:hidden w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-black">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                title="Salir"
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors bg-slate-50 hover:bg-red-50 border border-slate-200 rounded-full px-3 py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </header>

          {/* ── Game board fills all remaining space ─────────────── */}
          <div className="flex-1 min-h-0 p-2 sm:p-3">
            <div className="h-full bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <Game playerName={player.name} studentCode={player.studentCode} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
