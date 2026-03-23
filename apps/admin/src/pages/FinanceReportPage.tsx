import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

interface CashflowMonth { label: string; income: number; expense: number; }
interface CategoryItem { category: string; amount: number; }

interface Report {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  monthIncome: number;
  monthExpense: number;
  monthNet: number;
  pendingReceivable: number;
  pendingPayable: number;
  cashflow: CashflowMonth[];
  expenseByCategory: CategoryItem[];
}

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

export function FinanceReportPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/finance/report`, { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then((data: Report | null) => { if (data) setReport(data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando reporte...</div>;

  const maxFlow = report ? Math.max(...report.cashflow.map(m => Math.max(m.income, m.expense)), 1) : 1;
  const maxCat = report ? Math.max(...report.expenseByCategory.map(c => c.amount), 1) : 1;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Reportes Financieros</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Resumen acumulado y flujo de caja de FoundTeach.
        </p>
      </div>

      {!report || (report.totalIncome === 0 && report.totalExpense === 0) ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)', background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <p style={{ fontWeight: 600 }}>Aún no hay transacciones</p>
          <p style={{ fontSize: '0.875rem' }}>Registra ingresos y gastos para ver el reporte aquí.</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Ingresos del mes', value: report.monthIncome, color: '#059669', icon: <TrendingUp size={20} />, sub: `Total acumulado: ${fmt(report.totalIncome)}` },
              { label: 'Gastos del mes', value: report.monthExpense, color: '#ef4444', icon: <TrendingDown size={20} />, sub: `Total acumulado: ${fmt(report.totalExpense)}` },
              { label: 'Utilidad del mes', value: report.monthNet, color: report.monthNet >= 0 ? '#2563eb' : '#ef4444', icon: <DollarSign size={20} />, sub: `Utilidad total: ${fmt(report.netProfit)}` },
            ].map(c => (
              <div key={c.label} style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '22px 24px', borderTop: `3px solid ${c.color}` }}>
                <div style={{ color: c.color, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: c.color, marginBottom: 4 }}>{fmt(c.value)}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.sub}</div>
              </div>
            ))}
          </div>

          {/* Pending invoices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '18px 22px', borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Por Cobrar (pendiente)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{fmt(report.pendingReceivable)}</div>
            </div>
            <div style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '18px 22px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Por Pagar (pendiente)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{fmt(report.pendingPayable)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Cashflow chart */}
            <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 28 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 24 }}>Flujo de caja — últimos 6 meses</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160 }}>
                {report.cashflow.map(m => (
                  <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 130 }}>
                      <div style={{ flex: 1, background: '#059669', borderRadius: '4px 4px 0 0', height: `${(m.income / maxFlow) * 100}%`, minHeight: m.income > 0 ? 4 : 0, transition: 'height 0.5s ease' }} title={`Ingreso: ${fmt(m.income)}`} />
                      <div style={{ flex: 1, background: '#ef4444', borderRadius: '4px 4px 0 0', height: `${(m.expense / maxFlow) * 100}%`, minHeight: m.expense > 0 ? 4 : 0, transition: 'height 0.5s ease' }} title={`Gasto: ${fmt(m.expense)}`} />
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>{m.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 16, justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#059669' }} /> Ingresos
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ef4444' }} /> Gastos
                </div>
              </div>
            </div>

            {/* Expenses by category */}
            <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 28 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Gastos por categoría</h3>
              {report.expenseByCategory.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin gastos registrados.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {report.expenseByCategory.slice(0, 7).map(c => (
                    <div key={c.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{c.category}</span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ef4444' }}>{fmt(c.amount)}</span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border-color)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${(c.amount / maxCat) * 100}%`, height: '100%', background: '#ef4444', borderRadius: 4, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
