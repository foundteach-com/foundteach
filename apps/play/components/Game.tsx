'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SHAPES, ShapeDef } from '@/lib/shapes';
import { ShapeIcon } from '@/components/ShapeIcon';
import { CheckCircle2, XCircle, RefreshCw, Trophy } from 'lucide-react';

interface GameShape extends ShapeDef {
  id: string;
}

interface GameProps {
  playerName?: string;
  studentCode?: string;
}

export function Game({ playerName: _playerName, studentCode: _studentCode }: GameProps = {}) {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [boardShapes, setBoardShapes] = useState<GameShape[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');

  const generateRound = useCallback(() => {
    const numTargetShapes = Math.floor(Math.random() * 3) + 1;
    const targetShapes: GameShape[] = [];
    let currentTargetSum = 0;
    for (let i = 0; i < numTargetShapes; i++) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      targetShapes.push({ ...randomShape, id: `target-${i}-${Date.now()}` });
      currentTargetSum += randomShape.value;
    }
    setTargetNumber(currentTargetSum);
    const totalShapes = 8;
    const remainingShapes: GameShape[] = [];
    for (let i = 0; i < totalShapes - numTargetShapes; i++) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      remainingShapes.push({ ...randomShape, id: `filler-${i}-${Date.now()}` });
    }
    const allShapes = [...targetShapes, ...remainingShapes].sort(() => Math.random() - 0.5);
    setBoardShapes(allShapes);
    setSelectedIds(new Set());
    setGameState('playing');
    setMessage('');
  }, []);

  useEffect(() => { generateRound(); }, [generateRound]);

  const handleShapeClick = (id: string) => {
    if (gameState !== 'playing') return;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const checkAnswer = () => {
    if (selectedIds.size === 0) return;
    let currentSum = 0;
    boardShapes.forEach(shape => {
      if (selectedIds.has(shape.id)) currentSum += shape.value;
    });
    if (currentSum === targetNumber) {
      setGameState('won');
      setScore(s => s + 10);
      setMessage('¡Correcto!');
      setTimeout(() => generateRound(), 1800);
    } else {
      setGameState('lost');
      setMessage(`Suma: ${currentSum} ≠ ${targetNumber}`);
      setTimeout(() => {
        setGameState('playing');
        setMessage('');
        setSelectedIds(new Set());
      }, 2200);
    }
  };

  const currentSum = Array.from(selectedIds).reduce((sum, id) => {
    const shape = boardShapes.find(s => s.id === id);
    return sum + (shape ? shape.value : 0);
  }, 0);

  if (boardShapes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-3 sm:p-4 gap-3 sm:gap-4">

      {/* ── Row 1: Score + Skip ─────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-indigo-900">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-lg sm:text-xl">Puntos: {score}</span>
        </div>
        <button
          onClick={generateRound}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm font-semibold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Saltar
        </button>
      </div>

      {/* ── Row 2: Target number ───────────────────────────────── */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 bg-indigo-50 rounded-2xl px-4 py-3">
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-0.5">
            Número objetivo
          </p>
          <motion.span
            key={targetNumber}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl sm:text-7xl font-black text-indigo-600 leading-none"
          >
            {targetNumber}
          </motion.span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left max-w-xs leading-relaxed">
          Selecciona figuras 2D (lados) o 3D (caras)<br className="hidden sm:inline" />
          para que sumen exactamente el número objetivo.
        </p>
      </div>

      {/* ── Row 3: Shape grid — grows to fill space ───────────── */}
      <div className="flex-1 min-h-0">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 h-full">
          <AnimatePresence mode="popLayout">
            {boardShapes.map((shape) => {
              const isSelected = selectedIds.has(shape.id);
              return (
                <motion.button
                  key={shape.id}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShapeClick(shape.id)}
                  className={`
                    relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                    }
                  `}
                >
                  <ShapeIcon
                    type={shape.type}
                    className={`w-8 h-8 sm:w-12 sm:h-12 mb-1 sm:mb-2 ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`}
                  />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-700 text-center leading-tight px-1">
                    {shape.name}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">
                    {shape.dimension} · {shape.value}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-indigo-500 text-white rounded-full p-0.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Row 4: Current sum + check button ─────────────────── */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
        {/* Feedback message */}
        <div className="flex-1 w-full sm:w-auto min-h-[36px]">
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                  ${gameState === 'won'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                  }`}
              >
                {gameState === 'won'
                  ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                  : <XCircle className="w-4 h-4 shrink-0" />
                }
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sum indicator + button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2 flex-1 sm:flex-none justify-between sm:justify-start">
            <span className="text-sm text-slate-500 font-medium">Suma:</span>
            <span className={`text-xl font-black ${
              currentSum > targetNumber
                ? 'text-red-500'
                : currentSum === targetNumber
                  ? 'text-emerald-500'
                  : 'text-indigo-600'
            }`}>
              {currentSum}
            </span>
          </div>
          <button
            onClick={checkAnswer}
            disabled={selectedIds.size === 0 || gameState !== 'playing'}
            className={`
              flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all
              ${selectedIds.size === 0 || gameState !== 'playing'
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg active:scale-95'
              }
            `}
          >
            Comprobar
          </button>
        </div>
      </div>
    </div>
  );
}
