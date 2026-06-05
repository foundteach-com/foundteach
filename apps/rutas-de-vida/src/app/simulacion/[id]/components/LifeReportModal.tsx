import { motion } from 'framer-motion';
import { Trophy, FileText, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { API_URL } from '../../../../utils/constants';

interface LifeReportModalProps {
  characterId: string;
  onClose: () => void;
}

export function LifeReportModal({ characterId, onClose }: LifeReportModalProps) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/rdv/progress/${characterId}/report`)
      .then(res => res.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [characterId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="bg-gradient-to-r from-purple-600 to-[#FF005A] p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <h2 className="font-display font-bold text-2xl">Informe de Desarrollo Humano</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Analizando tu trayectoria de vida...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg">
                  {report.reporteNarrativo}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Puntuación Final</p>
                  <p className="text-3xl font-display font-bold text-slate-800">A+</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
                  <p className="text-sm font-bold text-slate-500 mb-2">Desglose:</p>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                    <div className="bg-[#00E1FF] h-full" style={{ width: `${report.finalStats.cognitivo}%` }} />
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex mt-2">
                    <div className="bg-[#FF96CB] h-full" style={{ width: `${report.finalStats.afectivo}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-red-500 font-bold py-8">Error al cargar el reporte.</p>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#FF005A] hover:bg-[#E0004F] text-white font-bold text-lg rounded-2xl shadow-[0_4px_0_#D9004C] active:translate-y-1 active:shadow-none transition-all"
          >
            Cerrar Informe
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
