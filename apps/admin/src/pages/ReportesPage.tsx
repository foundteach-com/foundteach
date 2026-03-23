import { useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/bi`;
const token = () => localStorage.getItem('foundteach_token') ?? '';
const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Number(n).toLocaleString('es-CO')}`;

interface ReportDef { id: string; title: string; icon: string; description: string; color: string; endpoint: string; }
const REPORTS: ReportDef[] = [
  { id: 'finance', title: 'Reporte Financiero',  icon: '💰', description: 'Ingresos, gastos, margen y tendencia de 6 meses.', color: '#10b981', endpoint: 'finance' },
  { id: 'sales',   title: 'Reporte de Ventas',   icon: '🎯', description: 'Pipeline CRM, cotizaciones y facturación.', color: '#818cf8', endpoint: 'sales' },
  { id: 'edu',     title: 'Reporte Educativo',   icon: '📚', description: 'Cursos, matrículas, tasa de completación.', color: '#34d399', endpoint: 'edu' },
  { id: 'hcm',     title: 'Reporte de RRHH',     icon: '👥', description: 'Empleados activos, nómina pendiente y pagada.', color: '#f59e0b', endpoint: 'hcm' },
];

type ReportData = Record<string, unknown>;

function kpiRows(id: string, data: ReportData): { label: string; value: string; color: string }[] {
  if (id === 'finance') {
    const f = data as { totalRevenue: number; totalExpenses: number; margin: number; months: unknown[] };
    return [
      { label: 'Ingresos totales', value: fmt(f.totalRevenue), color: '#10b981' },
      { label: 'Gastos totales', value: fmt(f.totalExpenses), color: '#ef4444' },
      { label: 'Margen neto', value: `${f.margin}%`, color: f.margin >= 0 ? '#10b981' : '#ef4444' },
      { label: 'Meses analizados', value: String(f.months?.length ?? 0), color: '#94a3b8' },
    ];
  }
  if (id === 'sales') {
    const s = data as { totalClients: number; activeClients: number; conversionRate: number; paidInvoices: number; pendingInvoices: number; totalRevenue: number };
    return [
      { label: 'Clientes totales', value: String(s.totalClients), color: '#818cf8' },
      { label: 'Activos', value: String(s.activeClients), color: '#60a5fa' },
      { label: 'Tasa de conv.', value: `${s.conversionRate}%`, color: '#818cf8' },
      { label: 'Revenue total', value: fmt(s.totalRevenue), color: '#10b981' },
      { label: 'Facturas pagadas', value: String(s.paidInvoices), color: '#10b981' },
      { label: 'Facturas pendientes', value: String(s.pendingInvoices), color: '#f59e0b' },
    ];
  }
  if (id === 'edu') {
    const e = data as { totalCourses: number; publishedCourses: number; totalEnrollments: number; completedEnrollments: number; completionRate: number; avgProgress: number; totalAssessments: number };
    return [
      { label: 'Cursos totales', value: String(e.totalCourses), color: '#34d399' },
      { label: 'Publicados', value: String(e.publishedCourses), color: '#10b981' },
      { label: 'Matrículas', value: String(e.totalEnrollments), color: '#34d399' },
      { label: 'Completados', value: String(e.completedEnrollments), color: '#10b981' },
      { label: 'Tasa completación', value: `${e.completionRate}%`, color: '#34d399' },
      { label: 'Progreso promedio', value: `${e.avgProgress}%`, color: '#34d399' },
    ];
  }
  if (id === 'hcm') {
    const h = data as { totalEmployees: number; activeEmployees: number; pendingPayroll: number; paidPayroll: number; pendingAmount: number; paidAmount: number; openReviews: number };
    return [
      { label: 'Empleados totales', value: String(h.totalEmployees), color: '#f59e0b' },
      { label: 'Activos', value: String(h.activeEmployees), color: '#10b981' },
      { label: 'Nómina pendiente', value: String(h.pendingPayroll), color: '#f59e0b' },
      { label: 'Nómina pagada', value: String(h.paidPayroll), color: '#10b981' },
      { label: 'Por pagar', value: fmt(h.pendingAmount), color: '#f59e0b' },
      { label: 'Ya pagado', value: fmt(h.paidAmount), color: '#10b981' },
    ];
  }
  return [];
}

function tableRows(id: string, data: ReportData): { cols: string[]; rows: string[][] } | null {
  if (id === 'finance') {
    const f = data as { months: { month: string; revenue: number; expenses: number }[] };
    return {
      cols: ['Mes', 'Ingresos', 'Gastos', 'Balance'],
      rows: (f.months ?? []).map(m => [m.month, fmt(m.revenue), fmt(m.expenses), fmt(m.revenue - m.expenses)]),
    };
  }
  if (id === 'sales') {
    const s = data as { pipeline: { stage: string; count: number }[] };
    return {
      cols: ['Etapa del pipeline', 'Cantidad de clientes'],
      rows: (s.pipeline ?? []).map(p => [p.stage, String(p.count)]),
    };
  }
  return null;
}

export function ReportesPage() {
  const [generated, setGenerated] = useState<Record<string, ReportData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const generate = async (r: ReportDef) => {
    setLoading(p => ({ ...p, [r.id]: true }));
    try {
      const res = await fetch(`${BASE}/${r.endpoint}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) {
        const json = await res.json() as ReportData;
        setGenerated(p => ({ ...p, [r.id]: json }));
      }
    } finally { setLoading(p => ({ ...p, [r.id]: false })); }
  };

  const exportJson = (id: string, data: ReportData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `reporte-${id}-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
          📋 Reportes Automáticos
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Genera reportes on-demand de cada área del negocio</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {REPORTS.map(r => {
          const data = generated[r.id];
          const isLoading = loading[r.id];
          const table = data ? tableRows(r.id, data) : null;
          const kpis = data ? kpiRows(r.id, data) : [];

          return (
            <div key={r.id} style={{ background: '#1e293b', borderRadius: '14px', border: `1px solid ${r.color}33`, overflow: 'hidden' }}>
              {/* Report header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 22px', borderBottom: data ? '1px solid #334155' : 'none' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: r.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>{r.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{r.description}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {data && (
                    <button onClick={() => exportJson(r.id, data)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#334155', border: 'none', color: '#94a3b8', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '0.8rem' }}>
                      <Download size={14} /> Exportar
                    </button>
                  )}
                  <button onClick={() => void generate(r)} disabled={isLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg, ${r.color}, ${r.color}99)`, border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', opacity: isLoading ? 0.7 : 1 }}>
                    <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
                    {data ? 'Regenerar' : 'Generar'}
                  </button>
                </div>
              </div>

              {isLoading && (
                <div style={{ textAlign: 'center', color: r.color, padding: '24px', fontSize: '0.875rem' }}>
                  ⏳ Generando reporte...
                </div>
              )}

              {data && !isLoading && (
                <div style={{ padding: '18px 22px' }}>
                  {/* KPI Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: table ? '18px' : 0 }}>
                    {kpis.map(k => (
                      <div key={k.label} style={{ background: '#0f172a', borderRadius: '8px', padding: '10px 14px', border: `1px solid ${k.color}33` }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Detail table */}
                  {table && table.rows.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: '#0f172a' }}>
                            {table.cols.map(c => <th key={c} style={{ padding: '9px 12px', textAlign: 'left', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{c}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, i) => (
                            <tr key={i} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff04' }}>
                              {row.map((cell, j) => (
                                <td key={j} style={{ padding: '8px 12px', color: j === 0 ? '#e2e8f0' : '#94a3b8' }}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
