'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SHAPES, ShapeDef } from '@/lib/shapes';
import { ShapeIcon } from '@/components/ShapeIcon';
import {
  CheckCircle2, XCircle, Trophy, Star,
  Clock, ArrowRight, Zap, Pause, Play,
  AlertTriangle, BarChart2, RefreshCw
} from 'lucide-react';

/* ─── Constants ────────────────────────────────────────────────── */
const TIMER_SECONDS   = 60;
const MIN_CORRECT     = 3;   // minimum correct to advance level
const ANGLE_MODE_LVL  = 10;  // level where angles mechanic activates
const HID_DETAIL_LVL  = 5;   // level where value label hides (only dim shown)
const HID_DIM_LVL     = 9;   // level where all labels hide
const API_URL         = 'https://api.foundteach.com';

/* ─── Types ─────────────────────────────────────────────────────── */
interface GameShape extends ShapeDef { id: string; }

type Phase = 'playing' | 'feedback' | 'level_end' | 'level_failed';

interface LevelRecord { level: number; score: number; rounds: number; date: string; }

interface PlayerProgress {
  name: string;
  totalScore: number;
  highestLevel: number;
  lastLevel: number;
  levels: LevelRecord[];
}

interface GameProps { playerName: string; studentCode: string; }

/* ─── LocalStorage ──────────────────────────────────────────────── */
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

/* ─── API sync (fire & forget) ─────────────────────────────────── */
async function syncToAPI(progress: PlayerProgress, code: string) {
  try {
    await fetch(`${API_URL}/api/game-players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name:         progress.name,
        studentCode:  code,
        totalScore:   progress.totalScore,
        highestLevel: progress.highestLevel,
        lastLevel:    progress.lastLevel,
        roundsPlayed: progress.levels.reduce((s, l) => s + l.rounds, 0),
        levelsData:   progress.levels,
      }),
    });
  } catch { /* offline — localStorage is the source of truth */ }
}

/* ─── Round generator ──────────────────────────────────────────── */
function makeRound(correctInLevel: number, level: number): { board: GameShape[]; target: number } {
  const angleMode = level >= ANGLE_MODE_LVL;
  const complexity = Math.floor(correctInLevel / 3) + Math.floor((level - 1) / 2);
  const numTarget  = Math.min(complexity + 1, 4);

  const targetShapes: GameShape[] = [];
  let target = 0;
  for (let i = 0; i < numTarget; i++) {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    targetShapes.push({ ...s, id: `t-${i}-${Date.now()}-${Math.random()}` });
    target += angleMode ? s.angles : s.value;
  }

  const fillers: GameShape[] = [];
  for (let i = 0; i < 8 - numTarget; i++) {
    const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    fillers.push({ ...s, id: `f-${i}-${Date.now()}-${Math.random()}` });
  }

  return {
    board: [...targetShapes, ...fillers].sort(() => Math.random() - 0.5),
    target,
  };
}

/* ─── Label helper ──────────────────────────────────────────────── */
function getCardLabels(shape: GameShape, level: number) {
  const angleMode = level >= ANGLE_MODE_LVL;
  if (level >= HID_DIM_LVL) return { dim: '', detail: '' };             // level 9+: nothing
  if (level >= HID_DETAIL_LVL) return { dim: shape.dimension, detail: '' };  // 5-8: only 2D/3D

  // 1-4: full detail
  const metricVal  = angleMode ? shape.angles : shape.value;
  const metricName = angleMode
    ? 'ángulos'
    : shape.dimension === '2D' ? 'lados' : 'caras';

  return { dim: shape.dimension, detail: `${metricVal} ${metricName}` };
}

/* ─── Component ─────────────────────────────────────────────────── */
export function Game({ playerName, studentCode }: GameProps) {
  const [level,          setLevel         ] = useState(1);
  const [timeLeft,       setTimeLeft      ] = useState(TIMER_SECONDS);
  const [phase,          setPhase         ] = useState<Phase>('playing');
  const [isPaused,       setIsPaused      ] = useState(false);
  const [feedbackOk,     setFeedbackOk    ] = useState(false);

  const [board,          setBoard         ] = useState<GameShape[]>([]);
  const [target,         setTarget        ] = useState(0);
  const [selected,       setSelected      ] = useState<Set<string>>(new Set());

  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [levelScore,     setLevelScore    ] = useState(0);
  const [totalScore,     setTotalScore    ] = useState(0);
  const [highestLevel,   setHighestLevel  ] = useState(1);

  // Refs for closures
  const correctRef    = useRef(0);
  const levelRef      = useRef(1);
  const levelScoreRef = useRef(0);
  const totalScoreRef = useRef(0);
  const highestRef    = useRef(1);
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown before next level / retry
  const [nextIn, setNextIn] = useState(4);

  const angleMode = level >= ANGLE_MODE_LVL;

  /* ── Load saved progress ──────────────────────────────────────── */
  useEffect(() => {
    const saved = loadProgress(studentCode);
    if (saved) {
      totalScoreRef.current = saved.totalScore;
      highestRef.current    = saved.highestLevel;
      setTotalScore(saved.totalScore);
      setHighestLevel(saved.highestLevel);
      // Restore last level
      const resumeLevel = saved.lastLevel ?? 1;
      levelRef.current = resumeLevel;
      setLevel(resumeLevel);
      const { board: b, target: t } = makeRound(0, resumeLevel);
      setBoard(b);
      setTarget(t);
    } else {
      const { board: b, target: t } = makeRound(0, 1);
      setBoard(b);
      setTarget(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Start a new round ────────────────────────────────────────── */
  const startRound = useCallback((correct: number, lv: number) => {
    const { board: b, target: t } = makeRound(correct, lv);
    setBoard(b);
    setTarget(t);
    setSelected(new Set());
  }, []);

  /* ── Advance / repeat level ───────────────────────────────────── */
  const finishLevel = useCallback((passed: boolean) => {
    const lv   = levelRef.current;
    const newLevel = passed ? lv + 1 : lv;

    // Save progress
    const newTotal   = totalScoreRef.current + levelScoreRef.current;
    const newHighest = Math.max(highestRef.current, lv);
    totalScoreRef.current = newTotal;
    highestRef.current    = newHighest;

    const prev = loadProgress(studentCode) ?? { name: playerName, totalScore: 0, highestLevel: 1, lastLevel: 1, levels: [] };
    const updated: PlayerProgress = {
      name:         playerName,
      totalScore:   newTotal,
      highestLevel: newHighest,
      lastLevel:    newLevel,
      levels: passed
        ? [...prev.levels, { level: lv, score: levelScoreRef.current, rounds: correctRef.current, date: new Date().toLocaleDateString('es-CO') }]
        : prev.levels,
    };
    saveProgress(studentCode, updated);
    void syncToAPI(updated, studentCode);

    setTotalScore(newTotal);
    setHighestLevel(newHighest);

    // Countdown then start
    let count = 4;
    setNextIn(count);
    const id = setInterval(() => {
      count--;
      setNextIn(count);
      if (count <= 0) {
        clearInterval(id);
        // Reset for new level
        correctRef.current    = 0;
        levelScoreRef.current = 0;
        levelRef.current      = newLevel;
        setLevel(newLevel);
        setCorrectInLevel(0);
        setLevelScore(0);
        setTimeLeft(TIMER_SECONDS);
        setIsPaused(false);
        startRound(0, newLevel);
        setPhase('playing');
      }
    }, 1000);
  }, [studentCode, playerName, startRound]);

  /* ── Timer ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'playing' || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          const passed = correctRef.current >= MIN_CORRECT;
          setPhase(passed ? 'level_end' : 'level_failed');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, isPaused]);

  /* ── When level ends ─────────────────────────────────────────── */
  useEffect(() => {
    if (phase === 'level_end')    finishLevel(true);
    if (phase === 'level_failed') finishLevel(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Handle shape click ──────────────────────────────────────── */
  const handleClick = (id: string) => {
    if (phase !== 'playing' || isPaused) return;
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  /* ── Check answer ────────────────────────────────────────────── */
  const checkAnswer = () => {
    if (phase !== 'playing' || isPaused || selected.size === 0) return;

    const sum = Array.from(selected).reduce((acc, id) => {
      const sh = board.find(s => s.id === id);
      return acc + (sh ? (angleMode ? sh.angles : sh.value) : 0);
    }, 0);

    const ok = sum === target;
    setFeedbackOk(ok);
    setPhase('feedback');

    if (ok) {
      const pts  = 10 * level;
      const newC = correctRef.current + 1;
      const newS = levelScoreRef.current + pts;
      correctRef.current    = newC;
      levelScoreRef.current = newS;
      setCorrectInLevel(newC);
      setLevelScore(newS);
    }

    setTimeout(() => {
      setPhase('playing');
      if (ok) {
        startRound(correctRef.current, levelRef.current);
      } else {
        setSelected(new Set());
      }
    }, 1100);
  };

  /* ── Derived ─────────────────────────────────────────────────── */
  const currentSum = Array.from(selected).reduce((a, id) => {
    const sh = board.find(s => s.id === id);
    return a + (sh ? (angleMode ? sh.angles : sh.value) : 0);
  }, 0);

  const timerPct   = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft > 30 ? '#22c55e' : timeLeft > 10 ? '#f59e0b' : '#ef4444';
  const displayTotal = totalScore + levelScore;

  /* ─── Render ─────────────────────────────────────────────────── */
  if (!board.length) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="relative flex flex-col h-full overflow-hidden">

      {/* ── PAUSE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-white rounded-3xl p-7 max-w-sm w-full mx-4 shadow-2xl"
            >
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-black text-slate-800">Estadísticas</h2>
                <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">⏸ PAUSADO</span>
              </div>

              <div className="space-y-2 mb-6">
                {[
                  { icon: '⭐', label: 'Nivel actual',        value: level },
                  { icon: '⏱️', label: 'Tiempo restante',    value: `${timeLeft}s` },
                  { icon: '✅', label: 'Aciertos este nivel', value: correctInLevel },
                  { icon: '⚡', label: `Mínimo para avanzar`, value: `${correctInLevel}/${MIN_CORRECT}` },
                  { icon: '💰', label: 'Puntos este nivel',   value: `+${levelScore}` },
                  { icon: '🏆', label: 'Total acumulado',     value: `${displayTotal} pts` },
                  { icon: '🎯', label: 'Nivel más alto',      value: highestLevel },
                  { icon: angleMode ? '📐' : '📏', label: angleMode ? 'Modo: ángulos' : 'Modo: lados/caras', value: '' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center bg-slate-50 rounded-xl px-3 py-2">
                    <span className="text-sm text-slate-500 font-medium">
                      {row.icon} {row.label}
                    </span>
                    {row.value !== '' && (
                      <span className="font-black text-slate-800 text-sm">{row.value}</span>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsPaused(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-md shadow-indigo-200"
              >
                <Play className="w-4 h-4" />
                Reanudar juego
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LEVEL END overlay ────────────────────────────────────── */}
      <AnimatePresence>
        {(phase === 'level_end' || phase === 'level_failed') && (
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
              {phase === 'level_end' ? (
                <>
                  <div className="text-5xl mb-2">⭐</div>
                  <h2 className="text-2xl font-black text-indigo-900 mb-1">Nivel {level} completado</h2>
                  <p className="text-slate-500 text-sm mb-5">¡Superaste el mínimo!</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-2">⚠️</div>
                  <h2 className="text-2xl font-black text-orange-600 mb-1">¡Inténtalo de nuevo!</h2>
                  <p className="text-slate-500 text-sm mb-5">
                    Necesitas mínimo <strong>{MIN_CORRECT} aciertos</strong> para avanzar.<br />
                    Solo obtuviste <strong>{correctInLevel}</strong>.
                  </p>
                </>
              )}

              <div className="space-y-2 mb-6 text-left">
                <div className="flex justify-between items-center bg-indigo-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Aciertos
                  </span>
                  <span className="font-black text-indigo-700">{correctInLevel} / {MIN_CORRECT} mín.</span>
                </div>
                <div className="flex justify-between items-center bg-yellow-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-yellow-500" /> Este nivel
                  </span>
                  <span className="font-black text-yellow-600">+{levelScore} pts</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm text-slate-500 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-emerald-600" /> Total acumulado
                  </span>
                  <span className="font-black text-emerald-700">{displayTotal} pts</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold text-sm">
                {phase === 'level_end'
                  ? <><ArrowRight className="w-4 h-4" /> Nivel {level + 1} en {nextIn}s...</>
                  : <><RefreshCw className="w-4 h-4" /> Repitiendo nivel {level} en {nextIn}s...</>
                }
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FEEDBACK flash ───────────────────────────────────────── */}
      <AnimatePresence>
        {phase === 'feedback' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 z-40 pointer-events-none flex items-center justify-center
              ${feedbackOk ? 'bg-emerald-400' : 'bg-red-400'}`}
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
              {feedbackOk
                ? <CheckCircle2 className="w-20 h-20 text-white" strokeWidth={2.5} />
                : <XCircle     className="w-20 h-20 text-white" strokeWidth={2.5} />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN GAME LAYOUT ─────────────────────────────────────── */}
      <div className="flex flex-col h-full p-3 sm:p-4 gap-2 sm:gap-3">

        {/* Row 1: Level · Timer · Score · Pause */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* Level badge */}
          <div className="flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-1.5 font-bold text-xs sm:text-sm shrink-0">
            <Star className="w-3 h-3 fill-indigo-700" />
            Nv.{level}
          </div>

          {/* Timer */}
          <Clock className="w-4 h-4 shrink-0 transition-colors" style={{ color: timerColor }} />
          <div className="flex-1 h-2.5 sm:h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: timerColor }}
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <span className="text-xs sm:text-sm font-black w-6 text-right tabular-nums" style={{ color: timerColor }}>
            {timeLeft}
          </span>

          {/* Score */}
          <div className="flex items-center gap-1 shrink-0 ml-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="font-black text-slate-800 text-sm tabular-nums">{displayTotal}</span>
          </div>

          {/* Pause button */}
          <button
            onClick={() => setIsPaused(p => !p)}
            title="Pausar / Ver estadísticas"
            className="ml-1 shrink-0 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-indigo-100 rounded-full transition-colors"
          >
            <Pause className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>

        {/* Progress bar: correctInLevel toward MIN_CORRECT */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">
            Aciertos: {correctInLevel}/{MIN_CORRECT}
          </span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              animate={{ width: `${Math.min((correctInLevel / MIN_CORRECT) * 100, 100)}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {correctInLevel >= MIN_CORRECT && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-[10px] text-emerald-600 font-bold shrink-0"
            >
              ✓ Listo
            </motion.span>
          )}
        </div>

        {/* Row 2: Target number */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 bg-indigo-50 rounded-2xl px-4 py-2.5">
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              {angleMode ? '🔺 Número de ángulos objetivo' : 'Número objetivo'}
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
          <div className="text-[10px] sm:text-xs text-slate-500 leading-relaxed max-w-[180px] text-right">
            {angleMode
              ? 'Suma los ángulos/vértices de las figuras seleccionadas.'
              : 'Selecciona figuras 2D (lados) o 3D (caras) que sumen el número.'}
            <br />
            <span className="text-indigo-500 font-semibold">+{10 * level} pts por acierto</span>
          </div>
        </div>

        {/* Row 3: Shape grid */}
        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 h-full">
            <AnimatePresence mode="popLayout">
              {board.map(shape => {
                const isSel = selected.has(shape.id);
                const { dim, detail } = getCardLabels(shape, level);
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
                      transition-all duration-200 gap-0.5
                      ${isSel
                        ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-200'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                      }
                    `}
                  >
                    <ShapeIcon
                      type={shape.type}
                      className={`w-7 h-7 sm:w-11 sm:h-11 ${dim ? 'mb-1' : ''} ${isSel ? 'text-indigo-600' : 'text-slate-500'}`}
                    />
                    {dim && (
                      <span className="text-[9px] sm:text-[11px] font-bold text-slate-700 text-center leading-tight px-1">
                        {shape.name}
                      </span>
                    )}
                    {detail && (
                      <span className="text-[8px] sm:text-[10px] text-slate-400 leading-tight">
                        {dim} · {detail}
                      </span>
                    )}
                    {dim && !detail && (
                      <span className={`text-[8px] sm:text-[10px] font-semibold ${isSel ? 'text-indigo-500' : 'text-slate-400'}`}>
                        {dim}
                      </span>
                    )}
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
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              {angleMode ? 'Ángulos:' : 'Suma:'}
            </span>
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
            disabled={selected.size === 0 || phase !== 'playing' || isPaused}
            className={`
              px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all
              ${selected.size === 0 || phase !== 'playing' || isPaused
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
