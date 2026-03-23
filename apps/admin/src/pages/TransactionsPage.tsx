import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Plus, Trash2, Filter } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const INCOME_CATEGORIES = ['Servicios GeoMath', 'Consultoría', 'Capacitación', 'Proyectos', 'Otros ingresos'];
const EXPENSE_CATEGORIES = ['Nómina', 'Software / SaaS', 'Marketing', 'Operaciones', 'Impuestos', 'Otros gastos'];

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
  reference: string | null;
  notes: string | null;
  createdAt: string;
}

const emptyForm = {
  type: 'INCOME' as 'INCOME' | 'EXPENSE',
  amount: '',
  description: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  reference: '',
  notes: '',
};

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterType, setFilterType] = useState('');

  const showMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterType
        ? `${API_URL}/api/finance/transactions?type=${filterType}`
        : `${API_URL}/api/finance/transactions`;
      const res = await fetch(url, { headers: authHeader() });
      if (res.ok) setTransactions(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filterType]);

  useEffect(() => { void fetchTx(); }, [fetchTx]);

  const handleSave = async () => {
    if (!form.amount || !form.description || !form.category || !form.date) {
      setError('Monto, descripción, categoría y fecha son obligatorios.'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/finance/transactions`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Error');
      setShowForm(false); setForm(emptyForm);
      await fetchTx();
      showMsg('Transacción registrada.');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    await fetch(`${API_URL}/api/finance/transactions/${id}`, { method: 'DELETE', headers: authHeader() });
    await fetchTx();
    showMsg('Transacción eliminada.');
  };

  const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  const categories = form.type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Ingresos y Gastos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Registro de todos los movimientos financieros.</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(''); }} style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          + Nuevo Movimiento
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Ingresos', value: income, color: '#059669', icon: <TrendingUp size={20} /> },
          { label: 'Total Gastos', value: expense, color: '#ef4444', icon: <TrendingDown size={20} /> },
          { label: 'Utilidad Neta', value: income - expense, color: income - expense >= 0 ? '#2563eb' : '#ef4444', icon: null },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '20px 24px', borderTop: `3px solid ${c.color}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: c.color }}>{c.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c.color }}>{fmt(c.value)}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {success && <div style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(5,150,105,0.2)' }}>✅ {success}</div>}

      {/* Filter + Table */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Filter size={15} color="var(--text-muted)" />
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: '7px 12px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.875rem', background: 'var(--surface-color)', color: 'var(--text-main)', cursor: 'pointer' }}>
          <option value="">Todos los movimientos</option>
          <option value="INCOME">Solo ingresos</option>
          <option value="EXPENSE">Solo gastos</option>
        </select>
      </div>

      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💰</div>
            <p style={{ fontWeight: 600 }}>No hay movimientos registrados</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 100px 44px', gap: 12, padding: '10px 20px', background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)' }}>
              {['Fecha', 'Descripción', 'Categoría', 'Monto', 'Tipo', ''].map(h => (
                <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {transactions.map((t, i) => (
              <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 120px 120px 100px 44px', gap: 12, padding: '14px 20px', borderBottom: i < transactions.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.description}</div>
                  {t.reference && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ref: {t.reference}</div>}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.category}</div>
                <div style={{ fontWeight: 700, color: t.type === 'INCOME' ? '#059669' : '#ef4444' }}>
                  {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                </div>
                <div>
                  <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: t.type === 'INCOME' ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.08)', color: t.type === 'INCOME' ? '#059669' : '#ef4444' }}>
                    {t.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                  </span>
                </div>
                <button onClick={() => handleDelete(t.id)} style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}><Plus size={18} style={{ marginRight: 8 }} />Nuevo Movimiento</h2>
              <button onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 1 }}>×</button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>{error}</div>}

            {/* Type toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20, background: 'var(--background-color)', borderRadius: 10, padding: 4 }}>
              {(['INCOME', 'EXPENSE'] as const).map(type => (
                <button key={type} onClick={() => setForm(f => ({ ...f, type, category: '' }))} style={{ padding: '9px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', border: 'none', background: form.type === type ? (type === 'INCOME' ? '#059669' : '#ef4444') : 'transparent', color: form.type === type ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
                  {type === 'INCOME' ? '↑ Ingreso' : '↓ Gasto'}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Monto (COP) *</label>
                <input type="number" className="form-input" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Fecha *</label>
                <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Descripción *</label>
                <input type="text" className="form-input" placeholder="Ej: Pago suscripción cliente ABC" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Categoría *</label>
                <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
                  <option value="">Seleccionar...</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Referencia / Comprobante</label>
                <input type="text" className="form-input" placeholder="Ej: FAC-001" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Notas</label>
                <input type="text" className="form-input" placeholder="Observaciones adicionales..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1, background: form.type === 'INCOME' ? '#059669' : '#ef4444' }}>
                {saving ? 'Guardando...' : `Registrar ${form.type === 'INCOME' ? 'Ingreso' : 'Gasto'}`}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
