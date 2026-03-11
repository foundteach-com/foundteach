'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SHAPES, ShapeDef } from '@/lib/shapes';
import { ShapeIcon } from '@/components/ShapeIcon';
import { CheckCircle2, XCircle, RefreshCw, Trophy } from 'lucide-react';

interface GameShape extends ShapeDef {
  id: string;
}

export function Game() {
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [boardShapes, setBoardShapes] = useState<GameShape[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string>('');

  const generateRound = useCallback(() => {
    // Decide how many shapes will make up the target (1 to 3)
    const numTargetShapes = Math.floor(Math.random() * 3) + 1;
    
    const targetShapes: GameShape[] = [];
    let currentTargetSum = 0;
    
    for (let i = 0; i < numTargetShapes; i++) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      targetShapes.push({
        ...randomShape,
        id: `target-${i}-${Date.now()}`
      });
      currentTargetSum += randomShape.value;
    }
    
    setTargetNumber(currentTargetSum);
    
    // Fill the rest of the board (total 8 shapes)
    const totalShapes = 8;
    const remainingShapesCount = totalShapes - numTargetShapes;
    const remainingShapes: GameShape[] = [];
    
    for (let i = 0; i < remainingShapesCount; i++) {
      const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      remainingShapes.push({
        ...randomShape,
        id: `filler-${i}-${Date.now()}`
      });
    }
    
    // Combine and shuffle
    const allShapes = [...targetShapes, ...remainingShapes].sort(() => Math.random() - 0.5);
    
    setBoardShapes(allShapes);
    setSelectedIds(new Set());
    setGameState('playing');
    setMessage('');
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    generateRound();
  }, [generateRound]);

  const handleShapeClick = (id: string) => {
    if (gameState !== 'playing') return;

    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const checkAnswer = () => {
    if (selectedIds.size === 0) return;

    let currentSum = 0;
    boardShapes.forEach(shape => {
      if (selectedIds.has(shape.id)) {
        currentSum += shape.value;
      }
    });

    if (currentSum === targetNumber) {
      setGameState('won');
      setScore(s => s + 10);
      setMessage('¡Correcto! Has completado el número.');
      setTimeout(() => {
        generateRound();
      }, 2000);
    } else {
      setGameState('lost');
      setMessage(`Incorrecto. La suma es ${currentSum}, pero necesitas ${targetNumber}.`);
      setTimeout(() => {
        setGameState('playing');
        setMessage('');
        setSelectedIds(new Set());
      }, 2500);
    }
  };

  const currentSum = Array.from(selectedIds).reduce((sum, id) => {
    const shape = boardShapes.find(s => s.id === id);
    return sum + (shape ? shape.value : 0);
  }, 0);

  if (boardShapes.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Cargando juego...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-2 text-2xl font-bold text-indigo-900">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <span>Puntos: {score}</span>
        </div>
        <button 
          onClick={generateRound}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors font-medium"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Saltar</span>
        </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-xl text-slate-500 font-medium mb-2 uppercase tracking-wider">Número Objetivo</h2>
        <motion.div 
          key={targetNumber}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black text-indigo-600 drop-shadow-sm"
        >
          {targetNumber}
        </motion.div>
        <p className="text-slate-600 mt-4 max-w-md mx-auto">
          Selecciona las figuras 2D (lados) o 3D (caras) para que sumen exactamente el número objetivo.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-12 w-full">
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShapeClick(shape.id)}
                className={`
                  relative flex flex-col items-center justify-center p-6 rounded-2xl border-4 transition-all duration-200
                  ${isSelected 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200' 
                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'}
                `}
              >
                <ShapeIcon 
                  type={shape.type} 
                  className={`w-20 h-20 mb-4 ${isSelected ? 'text-indigo-600' : 'text-slate-700'}`} 
                />
                <span className="text-sm font-semibold text-slate-700 text-center leading-tight">
                  {shape.name}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {shape.dimension} • {shape.value} {shape.dimension === '2D' ? 'lados' : 'caras'}
                </span>
                
                {isSelected && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-3 -right-3 bg-indigo-500 text-white rounded-full p-1 shadow-sm"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center w-full max-w-md">
        <div className="flex justify-between w-full mb-4 px-4 text-lg font-medium text-slate-700">
          <span>Suma actual:</span>
          <span className={`font-bold text-2xl ${currentSum > targetNumber ? 'text-red-500' : currentSum === targetNumber ? 'text-emerald-500' : 'text-indigo-600'}`}>
            {currentSum}
          </span>
        </div>
        
        <button
          onClick={checkAnswer}
          disabled={selectedIds.size === 0 || gameState !== 'playing'}
          className={`
            w-full py-4 rounded-2xl text-xl font-bold text-white shadow-md transition-all
            ${selectedIds.size === 0 || gameState !== 'playing'
              ? 'bg-slate-300 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]'}
          `}
        >
          Comprobar Respuesta
        </button>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-6 p-4 rounded-xl w-full text-center font-medium flex items-center justify-center gap-2
                ${gameState === 'won' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}
              `}
            >
              {gameState === 'won' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
