'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SHAPES, ShapeDef } from '@/lib/shapes';
import { ShapeIcon } from '@/components/ShapeIcon';
import {
  CheckCircle2, XCircle, Trophy, Star,
  Clock, ArrowRight, Zap
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */
interface GameShape extends ShapeDef { id: string; }

interface LevelRecord {
  level: number;
  score: number;
  rounds: number;
  date: string;
}

interface PlayerProgress {
  name: string;
  totalScore: number;
  highestLevel: number;
  levels: LevelRecord[];
}

interface GameProps {
  playerName: string;
  studentCode: string;
}

/* ─── LocalStorage helpers ──────────────────────────────────────── */
const SCORES_KEY = 'geomatch_scores';

function loadProgress(code: string): PlayerProgress | null {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as Record<string, PlayerProgress>)[code] ?? null;
  } catch { return null; }
}

function saveProgress(code: string, data: PlayerProgress) {
  try {
    const raw = localStorage.getItem(SCORES_KEY);
    const all: Record<string, PlayerProgress> = raw ? JSON.parse(raw) : {};
    all[code] = data;
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

/* ─── Round generation ──────────────────────────────────────────── */
const TIMER_SECONDS = 60;

function generateRound(correctInLevel: number, level: number): {
  boardShapes: GameShape[];
  target: number;
} {
  // Complexity: increases with correct answers and level
  const complexity = Math.floor(correctInLevel / 3) + Math.floor((level - 1) / 2);
  const numTargetShapes = Math.min(complexity + 1, 4);

  const targetShapes: GameShape[] = [];
  let target = 0;
  for (let i = 0; i < numTargetShapes; i++) {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    targetShapes.push({ ...s, id: `t-${i}-${Date.now()}-${Math.random()}` });
    target += s.value;
  }

  // Fill remaining slots (always 8 total for 4x2 grid)
  const fillers: GameShape[] = [];
  for (let i = 0; i < 8 - numTargetShapes; i++) {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    fillers.push({ ...s, id: `f-${i}-${Date.now()}-${Math.random()}` });
  }

  const board = [...targetShapes, ...fillers].sort(() => Math.random() - 0.5);
  return { boardShapes: board, target };
}

/* ─── Component ─────────────────────────────────────────────────── */
export function Game({ playerName, studentCode }: GameProps) {
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [phase, setPhase] = useState<'playing' | 'feedback' | 'level_end'>('playing');
  const [feedbackOk, setFeedbackOk] = useState(false);

  const [boardShapes, setBoardShapes] = useState<GameShape[]>([]);
  const [target, setTarget] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highestLevel, setHighestLevel] = useState(1);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextLevelCountRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [nextIn, setNextIn] = useState(4);

  /* ── Load saved progress on mount ─────────────────────────────── */
  useEffect(() => {
    const saved = loadProgress(studentCode);
    if (saved) {
      setTotalScore(saved.totalScore);
      setHighestLevel(saved.highestLevel);
    }
  }, [studentCode]);

  /* ── Start a new round ─────────────────────────────────────────── */
  const startNewRound = useCallback((correct: number, lv: number) => {
    const { boardShapes: b, target: t } = generateRound(correct, lv);
    setBoardShapes(b);
    setTarget(t);
    setSelected(new Set());
  }, []);

  /* ── Initialize level ──────────────────────────────────────────── */
  const startLevel = useCallback((lv: number, prevTotal: number, prevHighest: number) => {
    setLevel(lv);
    setTimeLeft(TIMER_SECONDS);
    setCorrectInLevel(0);
    setLevelScore(0);
    setPhase('playing');
    setNextIn(4);
    const h = Math.max(lv, prevHighest);
    setHighestLevel(h);
    startNewRound(0, lv);
  }, [startNewRound]);

  /* ── Timer countdown ───────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setPhase('level_end');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  /* ── When level ends: save + start countdown to next level ────── */
  useEffect(() => {
    if (phase !== 'level_end') return;

    setTotalScore(prev => {
      const newTotal = prev + levelScore;
      const newHighest = Math.max(level, highestLevel);
      const saved = loadProgress(studentCode) ?? { name: playerName, totalScore: 0, highestLevel: 1, levels: [] };
      const updated: PlayerProgress = {
        name: playerName,
        totalScore: newTotal,
        highestLevel: newHighest,
        levels: [
          ...saved.levels,
          { level, score: levelScore, rounds: correctInLevel, date: new Date().toLocaleDateString('es-CO') }
        ]
      };
      saveProgress(studentCode, updated);
      return newTotal;
    });

    let count = 4;
    setNextIn(count);
    nextLevelCountRef.current = setInterval(() => {
      count--;
      setNextIn(count);
      if (count <= 0) {
        clearInterval(nextLevelCountRef.current!);
        setTotalScore(prev => {
          startLevel(level + 1, prev, Math.max(level, highestLevel));
          return prev;
        });
      }
    }, 1000);

    return () => { if (nextLevelCountRef.current) clearInterval(nextLevelCountRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── First mount: start level 1 ────────────────────────────────── */
  useEffect(() => {
    startLevel(1, totalScore, highestLevel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Handle shape click ────────────────────────────────────────── */
  const handleClick = (id: string) => {
    if (phase !== 'playing') return;
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  /* ── Check answer ──────────────────────────────────────────────── */
  const checkAnswer = () => {
    if (phase !== 'playing' || selected.size === 0) return;
    const sum = Array.from(selected).reduce((acc, id) => {
      return acc + (boardShapes.find(s => s.id === id)?.value ?? 0);
    }, 0);

    const correct = sum === target;
    setFeedbackOk(correct);
    setPhase('feedback');

    if (correct) {
      const pts = 10 * level;
      setCorrectInLevel(c => c + 1);
      setLevelScore(s => s + pts);
    }

    setTimeout(() => {
      setPhase('playing');
      if (correct) {
        setCorrectInLevel(c => {
          startNewRound(c, level);
          return c;
        });
      } else {
        setSelected(new Set());
      }
    }, 1100);
  };

  /* ── Derived ───────────────────────────────────────────────────── */
  const currentSum = Array.from(selected).reduce((a, id) => {
    return a + (boardShapes.find(s => s.id === id)?.value ?? 0);
  }, 0);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 30 ? '#22c55e' : timeLeft > 10 ? '#f59e0b' : '#ef4444';

  if (!boardShapes.length) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative flex flex-col h-full overflow-hidden">

      {/* ── Level complete overlay ────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'level_end' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-indigo-900/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
            >
              <div className="text-5xl mb-3">⭐</div>
              <h2 className="text-2xl font-black text-indigo-900 mb-1">
                Nivel {level} completado
              </h2>
              <p className="text-slate-500 text-sm mb-5">¡Buen trabajo!</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center bg-indigo-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Respuestas
                  </span>
                  <span className="font-black text-indigo-700">{correctInLevel}</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-500" /> Este nivel
                  </span>
                  <span className="font-black text-yellow-600">+{levelScore} pts</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-emerald-600" /> Total acumulado
                  </span>
                  <span className="font-black text-emerald-700">{totalScore + levelScore} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold text-sm">
                <ArrowRight className="w-4 h-4" />
                Nivel {level + 1} en {nextIn}s...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Feedback flash overlay ────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'feedback' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-40 pointer-events-none flex items-center justify-center 
              ${feedbackOk ? 'bg-emerald-400' : 'bg-red-400'}`}
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-white"
            >
              {feedbackOk
                ? <CheckCircle2 className="w-20 h-20" strokeWidth={2.5} />
                : <XCircle className="w-20 h-20" strokeWidth={2.5} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main game content ─────────────────────────────────────── */}
      <div className="flex flex-col h-full p-3 sm:p-4 gap-2 sm:gap-3">

        {/* Row 1: Level + Score + Timer */}
        <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
          {/* Level badge */}
          <div className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1.5 font-bold text-sm shrink-0">
            <Star className="w-3.5 h-3.5 fill-indigo-700" />
            Nivel {level}
          </div>

          {/* Timer bar */}
          <div className="flex-1 flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" style={{ color: timerColor }} />
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full transition-colors duration-300"
                style={{ width: `${timerPct}%`, backgroundColor: timerColor }}
                animate={{ width: `${timerPct}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span
              className="text-sm font-black w-7 text-right tabular-nums"
              style={{ color: timerColor }}
            >
              {timeLeft}
            </span>
          </div>

          {/* Total score */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-black text-slate-800 text-sm sm:text-base tabular-nums">
              {totalScore + levelScore}
            </span>
          </div>
        </div>

        {/* Row 2: Target number */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 bg-indigo-50 rounded-2xl px-4 py-2.5">
          <div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Número objetivo
            </p>
            <motion.span
              key={target}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl sm:text-6xl font-black text-indigo-600 leading-none"
            >
              {target}
            </motion.span>
          </div>
          <div className="text-xs text-slate-500 leading-relaxed max-w-[180px] text-right">
            Selecciona figuras 2D (lados) o 3D (caras) que sumen el número.
            <br />
            <span className="text-indigo-500 font-semibold">
              +{10 * level} pts por acierto
            </span>
          </div>
        </div>

        {/* Row 3: Shape grid — grows */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 h-full">
            <AnimatePresence mode="popLayout">
              {boardShapes.map((shape) => {
                const isSel = selected.has(shape.id);
                return (
                  <motion.button
                    key={shape.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClick(shape.id)}
                    className={`
                      relative flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2
                      transition-all duration-200
                      ${isSel
                        ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <ShapeIcon
                      type={shape.type}
                      className={`w-7 h-7 sm:w-11 sm:h-11 mb-1 ${isSel ? 'text-indigo-600' : 'text-slate-500'}`}
                    />
                    <span className="text-[9px] sm:text-[11px] font-bold text-slate-700 text-center leading-tight px-1">
                      {shape.name}
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-slate-400">
                      {shape.dimension} · {shape.value}
                    </span>
                    {isSel && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white rounded-full p-0.5 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Row 4: Sum + Check */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 sm:px-4 py-2 flex-1">
            <span className="text-xs sm:text-sm text-slate-500 font-medium">Suma:</span>
            <span className={`text-xl font-black ml-auto tabular-nums ${
              currentSum > target ? 'text-red-500'
              : currentSum === target && currentSum > 0 ? 'text-emerald-500'
              : 'text-indigo-600'
            }`}>
              {currentSum}
            </span>
          </div>
          <button
            onClick={checkAnswer}
            disabled={selected.size === 0 || phase !== 'playing'}
            className={`
              px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all
              ${selected.size === 0 || phase !== 'playing'
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
