'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Heart, Zap, Shield, Coins, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CharacterSummary {
  character: {
    id: string;
    nombre: string;
    monedas: number;
    vidas: number;
    xp: number;
    escudoRacha: boolean;
    xpBoostCharges: number;
  };
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const PRODUCTOS = [
  {
    id: 'vida_1',
    nombre: 'Recuperar 1 Vida',
    descripcion: 'Restaura un corazón perdido para seguir jugando.',
    emoji: '❤️',
    precio: 10,
    cantidad: 1,
    color: 'from-red-400 to-pink-500',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
  },
  {
    id: 'vida_3',
    nombre: 'Recuperar 3 Vidas',
    descripcion: 'Restaura tres corazones de una sola vez. ¡Oferta!',
    emoji: '💖',
    precio: 25,
    cantidad: 3,
    color: 'from-pink-400 to-rose-500',
    borderColor: 'border-pink-200',
    bgColor: 'bg-pink-50',
    badge: '¡Oferta!',
  },
  {
    id: 'vidas_max',
    nombre: 'Llenar Vidas',
    descripcion: 'Recupera todas tus vidas hasta el máximo (5 corazones).',
    emoji: '💝',
    precio: 40,
    cantidad: 5,
    color: 'from-purple-400 to-violet-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    badge: 'Más popular',
  },
  {
    id: 'escudo_racha',
    nombre: 'Escudo de Racha',
    descripcion: 'Evita perder una vida si te equivocas (1 uso).',
    emoji: '🛡️',
    precio: 30,
    color: 'from-teal-400 to-emerald-500',
    borderColor: 'border-teal-200',
    bgColor: 'bg-teal-50',
    badge: 'Nuevo',
  },
  {
    id: 'xp_x2',
    nombre: 'XP x2',
    descripcion: 'Duplica los puntos de experiencia en 10 decisiones.',
    emoji: '⚡',
    precio: 50,
    color: 'from-yellow-400 to-amber-500',
    borderColor: 'border-yellow-200',
    bgColor: 'bg-yellow-50',
    badge: 'Nuevo',
  },
];

export default function TiendaPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const [summary, setSummary] = useState<CharacterSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/api/rdv/progress/${characterId}/summary`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSummary(data);
    } catch {
      console.error('Error cargando el resumen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [characterId]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  };

  const handleComprar = async (producto: typeof PRODUCTOS[0]) => {
    if (!summary) return;
    if (summary.character.monedas < producto.precio) {
      showToast(`No tienes suficientes monedas. Necesitas ${producto.precio} 🪙`, 'error');
      return;
    }
    if (producto.id.startsWith('vida') && summary.character.vidas >= 5) {
      showToast('¡Ya tienes todas las vidas al máximo! ❤️', 'error');
      return;
    }
    if (producto.id === 'escudo_racha' && summary.character.escudoRacha) {
      showToast('¡Ya tienes un escudo activo! 🛡️', 'error');
      return;
    }

    setBuying(producto.id);
    try {
      const res = await fetch(`${API_URL}/api/rdv/progress/comprar-item`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterId, itemId: producto.id }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Error al comprar');
      }

      showToast(`¡Compra exitosa! +${producto.cantidad} ❤️`, 'success');
      await fetchSummary();
    } catch (err) {
      showToast((err as Error).message || 'Error al realizar la compra', 'error');
    } finally {
      setBuying(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FF005A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl font-bold shadow-xl flex items-center gap-3
              ${toast.type === 'success' ? 'bg-[#58CC02] text-white' : 'bg-[#FF4B4B] text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <span>⚠️</span>}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push(`/simulacion/${characterId}`)}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#FF005A]" />
            <h1 className="text-2xl font-bold text-slate-800">Tienda</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            {/* Poderes activos */}
            <div className="flex gap-2">
              {summary?.character.escudoRacha && (
                <div className="bg-teal-50 border-2 border-teal-200 text-teal-600 rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 shadow-sm" title="Escudo Activo">
                  🛡️ Escudo
                </div>
              )}
              {(summary?.character.xpBoostCharges ?? 0) > 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 text-yellow-600 rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 shadow-sm" title="Doble XP Activo">
                  ⚡ {summary?.character.xpBoostCharges}
                </div>
              )}
            </div>
            {/* Monedas */}
            <div className="flex items-center gap-2 bg-sky-50 border-2 border-sky-200 rounded-2xl px-4 py-2">
              <span className="text-xl">🪙</span>
              <span className="font-bold text-sky-600 text-lg">{summary?.character.monedas ?? 0}</span>
            </div>
            {/* Vidas */}
            <div className="flex items-center gap-1 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`text-xl ${i < (summary?.character.vidas ?? 0) ? '' : 'grayscale opacity-30'}`}>❤️</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">

        {/* Banner informativo */}
        <div className="bg-gradient-to-r from-[#FF005A] to-[#FF96CB] rounded-2xl p-6 text-white mb-8 flex items-center gap-4 shadow-lg">
          <div className="text-5xl">🏪</div>
          <div>
            <h2 className="text-xl font-bold">Gana monedas tomando decisiones</h2>
            <p className="text-white/80 mt-1">Cada decisión te da +5 🪙. Úsalas para recuperar tus vidas y seguir avanzando.</p>
          </div>
        </div>

        {/* Categoría: Catálogo Principal */}
        <h2 className="text-xl font-bold text-slate-700 mb-4 flex items-center gap-2 mt-8">
          <Heart className="w-5 h-5 text-red-500" />
          Catálogo
        </h2>

        <div className="space-y-4 mb-10">
          {PRODUCTOS.map((producto) => {
            const sinMonedas = (summary?.character.monedas ?? 0) < producto.precio;
            let maxed = false;
            if (producto.id.startsWith('vida') && (summary?.character.vidas ?? 0) >= 5) maxed = true;
            if (producto.id === 'escudo_racha' && summary?.character.escudoRacha) maxed = true;

            const noDisponible = sinMonedas || maxed;

            return (
              <motion.div
                key={producto.id}
                whileHover={{ y: -2 }}
                className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 shadow-sm transition-all
                  ${noDisponible ? 'opacity-60' : producto.borderColor}
                `}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${producto.color} flex items-center justify-center text-3xl shrink-0 shadow-md`}>
                  {producto.emoji}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800 text-lg">{producto.nombre}</h3>
                    {producto.badge && (
                      <span className="px-2 py-0.5 bg-[#FF005A] text-white text-xs font-bold rounded-full">
                        {producto.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm">{producto.descripcion}</p>
                </div>
                <button
                  onClick={() => handleComprar(producto)}
                  disabled={noDisponible || buying === producto.id}
                  className={`shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-base transition-all
                    ${noDisponible
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FF005A] text-white hover:bg-[#D9004C] shadow-[0_4px_0_#B8003F] active:translate-y-1 active:shadow-none'
                    }
                  `}
                >
                  {buying === producto.id ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>
                      <span>🪙</span>
                      <span>{producto.precio}</span>
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
