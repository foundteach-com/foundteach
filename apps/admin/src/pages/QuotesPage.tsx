import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/sd`;

const QUOTE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:    { label: 'Borrador', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  SENT:     { label: 'Enviada',  color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  ACCEPTED: { label: 'Aceptada',color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  REJECTED: { label: 'Rechazada',color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  EXPIRED:  { label: 'Vencida', color: '#d97706', bg: 'rgba(217,119,6,0.08)' },
};

interface Customer { id: string; name: string; }
interface QuoteItem { description: string; quantity: number; unitPrice: number; discount?: number; total: number; }
interface Quote {
  id: string; quoteNumber: string; status: string; subtotal: number; taxAmount: number;
  total: number; validUntil: string | null; createdAt: string;
  customer: Customer; items: QuoteItem[];
}

interface FormItem { description: string; quantity: string; unitPrice: string; discount: string; }

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

const emptyItem: FormItem = { description: '', quantity: '1', unitPrice: '', discount: '0' };

export function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<FormItem[]>([{ ...emptyItem }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const showMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const nextQuoteNumber = () => {
    const y = new Date().getFullYear();
    const n = (quotes.length + 1).toString().padStart(3, '0');
    return `COT-${y}-${n}`;
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, cRes] = await Promise.all([
        fetch(`${BASE}/quotes`, { headers: authHeader() }),
        fetch(`${BASE}/customers`, { headers: authHeader() }),
      ]);
      if (qRes.ok) setQuotes(await qRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setQuoteNumber(nextQuoteNumber());
    setCustomerId(''); setValidUntil(''); setNotes('');
    setItems([{ ...emptyItem }]);
    setError(''); setShowForm(true);
  };

  const updateItem = (i: number, key: keyof FormItem, value: string) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: value } : it));
  };
  const addItem = () => setItems(prev => [...prev, { ...emptyItem }]);
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unitPrice) || 0;
    const disc = parseFloat(it.discount) || 0;
    return s + qty * price * (1 - disc / 100);
  }, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  const handleSave = async () => {
    if (!customerId || !quoteNumber) { setError('Cliente y número de cotización son obligatorios.'); return; }
    if (items.some(it => !it.description || !it.unitPrice)) { setError('Todos los ítems necesitan descripción y precio.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        quoteNumber, customerId, validUntil: validUntil || undefined, notes: notes || undefined,
        items: items.map(it => ({ description: it.description, quantity: parseFloat(it.quantity) || 1, unitPrice: parseFloat(it.unitPrice) || 0, discount: parseFloat(it.discount) || 0 })),
      };
      const res = await fetch(`${BASE}/quotes`, { method: 'POST', headers: authHeader(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || 'Error');
      setShowForm(false); await fetchAll(); showMsg('Cotización creada.');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Cotizaciones</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Propuestas comerciales con IVA 19% automático.</p>
        </div>
        <button onClick={openCreate} style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          + Nueva Cotización
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total cotizaciones', value: quotes.length, color: '#7c3aed', isMoney: false },
          { label: 'Aceptadas', value: quotes.filter(q => q.status === 'ACCEPTED').reduce((s, q) => s + q.total, 0), color: '#059669', isMoney: true },
          { label: 'Pendientes', value: quotes.filter(q => q.status === 'SENT').reduce((s, q) => s + q.total, 0), color: '#2563eb', isMoney: true },
          { label: 'En borrador', value: quotes.filter(q => q.status === 'DRAFT').length, color: '#94a3b8', isMoney: false },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-color)', borderRadius: 12, border: '1px solid var(--border-color)', padding: '16px 20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: s.isMoney ? '1.2rem' : '1.8rem', fontWeight: 800, color: s.color }}>{s.isMoney ? fmt(s.value as number) : s.value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {success && <div style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: '0.875rem' }}>✅ {success}</div>}

      {/* List */}
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : quotes.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600 }}>No hay cotizaciones</p>
          </div>
        ) : (
          quotes.map((q, i) => {
            const sc = QUOTE_STATUS[q.status] ?? QUOTE_STATUS.DRAFT;
            const isOpen = expandedId === q.id;
            return (
              <div key={q.id} style={{ borderBottom: i < quotes.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <div onClick={() => setExpandedId(isOpen ? null : q.id)} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 120px 130px 80px', gap: 16, padding: '14px 20px', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.875rem' }}>{q.quoteNumber}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.customer.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(q.createdAt).toLocaleDateString('es-CO')}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(q.total)}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>IVA: {fmt(q.taxAmount)}</div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.validUntil ? new Date(q.validUntil).toLocaleDateString('es-CO') : '-'}</div>
                  <div><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{sc.label}</span></div>
                </div>
                {isOpen && (
                  <div style={{ padding: '0 20px 16px', background: 'var(--background-color)', borderTop: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginTop: 12 }}>
                      <thead>
                        <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                          {['Descripción', 'Cant.', 'Precio unit.', 'Desc. %', 'Total'].map(h => (
                            <th key={h} style={{ padding: '6px 10px', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {q.items.map((it, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '8px 10px' }}>{it.description}</td>
                            <td style={{ padding: '8px 10px' }}>{it.quantity}</td>
                            <td style={{ padding: '8px 10px' }}>{fmt(it.unitPrice)}</td>
                            <td style={{ padding: '8px 10px' }}>{it.discount ?? 0}%</td>
                            <td style={{ padding: '8px 10px', fontWeight: 700 }}>{fmt(it.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ borderTop: '2px solid var(--border-color)' }}>
                          <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>Subtotal</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700 }}>{fmt(q.subtotal)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4} style={{ padding: '4px 10px', textAlign: 'right', fontWeight: 600 }}>IVA 19%</td>
                          <td style={{ padding: '4px 10px', fontWeight: 700 }}>{fmt(q.taxAmount)}</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td colSpan={4} style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, fontSize: '1rem' }}>TOTAL</td>
                          <td style={{ padding: '8px 10px', fontWeight: 800, fontSize: '1rem', color: 'var(--primary-color)' }}>{fmt(q.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 680, border: '1px solid var(--border-color)', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Nueva Cotización</h2>
              <button onClick={() => setShowForm(false)} style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">N° Cotización *</label>
                <input type="text" className="form-input" value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cliente *</label>
                <select className="form-input" value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
                  <option value="">Seleccionar...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Válida hasta</label>
                <input type="date" className="form-input" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label style={{ fontWeight: 700, fontSize: '0.875rem' }}>Ítems de la cotización</label>
                <button onClick={addItem} style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={14} /> Agregar ítem</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 110px 70px 30px', gap: 8, marginBottom: 6 }}>
                {['Descripción', 'Cant.', 'Precio unit. COP', 'Desc. %', ''].map(h => (
                  <span key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                ))}
              </div>
              {items.map((it, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 110px 70px 30px', gap: 8, marginBottom: 8 }}>
                  <input type="text" className="form-input" placeholder="Descripción del servicio" value={it.description} onChange={e => updateItem(i, 'description', e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
                  <input type="number" className="form-input" min="1" value={it.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
                  <input type="number" className="form-input" placeholder="0" value={it.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
                  <input type="number" className="form-input" min="0" max="100" placeholder="0" value={it.discount} onChange={e => updateItem(i, 'discount', e.target.value)} style={{ padding: '8px 10px', fontSize: '0.85rem' }} />
                  <button onClick={() => items.length > 1 && removeItem(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', color: '#ef4444', cursor: items.length > 1 ? 'pointer' : 'not-allowed', opacity: items.length > 1 ? 1 : 0.3 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ background: 'var(--background-color)', borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', justifyContent: 'flex-end', gap: 40 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Subtotal</div>
                <div style={{ fontWeight: 700 }}>{fmt(subtotal)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>IVA 19%</div>
                <div style={{ fontWeight: 700 }}>{fmt(tax)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-color)' }}>{fmt(total)}</div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Notas / Condiciones</label>
              <input type="text" className="form-input" placeholder="Términos, condiciones de pago, etc." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Crear Cotización'}</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
