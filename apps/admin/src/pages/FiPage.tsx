import { useState, useEffect } from 'react';
import { 
  Banknote, LineChart, FileText, Plus, 
  ArrowUpRight, ArrowDownRight, Wallet 
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  ASSET: 'Activo',
  LIABILITY: 'Pasivo',
  EQUITY: 'Patrimonio',
  REVENUE: 'Ingreso',
  EXPENSE: 'Gasto',
};

const ACCOUNT_TYPE_COLORS: Record<string, string> = {
  ASSET: '#059669',     // Emerald
  LIABILITY: '#dc2626', // Red
  EQUITY: '#7c3aed',    // Violet
  REVENUE: '#2563eb',   // Blue
  EXPENSE: '#d97706',   // Amber
};

export function FiPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'journals' | 'reports'>('dashboard');
  const [stats, setStats] = useState({ totalAccounts: 0, totalEntries: 0, totalRevenue: 0, totalExpense: 0 });
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/fi/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Error loading FI stats:', e);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const netIncome = (stats.totalRevenue || 0) - (stats.totalExpense || 0);

  return (
    <div style={{ padding: '4px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Finanzas</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Contabilidad, libros mayores y flujo de caja</p>
        </div>
        <button style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
          <Plus size={18} /> Nuevo Asiento
        </button>
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Utilidad Neta', value: `$${netIncome.toLocaleString()}`, color: netIncome >= 0 ? '#059669' : '#dc2626', icon: <Wallet size={18} /> },
          { label: 'Ingresos', value: `$${stats.totalRevenue.toLocaleString()}`, color: '#2563eb', icon: <ArrowUpRight size={18} /> },
          { label: 'Gastos', value: `$${stats.totalExpense.toLocaleString()}`, color: '#d97706', icon: <ArrowDownRight size={18} /> },
          { label: 'Cuentas Activas', value: stats.totalAccounts, color: '#7c3aed', icon: <FileText size={18} /> },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{s.value}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}10`, color: s.color, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>{s.icon}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 1 }}>
        {([['dashboard', '📊 Resumen'], ['accounts', '📑 Plan de Cuentas'], ['journals', '📝 Asientos Diarios'], ['reports', '📈 Reportes']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ padding: '10px 20px', border: 'none', background: 'none', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
              color: activeTab === key ? 'var(--primary-color)' : 'var(--text-muted)',
            }}>
            {label}
            {activeTab === key && <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: 'var(--primary-color)', borderRadius: '2px 2px 0 0' }} />}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', minHeight: 400 }}>
        {activeTab === 'dashboard' && (
          <div style={{ padding: 40, display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: 32 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>Flujo de Caja (Últimos 30 días)</h3>
              <div style={{ height: 240, background: 'var(--background-color)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)' }}>
                 <LineChart size={48} style={{ opacity: 0.2 }} />
                 <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Gráfico de flujo de caja en desarrollo</span>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>Bancos y Efectivo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Bancolombia Principal', acc: '1110-01', balance: '$45,200,000' },
                  { name: 'Caja Menor', acc: '1105-01', balance: '$1,500,000' },
                  { name: 'Nequi Empresarial', acc: '1110-02', balance: '$3,800,000' },
                ].map((b, i) => (
                   <div key={i} style={{ background: 'var(--background-color)', padding: '16px', borderRadius: 10, border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.name}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Cta: {b.acc}</div>
                     </div>
                     <div style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{b.balance}</div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 12 }}>
               <input 
                placeholder="🔍 Buscar por código o nombre..." 
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
               />
               <button style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>Añadir Cuenta</button>
            </div>
            {/* Dummy Accounts Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--background-color)' }}>
                    {['Código', 'Nombre de Cuenta', 'Naturaleza', 'Estado', 'Saldo Actual'].map((h, i) => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: i === 4 ? 'right' : 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: '1105', name: 'Caja General', type: 'ASSET', balance: '$1,500,000' },
                    { code: '1110', name: 'Bancos Moneda Nacional', type: 'ASSET', balance: '$49,000,000' },
                    { code: '2105', name: 'Obligaciones Financieras', type: 'LIABILITY', balance: '$12,000,000' },
                    { code: '3105', name: 'Capital Suscrito', type: 'EQUITY', balance: '$50,000,000' },
                    { code: '4105', name: 'Ingresos Operacionales', type: 'REVENUE', balance: '$85,200,000' },
                    { code: '5105', name: 'Gastos de Personal', type: 'EXPENSE', balance: '$32,500,000' },
                  ].map(acc => (
                     <tr key={acc.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
                       <td style={{ padding: '14px 16px', fontWeight: 600 }}>{acc.code}</td>
                       <td style={{ padding: '14px 16px', color: 'var(--text-main)' }}>{acc.name}</td>
                       <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: 20, background: `${ACCOUNT_TYPE_COLORS[acc.type]}15`, color: ACCOUNT_TYPE_COLORS[acc.type], fontSize: '0.75rem', fontWeight: 700 }}>
                            {ACCOUNT_TYPE_LABELS[acc.type]}
                          </span>
                       </td>
                       <td style={{ padding: '14px 16px' }}><span style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600 }}>Activa</span></td>
                       <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>{acc.balance}</td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'journals' && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Banknote size={48} style={{ opacity: 0.2, marginBottom: 16, margin: '0 auto' }} />
            <h3>Asientos Contables Diarios</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '16px auto' }}>Aquí registrarás los movimientos contables manuales. Cada asiento verificará partida doble entre débito y crédito.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: 16, margin: '0 auto' }} />
            <h3>Estados Financieros</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '16px auto' }}>Generación automática de Balance General y Estado de Resultados (P&L).</p>
          </div>
        )}
      </div>
    </div>
  );
}
