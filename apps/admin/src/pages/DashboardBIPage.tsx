import { useState, useEffect, type ReactNode } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/bi`;
const token = () => localStorage.getItem('foundteach_token') ?? '';
const fmt = (n: number) => n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

interface Metrics { totalClients: number; totalProjects: number; openTickets: number; totalEmployees: number; publishedCourses: number; totalEnrollments: number; pendingInvoices: number; revenueThisMonth: number; }
interface FinanceMonth { month: string; revenue: number; expenses: number; }
interface Finance { months: FinanceMonth[]; totalRevenue: number; totalExpenses: number; margin: number; }
interface Sales { totalClients: number; activeClients: number; totalQuotes: number; acceptedQuotes: number; conversionRate: number; pendingInvoices: number; paidInvoices: number; totalRevenue: number; }
interface Ops { totalProjects: number; activeProjects: number; taskVelocity: number; openTickets: number; criticalTickets: number; totalRepos: number; }
interface Edu { totalCourses: number; publishedCourses: number; totalEnrollments: number; completionRate: number; avgProgress: number; }
interface Hcm { totalEmployees: number; activeEmployees: number; pendingPayroll: number; pendingAmount: number; paidAmount: number; }
interface Alert { type: string; severity: string; message: string; count?: number; }

const SEV_I: Record<string, { icon: ReactNode; color: string; bg: string }> = {
  critical: { icon: <AlertTriangle size={15} />, color: '#ef4444', bg: '#ef444422' },
  warning:  { icon: <AlertTriangle size={15} />, color: '#f59e0b', bg: '#f59e0b22' },
  info:     { icon: <Info size={15} />,           color: '#60a5fa', bg: '#60a5fa22' },
  success:  { icon: <CheckCircle size={15} />,    color: '#10b981', bg: '#10b98122' },
};

export function DashboardBIPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [finance, setFinance] = useState<Finance | null>(null);
  const [sales, setSales]     = useState<Sales | null>(null);
  const [ops, setOps]         = useState<Ops | null>(null);
  const [edu, setEdu]         = useState<Edu | null>(null);
  const [hcm, setHcm]         = useState<Hcm | null>(null);
  const [alerts, setAlerts]   = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const h = { headers: { Authorization: `Bearer ${token()}` } };
        const [mR, fR, sR, oR, eR, hR, aR] = await Promise.all([
          fetch(`${BASE}/metrics`, h), fetch(`${BASE}/finance`, h), fetch(`${BASE}/sales`, h),
          fetch(`${BASE}/ops`, h), fetch(`${BASE}/edu`, h), fetch(`${BASE}/hcm`, h), fetch(`${BASE}/alerts`, h),
        ]);
        if (mR.ok) setMetrics(await mR.json());
        if (fR.ok) setFinance(await fR.json());
        if (sR.ok) setSales(await sR.json());
        if (oR.ok) setOps(await oR.json());
        if (eR.ok) setEdu(await eR.json());
        if (hR.ok) setHcm(await hR.json());
        if (aR.ok) setAlerts(await aR.json());
      } finally { setLoading(false); }
    };
    void load();
  }, []);

  const maxBar = finance ? Math.max(...finance.months.flatMap(m => [m.revenue, m.expenses]), 1) : 1;

  const kpis = metrics ? [
    { label: 'Ingresos este mes', value: fmt(metrics.revenueThisMonth), color: '#10b981', icon: '💰', sub: `${metrics.pendingInvoices} facturas pendientes` },
    { label: 'Proyectos activos', value: metrics.totalProjects, color: '#818cf8', icon: '📂', sub: 'en progreso' },
    { label: 'Clientes', value: metrics.totalClients, color: '#60a5fa', icon: '🤝', sub: 'registrados en CRM' },
    { label: 'Empleados', value: metrics.totalEmployees, color: '#f59e0b', icon: '👥', sub: 'activos en RRHH' },
    { label: 'Cursos publicados', value: metrics.publishedCourses, color: '#34d399', icon: '📚', sub: `${metrics.totalEnrollments} matrículas` },
    { label: 'Tickets abiertos', value: metrics.openTickets, color: metrics.openTickets > 5 ? '#ef4444' : '#94a3b8', icon: '🎫', sub: 'sin cerrar' },
  ] : [];

  const sectorCards = [
    {
      title: '💰 Ventas & CRM', color: '#10b981',
      items: sales ? [
        { label: 'Clientes activos', value: sales.activeClients },
        { label: 'Tasa de conversión', value: `${sales.conversionRate}%` },
        { label: 'Facturas pagadas', value: sales.paidInvoices },
        { label: 'Revenue total', value: fmt(sales.totalRevenue) },
      ] : [],
      bar: sales?.conversionRate,
    },
    {
      title: '⚙️ Operaciones', color: '#818cf8',
      items: ops ? [
        { label: 'Proyectos activos', value: ops.activeProjects },
        { label: 'Velocidad tareas', value: `${ops.taskVelocity}%` },
        { label: 'Tickets críticos', value: ops.criticalTickets },
        { label: 'Repositorios', value: ops.totalRepos },
      ] : [],
      bar: ops?.taskVelocity,
    },
    {
      title: '📚 Educación', color: '#34d399',
      items: edu ? [
        { label: 'Cursos publicados', value: edu.publishedCourses },
        { label: 'Matrículas', value: edu.totalEnrollments },
        { label: 'Tasa completación', value: `${edu.completionRate}%` },
        { label: 'Progreso prom.', value: `${edu.avgProgress}%` },
      ] : [],
      bar: edu?.completionRate,
    },
    {
      title: '👥 Talento Humano', color: '#f59e0b',
      items: hcm ? [
        { label: 'Empleados activos', value: hcm.activeEmployees },
        { label: 'Nómina pendiente', value: hcm.pendingPayroll },
        { label: 'Por pagar', value: fmt(hcm.pendingAmount) },
        { label: 'Ya pagado', value: fmt(hcm.paidAmount) },
      ] : [],
      bar: hcm && (hcm.paidAmount + hcm.pendingAmount) > 0
        ? Math.round((hcm.paidAmount / (hcm.paidAmount + hcm.pendingAmount)) * 100)
        : 0,
    },
  ];

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            📊 Dashboard Ejecutivo
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Vista 360° de FoundTeach · {new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', borderRadius: '8px', padding: '8px 14px', border: '1px solid #334155' }}>
          <TrendingUp size={16} color='#10b981' />
          <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>Live</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📡</div>
          <p>Cargando datos del sistema...</p>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px', marginBottom: '24px' }}>
            {kpis.map(k => (
              <div key={k.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: `1px solid ${k.color}33`, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '10px', right: '12px', fontSize: '1.6rem', opacity: 0.12 }}>{k.icon}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: k.color }}>{k.value}</div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', marginTop: '3px' }}>{k.label}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{k.sub}</div>
                <div style={{ height: '2px', background: k.color + '33', borderRadius: '999px', marginTop: '10px' }}>
                  <div style={{ height: '100%', width: '100%', background: k.color, borderRadius: '999px', boxShadow: `0 0 6px ${k.color}` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Finance Chart + Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', marginBottom: '24px' }}>
            {/* Bar chart */}
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: 600 }}>📈 Ingresos vs. Gastos — Últimos 6 meses</span>
                {finance && (
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                    <span style={{ color: '#10b981' }}>■ Ingresos {fmt(finance.totalRevenue)}</span>
                    <span style={{ color: '#ef4444' }}>■ Gastos {fmt(finance.totalExpenses)}</span>
                    <span style={{ color: finance.margin >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>Margen {finance.margin}%</span>
                  </div>
                )}
              </div>
              {finance && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', height: '160px' }}>
                  {finance.months.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', flex: 1, width: '100%', justifyContent: 'center' }}>
                        <div title={`Ingresos: ${fmt(m.revenue)}`} style={{ width: '14px', height: `${Math.round((m.revenue / maxBar) * 130) + 2}px`, background: '#10b981', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                        <div title={`Gastos: ${fmt(m.expenses)}`} style={{ width: '14px', height: `${Math.round((m.expenses / maxBar) * 130) + 2}px`, background: '#ef4444', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center' }}>{m.month}</span>
                    </div>
                  ))}
                </div>
              )}
              {!finance && <div style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>Sin datos financieros.</div>}
            </div>

            {/* Alerts */}
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px' }}>
              <div style={{ fontWeight: 600, marginBottom: '14px' }}>🚨 Alertas Inteligentes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {alerts.map((a, i) => {
                  const s = SEV_I[a.severity] ?? SEV_I.info;
                  return (
                    <div key={i} style={{ background: s.bg, border: `1px solid ${s.color}33`, borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: s.color, flexShrink: 0 }}>{s.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{a.message}</div>
                        {a.count && <div style={{ fontSize: '0.72rem', color: s.color }}>{a.count} registros</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sector cards grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '14px' }}>
            {sectorCards.map(card => (
              <div key={card.title} style={{ background: '#1e293b', borderRadius: '12px', border: `1px solid ${card.color}33`, padding: '18px' }}>
                <div style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.9rem' }}>{card.title}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  {card.items.map(item => (
                    <div key={item.label} style={{ background: '#0f172a', borderRadius: '6px', padding: '8px 10px' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: card.color }}>{item.value}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
                {card.bar != null && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginBottom: '4px' }}>
                      <span>Rendimiento</span><span style={{ color: card.color }}>{card.bar}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#334155', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${card.bar}%`, background: card.color, borderRadius: '999px', transition: 'width 0.5s', boxShadow: `0 0 8px ${card.color}66` }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
