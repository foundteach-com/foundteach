import { useState, useEffect, useCallback } from 'react';
import { Plus, X, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/sd`;

const STAGES = [
  { key: 'PROSPECT',    label: 'Prospecto',   color: '#94a3b8', emoji: '🔍' },
  { key: 'QUALIFIED',   label: 'Calificado',  color: '#d97706', emoji: '✅' },
  { key: 'PROPOSAL',    label: 'Propuesta',   color: '#2563eb', emoji: '📋' },
  { key: 'NEGOTIATION', label: 'Negociación', color: '#7c3aed', emoji: '🤝' },
  { key: 'CLOSED_WON',  label: 'Ganado',      color: '#059669', emoji: '🏆' },
  { key: 'CLOSED_LOST', label: 'Perdido',     color: '#ef4444', emoji: '❌' },
];

interface Customer { id: string; name: string; }
interface Deal {
  id: string; title: string; stage: string; value: number | null;
  probability: number | null; expectedDate: string | null; notes: string | null;
  customer: Customer;
}

const emptyForm = { title: '', customerId: '', stage: 'PROSPECT', value: '', probability: '50', expectedDate: '', notes: '' };

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

export function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dealsRes, custRes] = await Promise.all([
        fetch(`${BASE}/deals`, { headers: authHeader() }),
        fetch(`${BASE}/customers`, { headers: authHeader() }),
      ]);
      if (dealsRes.ok) setDeals(await dealsRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const handleSave = async () => {
    if (!form.title || !form.customerId) { setError('Título y cliente son obligatorios.'); return; }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${BASE}/deals`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ ...form, value: form.value ? parseFloat(form.value) : undefined, probability: form.probability ? parseInt(form.probability) : undefined, expectedDate: form.expectedDate || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Error');
      setShowForm(false); setForm(emptyForm);
      await fetchAll(); showMsg('Oportunidad creada.');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const moveStage = async (deal: Deal, direction: 1 | -1) => {
    const idx = STAGES.findIndex(s => s.key === deal.stage);
    const next = STAGES[idx + direction];
    if (!next) return;
    await fetch(`${BASE}/deals/${deal.id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ stage: next.key }) });
    await fetchAll(); showMsg(`"${deal.title}" movido a ${next.label}.`);
  };

  const totalPipeline = deals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage)).reduce((s, d) => s + (d.value ?? 0), 0);
  const won = deals.filter(d => d.stage === 'CLOSED_WON').reduce((s, d) => s + (d.value ?? 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Pipeline Comercial</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Embudo de ventas — desde prospecto hasta cierre.</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(''); }} style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          + Nueva Oportunidad
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Pipeline activo', value: fmt(totalPipeline), color: '#2563eb' },
          { label: 'Negocios ganados', value: fmt(won), color: '#059669' },
          { label: 'Total oportunidades', value: deals.filter(d => !['CLOSED_WON', 'CLOSED_LOST'].includes(d.stage)).length, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-color)', borderRadius: 12, border: '1px solid var(--border-color)', padding: '16px 20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {success && <div style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: '0.875rem' }}>✅ {success}</div>}

      {/* Kanban board */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, overflowX: 'auto' }}>
          {STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.key);
            return (
              <div key={stage.key} style={{ minWidth: 170, background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', borderTop: `3px solid ${stage.color}`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-color)', background: 'var(--background-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: '1rem' }}>{stage.emoji}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.82rem', color: stage.color }}>{stage.label}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stageDeals.length} oportunidad{stageDeals.length !== 1 ? 'es' : ''}</div>
                </div>
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
                  {stageDeals.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>Sin oportunidades</div>
                  ) : stageDeals.map(deal => (
                    <div key={deal.id} style={{ background: 'var(--background-color)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 4, color: 'var(--text-main)' }}>{deal.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>{deal.customer.name}</div>
                      {deal.value && <div style={{ fontWeight: 700, fontSize: '0.82rem', color: stage.color, marginBottom: 6 }}>{fmt(deal.value)}</div>}
                      <div style={{ display: 'flex', gap: 4 }}>
                        {STAGES.findIndex(s => s.key === deal.stage) > 0 && (
                          <button onClick={() => void moveStage(deal, -1)} style={{ flex: 1, padding: '3px 0', fontSize: '0.7rem', borderRadius: 5, border: '1px solid var(--border-color)', cursor: 'pointer', background: 'var(--surface-color)', color: 'var(--text-muted)' }}>← Atrás</button>
                        )}
                        {STAGES.findIndex(s => s.key === deal.stage) < STAGES.length - 1 && (
                          <button onClick={() => void moveStage(deal, 1)} style={{ flex: 1, padding: '3px 0', fontSize: '0.7rem', borderRadius: 5, border: `1px solid ${stage.color}40`, cursor: 'pointer', background: `${stage.color}10`, color: stage.color }}>
                            Avanzar <ChevronRight size={10} style={{ display: 'inline' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 520, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}><Plus size={18} style={{ marginRight: 8 }} />Nueva Oportunidad</h2>
              <button onClick={() => setShowForm(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Título / Nombre de la oportunidad *</label>
                <input type="text" className="form-input" placeholder="Ej: Licencias GeoMath — Colegio San Luis" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cliente *</label>
                <select className="form-input" value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))} style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
                  <option value="">Seleccionar cliente...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Etapa inicial</label>
                <select className="form-input" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
                  {STAGES.map(s => <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Valor estimado (COP)</label>
                <input type="number" className="form-input" placeholder="0" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Probabilidad de cierre (%)</label>
                <input type="number" className="form-input" min="0" max="100" placeholder="50" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Fecha esperada de cierre</label>
                <input type="date" className="form-input" value={form.expectedDate} onChange={e => setForm(f => ({ ...f, expectedDate: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Notas</label>
                <input type="text" className="form-input" placeholder="Observaciones del negocio..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Crear Oportunidad'}</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
