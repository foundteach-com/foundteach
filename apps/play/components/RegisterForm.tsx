'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Hash, ArrowRight, BookOpen } from 'lucide-react';

interface RegisterFormProps {
  onRegister: (name: string, studentCode: string) => void;
}

export function RegisterForm({ onRegister }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [errors, setErrors] = useState<{ name?: string; studentCode?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { name?: string; studentCode?: string } = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Ingresa tu nombre completo (mínimo 2 caracteres).';
    }
    if (!studentCode.trim() || studentCode.trim().length < 3) {
      newErrors.studentCode = 'Ingresa tu código estudiantil (mínimo 3 caracteres).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    // Small delay to show the animation
    setTimeout(() => {
      onRegister(name.trim(), studentCode.trim().toUpperCase());
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo/Icon area */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-300 mb-5"
          >
            <BookOpen className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-black text-indigo-900 tracking-tight"
          >
            GeoMath Match
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-500 mt-2 text-base leading-relaxed"
          >
            Aprende geometría de manera divertida. <br />
            Antes de jugar, identifícate.
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 p-8"
        >
          <h2 className="text-lg font-bold text-slate-700 mb-6">
            ¡Hola! ¿Quién va a jugar hoy?
          </h2>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Nombre */}
            <div>
              <label
                htmlFor="player-name"
                className="block text-sm font-semibold text-slate-600 mb-1.5"
              >
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <User className={`w-4.5 h-4.5 ${errors.name ? 'text-red-400' : 'text-slate-400'}`} />
                </div>
                <input
                  id="player-name"
                  type="text"
                  autoComplete="given-name"
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Ej: María González"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl border-2 font-medium text-slate-800
                    placeholder:text-slate-300 placeholder:font-normal
                    outline-none transition-all duration-200 text-sm
                    ${errors.name
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white focus:shadow-sm focus:shadow-indigo-100'
                    }
                  `}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Código Estudiantil */}
            <div>
              <label
                htmlFor="student-code"
                className="block text-sm font-semibold text-slate-600 mb-1.5"
              >
                Código estudiantil
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <Hash className={`w-4.5 h-4.5 ${errors.studentCode ? 'text-red-400' : 'text-slate-400'}`} />
                </div>
                <input
                  id="student-code"
                  type="text"
                  autoComplete="off"
                  value={studentCode}
                  onChange={e => {
                    setStudentCode(e.target.value);
                    if (errors.studentCode) setErrors(prev => ({ ...prev, studentCode: undefined }));
                  }}
                  placeholder="Ej: 2024-001"
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl border-2 font-mono font-medium text-slate-800
                    placeholder:text-slate-300 placeholder:font-normal
                    outline-none transition-all duration-200 text-sm uppercase tracking-wider
                    ${errors.studentCode
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-slate-200 bg-slate-50 focus:border-indigo-400 focus:bg-white focus:shadow-sm focus:shadow-indigo-100'
                    }
                  `}
                />
              </div>
              {errors.studentCode && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.studentCode}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`
                w-full flex items-center justify-center gap-2.5
                py-3.5 px-6 rounded-xl font-bold text-base
                transition-all duration-300 shadow-md mt-2
                ${isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed shadow-none text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Entrando al juego...
                </>
              ) : (
                <>
                  ¡Comenzar a jugar!
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-slate-400 mt-5"
        >
          🔒 Tu información se usa solo para identificarte en el juego.
        </motion.p>
      </motion.div>
    </div>
  );
}
