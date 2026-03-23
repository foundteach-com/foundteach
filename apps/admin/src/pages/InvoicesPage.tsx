import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

interface Invoice {
  id: string;
  number: string;
  type: 'RECEIVABLE' | 'PAYABLE';
  party: string;
  amount: number;
  tax: number;
  status: string;
  issueDate: string;
  dueDate: string;
  description: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Pendiente',  color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  PAID:      { label: 'Pagada',     color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  OVERDUE:   { label: 'Vencida',    color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  CANCELLED: { label: 'Cancelada',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

const emptyForm = {
  type: 'RECEIVABLE' as 'RECEIVABLE' | 'PAYABLE',
  number: '',
  party: '',
  amount: '',
  tax: '0',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  description: '',
};

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr: string) {
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  return diff;
}

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');

  const showMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/finance/invoices`, { headers: authHeader() });
      if (res.ok) setInvoices(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchInvoices(); }, [fetchInvoices]);

  const handleSave = async () => {
    if (!form.number || !form.party || !form.amount || !form.dueDate) {
      setError('Número, cliente/proveedor, monto y fecha de vencimiento son obligatorios.'); return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/finance/invoices`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), tax: parseFloat(form.tax) }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Error');
      setShowForm(false); setForm(emptyForm);
      await fetchInvoices();
      showMsg('Factura creada correctamente.');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const changeStatus = async (id: string, status: string) => {
    await fetch(`${API_URL}/api/finance/invoices/${id}`, {
      method: 'PATCH', headers: authHeader(), body: JSON.stringify({ status }),
    });
    await fetchInvoices();
    showMsg('Estado actualizado.');
  };

  const visible = invoices.filter(i => i.type === tab);
  const totalPending = visible.filter(i => i.status === 'PENDING').reduce((s, i) => s + i.amount + i.tax, 0);
  const totalPaid = visible.filter(i => i.status === 'PAID').reduce((s, i) => s + i.amount + i.tax, 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Cuentas por Cobrar & Pagar</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Control de facturas emitidas y recibidas.</p>
        </div>
        <button onClick={() => { setShowForm(true); setError(''); setForm(f => ({ ...f, type: tab })); }} style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          + Nueva Factura
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'var(--background-color)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['RECEIVABLE', 'PAYABLE'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', border: 'none', background: tab === t ? 'var(--surface-color)' : 'transparent', color: tab === t ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.875rem', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.2s' }}>
            {t === 'RECEIVABLE' ? '📥 Por Cobrar' : '📤 Por Pagar'}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '18px 22px', borderTop: '3px solid #d97706' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Pendiente de {tab === 'RECEIVABLE' ? 'Cobro' : 'Pago'}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706' }}>{fmt(totalPending)}</div>
        </div>
        <div style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '18px 22px', borderTop: '3px solid #059669' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{tab === 'RECEIVABLE' ? 'Cobrado' : 'Pagado'}</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>{fmt(totalPaid)}</div>
        </div>
      </div>

      {success && <div style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(5,150,105,0.2)' }}>✅ {success}</div>}

      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : visible.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>{tab === 'RECEIVABLE' ? '📥' : '📤'}</div>
            <p style={{ fontWeight: 600 }}>No hay facturas {tab === 'RECEIVABLE' ? 'por cobrar' : 'por pagar'}</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 110px 100px 200px', gap: 12, padding: '10px 20px', background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)' }}>
              {['N°', tab === 'RECEIVABLE' ? 'Cliente' : 'Proveedor', 'Monto + IVA', 'Vencimiento', 'Estado', 'Cambiar estado'].map(h => (
                <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {visible.map((inv, i) => {
              const days = daysUntil(inv.dueDate);
              const sc = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.PENDING;
              return (
                <div key={inv.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 120px 110px 100px 200px', gap: 12, padding: '14px 20px', borderBottom: i < visible.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary-color)' }}>{inv.number}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{inv.party}</div>
                    {inv.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.description}</div>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(inv.amount + inv.tax)}</div>
                  <div>
                    <div style={{ fontSize: '0.82rem' }}>{new Date(inv.dueDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                    {inv.status === 'PENDING' && <div style={{ fontSize: '0.72rem', color: days < 0 ? '#ef4444' : days <= 7 ? '#d97706' : 'var(--text-muted)', fontWeight: 600 }}>
                      {days < 0 ? `Venció hace ${Math.abs(days)}d` : days === 0 ? 'Vence hoy' : `${days}d restantes`}
                    </div>}
                  </div>
                  <div><span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: sc.bg, color: sc.color }}>{sc.label}</span></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.entries(STATUS_CONFIG).filter(([k]) => k !== inv.status).map(([k, v]) => (
                      <button key={k} onClick={() => changeStatus(inv.id, k)} style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.72rem', cursor: 'pointer', border: `1px solid ${v.color}40`, background: v.bg, color: v.color, fontWeight: 700 }}>{v.label}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 540, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Nueva Factura</h2>
              <button onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 1 }}>×</button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 }}>
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'var(--background-color)', borderRadius: 10, padding: 4 }}>
                {(['RECEIVABLE', 'PAYABLE'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} style={{ padding: '8px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', border: 'none', background: form.type === t ? 'var(--primary-color)' : 'transparent', color: form.type === t ? 'white' : 'var(--text-muted)' }}>
                    {t === 'RECEIVABLE' ? '📥 Por Cobrar' : '📤 Por Pagar'}
                  </button>
                ))}
              </div>
              {[
                { label: 'Número de factura *', key: 'number', type: 'text', placeholder: 'FAC-001' },
                { label: form.type === 'RECEIVABLE' ? 'Cliente *' : 'Proveedor *', key: 'party', type: 'text', placeholder: 'Nombre o empresa' },
                { label: 'Monto (sin IVA, COP) *', key: 'amount', type: 'number', placeholder: '0' },
                { label: 'IVA (COP)', key: 'tax', type: 'number', placeholder: '0' },
                { label: 'Fecha de emisión *', key: 'issueDate', type: 'date', placeholder: '' },
                { label: 'Fecha de vencimiento *', key: 'dueDate', type: 'date', placeholder: '' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} className="form-input" placeholder={f.placeholder} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Descripción</label>
                <input type="text" className="form-input" placeholder="Ej: Licencia GeoMath — Enero 2025" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : 'Crear Factura'}</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
