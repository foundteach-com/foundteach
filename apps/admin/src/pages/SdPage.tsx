import { useState, useEffect } from 'react';
import { 
  Users, ShoppingBag, FileText, TrendingUp, Plus, 
  DollarSign
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const STAGE_LABELS: Record<string, string> = {
  PROSPECT: 'Prospecto',
  QUALIFIED: 'Calificado',
  PROPOSAL: 'Propuesta',
  NEGOTIATION: 'Negociación',
  CLOSED_WON: 'Ganado',
  CLOSED_LOST: 'Perdido',
};

const STAGE_COLORS: Record<string, string> = {
  PROSPECT: '#64748b',
  QUALIFIED: '#2563eb',
  PROPOSAL: '#7c3aed',
  NEGOTIATION: '#d97706',
  CLOSED_WON: '#059669',
  CLOSED_LOST: '#ef4444',
};

export function SdPage() {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'customers' | 'catalog' | 'documents'>('pipeline');
  const [stats, setStats] = useState({ activeCustomers: 0, totalQuotes: 0, activeDeals: 0, totalRevenue: 0 });
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('admin_token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/sd/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error('Error loading SD stats:', e);
    }
  };

  useEffect(() => { loadStats(); }, []);

  return (
    <div style={{ padding: '4px' }}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>Ventas (SD)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Gestión de clientes, pipeline y ciclo comercial</p>
        </div>
        <button style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
          <Plus size={18} /> Nueva Oportunidad
        </button>
      </div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Revenue (Facturado)', value: `$${stats.totalRevenue.toLocaleString()}`, color: '#059669', icon: <DollarSign size={18} /> },
          { label: 'Clientes CRM', value: stats.activeCustomers, color: '#2563eb', icon: <Users size={18} /> },
          { label: 'Oportunidades Pipeline', value: stats.activeDeals, color: '#7c3aed', icon: <TrendingUp size={18} /> },
          { label: 'Cotizaciones Enviadas', value: stats.totalQuotes, color: '#d97706', icon: <FileText size={18} /> },
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
        {([['pipeline', '🚀 Pipeline'], ['customers', '👥 Clientes'], ['catalog', '📦 Catálogo'], ['documents', '📄 Documentos']] as const).map(([key, label]) => (
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
        {activeTab === 'pipeline' && (
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, overflowX: 'auto' }}>
            {['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'].map(stage => (
              <div key={stage} style={{ background: 'var(--background-color)', borderRadius: 12, padding: 12, minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: STAGE_COLORS[stage], background: `${STAGE_COLORS[stage]}15`, padding: '2px 8px', borderRadius: 4 }}>{STAGE_LABELS[stage]}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</span>
                </div>
                {/* Placeholder Cards */}
                <div style={{ background: 'var(--surface-color)', padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', marginBottom: 12, cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>Licencias GeoMath</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Colegio Integrado...</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-color)', marginTop: 8 }}>$5,200,000</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'customers' && (
          <div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 12 }}>
               <input 
                placeholder="🔍 Buscar en CRM..." 
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
               />
               <button style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}>Exportar</button>
            </div>
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Users size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Directorio de clientes CRM sincronizado con el pipeline de ventas.</p>
            </div>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: 16, margin: '0 auto' }} />
            <h3>Catálogo de Productos</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '16px auto' }}>Gestione las licencias de GeoMath, horas de consultoría y servicios de ingeniería fix/mensual aquí.</p>
          </div>
        )}

        {activeTab === 'documents' && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: 16, margin: '0 auto' }} />
            <h3>Cotizaciones y Facturas</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '16px auto' }}>Aquí podrá generar los PDFs de cotización y gestionar el estado de las facturas enviadas a clientes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
