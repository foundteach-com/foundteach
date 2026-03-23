import { useState, useEffect, useCallback } from 'react';
import { Building2, User, Mail, Phone, MapPin, Plus, Pencil, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/sd`;

const CUSTOMER_TYPES: Record<string, string> = {
  COMPANY: 'Empresa', INDIVIDUAL: 'Persona', SCHOOL: 'Colegio',
  UNIVERSITY: 'Universidad', GOVERNMENT: 'Gobierno',
};

interface Customer {
  id: string; name: string; customerType: string; email: string | null;
  phone: string | null; contactPerson: string | null; documentNumber: string | null;
  city: string | null; isActive: boolean;
  quotes?: unknown[]; deals?: unknown[];
}

const emptyForm = {
  name: '', customerType: 'COMPANY', email: '', phone: '', contactPerson: '',
  documentNumber: '', address: '', city: '', country: 'Colombia', website: '', notes: '',
};

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  const showMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/customers`, { headers: authHeader() });
      if (res.ok) setCustomers(await res.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchCustomers(); }, [fetchCustomers]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setShowForm(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, customerType: c.customerType, email: c.email ?? '', phone: c.phone ?? '', contactPerson: c.contactPerson ?? '', documentNumber: c.documentNumber ?? '', address: '', city: c.city ?? '', country: 'Colombia', website: '', notes: '' });
    setError(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form, email: form.email || undefined, website: form.website || undefined };
      const url = editing ? `${BASE}/customers/${editing.id}` : `${BASE}/customers`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeader(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || 'Error');
      setShowForm(false); await fetchCustomers();
      showMsg(editing ? 'Cliente actualizado.' : 'Cliente creado.');
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setSaving(false); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Clientes</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Base de clientes y prospectos de FoundTeach.</p>
        </div>
        <button onClick={openCreate} style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
          + Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Clientes activos', value: customers.filter(c => c.isActive).length, color: '#059669' },
          { label: 'Empresas', value: customers.filter(c => c.customerType === 'COMPANY' || c.customerType === 'SCHOOL' || c.customerType === 'UNIVERSITY' || c.customerType === 'GOVERNMENT').length, color: '#2563eb' },
          { label: 'Total registros', value: customers.length, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-color)', borderRadius: 12, border: '1px solid var(--border-color)', padding: '16px 20px', borderTop: `3px solid ${s.color}` }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {success && <div style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 600, fontSize: '0.875rem' }}>✅ {success}</div>}

      {/* Search */}
      <div style={{ marginBottom: 14 }}>
        <input type="text" placeholder="🔍 Buscar por nombre, email o ciudad..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: '0.875rem', background: 'var(--surface-color)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🤝</div>
            <p style={{ fontWeight: 600 }}>No hay clientes registrados</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 160px 130px 80px 44px', gap: 16, padding: '10px 20px', background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)' }}>
              {['Cliente', 'Tipo', 'Contacto', 'Ciudad', 'Estado', ''].map(h => (
                <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
              ))}
            </div>
            {filtered.map((c, i) => (
              <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 160px 130px 80px 44px', gap: 16, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                      {c.customerType === 'INDIVIDUAL' ? <User size={14} /> : <Building2 size={14} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.name}</div>
                      {c.documentNumber && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NIT/CC: {c.documentNumber}</div>}
                    </div>
                  </div>
                </div>
                <div><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(37,99,235,0.08)', color: 'var(--primary-color)' }}>{CUSTOMER_TYPES[c.customerType] ?? c.customerType}</span></div>
                <div>
                  {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}><Mail size={12} />{c.email}</div>}
                  {c.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}><Phone size={12} />{c.phone}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {c.city && <><MapPin size={12} />{c.city}</>}
                </div>
                <div><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, background: c.isActive ? 'rgba(5,150,105,0.1)' : 'rgba(148,163,184,0.1)', color: c.isActive ? '#059669' : '#94a3b8' }}>{c.isActive ? 'Activo' : 'Inactivo'}</span></div>
                <button onClick={() => openEdit(c)} style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', background: 'var(--surface-hover)', color: 'var(--primary-color)', cursor: 'pointer' }}><Pencil size={13} /></button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 580, border: '1px solid var(--border-color)', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', lineHeight: 1 }}><X size={20} /></button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: '0.875rem' }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Nombre / Razón social *', key: 'name', type: 'text', ph: 'Empresa ABC S.A.S', full: true },
                { label: 'NIT / Cédula', key: 'documentNumber', type: 'text', ph: '900.123.456-7' },
                { label: 'Email', key: 'email', type: 'email', ph: 'contacto@empresa.com' },
                { label: 'Teléfono', key: 'phone', type: 'text', ph: '+57 310 000 0000' },
                { label: 'Persona de contacto', key: 'contactPerson', type: 'text', ph: 'Juan Pérez' },
                { label: 'Ciudad', key: 'city', type: 'text', ph: 'Bogotá' },
                { label: 'Dirección', key: 'address', type: 'text', ph: 'Cra 7 # 10-20' },
                { label: 'Sitio web', key: 'website', type: 'text', ph: 'https://empresa.com' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 0, ...(f.full ? { gridColumn: '1 / -1' } : {}) }}>
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} className="form-input" placeholder={f.ph} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tipo de cliente</label>
                <select className="form-input" value={form.customerType} onChange={e => setForm(p => ({ ...p, customerType: e.target.value }))} style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
                  {Object.entries(CUSTOMER_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Notas</label>
                <input type="text" className="form-input" placeholder="Observaciones del cliente..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>{saving ? 'Guardando...' : (editing ? 'Guardar cambios' : 'Crear Cliente')}</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
