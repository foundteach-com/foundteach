import { useState, useEffect, useCallback } from 'react';
import { X, TicketCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/ops`;

interface Project { id: string; title: string; }
interface Customer { id: string; name: string; }
interface Ticket {
  id: string; subject: string; description?: string; priority: string;
  status: string; reporter?: string; assignee?: string;
  projectId?: string; customerId?: string;
  project?: { id: string; title: string };
  customer?: { id: string; name: string };
  createdAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#60a5fa', IN_PROGRESS: '#f59e0b', RESOLVED: '#10b981', CLOSED: '#64748b',
};
const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
};
const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto', IN_PROGRESS: 'En curso', RESOLVED: 'Resuelto', CLOSED: 'Cerrado',
};

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [form, setForm] = useState({ subject: '', description: '', priority: 'MEDIUM', reporter: '', projectId: '', customerId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE}/tickets`);
      if (filterStatus) url.searchParams.set('status', filterStatus);
      if (filterPriority) url.searchParams.set('priority', filterPriority);
      const [tRes, pRes, cRes] = await Promise.all([
        fetch(url.toString(), { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/projects`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API_URL}/api/sd/customers`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (tRes.ok) setTickets(await tRes.json());
      if (pRes.ok) setProjects(await pRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
    } finally { setLoading(false); }
  }, [filterStatus, filterPriority]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    await fetch(`${BASE}/tickets`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...form, projectId: form.projectId || undefined, customerId: form.customerId || undefined }),
    });
    setShowModal(false);
    void load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${BASE}/tickets/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    void load();
  };

  const openCount = tickets.filter(t => t.status === 'OPEN').length;
  const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;
  const criticalCount = tickets.filter(t => t.priority === 'CRITICAL').length;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Soporte & Tickets</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Gestión de incidencias y solicitudes de soporte</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
          + Nuevo Ticket
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: tickets.length, color: '#818cf8' },
          { label: 'Abiertos', value: openCount, color: '#60a5fa' },
          { label: 'En Curso', value: inProgressCount, color: '#f59e0b' },
          { label: 'Críticos', value: criticalCount, color: '#ef4444' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todas las prioridades</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
            <TicketCheck size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No hay tickets encontrados.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#64748b' }}>
                {['Asunto', 'Prioridad', 'Estado', 'Reporter', 'Proyecto / Cliente', 'Fecha', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickets.map((t, i) => (
                <tr key={t.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 500 }}>
                    <div>{t.subject}</div>
                    {t.description && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{t.description.slice(0, 60)}{t.description.length > 60 ? '...' : ''}</div>}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: PRIORITY_COLORS[t.priority] + '22', color: PRIORITY_COLORS[t.priority] }}>
                      {PRIORITY_LABELS[t.priority]}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: STATUS_COLORS[t.status] + '22', color: STATUS_COLORS[t.status] }}>
                      {STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', color: '#94a3b8' }}>{t.reporter ?? '—'}</td>
                  <td style={{ padding: '11px 16px', color: '#94a3b8', fontSize: '0.8rem' }}>
                    {t.project?.title ?? t.customer?.name ?? '—'}
                  </td>
                  <td style={{ padding: '11px 16px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                    {new Date(t.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <select value={t.status} onChange={e => void updateStatus(t.id, e.target.value)}
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', color: '#e2e8f0', fontSize: '0.75rem' }}>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Nuevo Ticket</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Asunto *', key: 'subject', type: 'text' },
                { label: 'Reportado por', key: 'reporter', type: 'text' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input type={f.type} value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Descripción</span>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={3}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Prioridad</span>
                <select value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Proyecto (opcional)</span>
                <select value={form.projectId} onChange={e => setForm(prev => ({ ...prev, projectId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Sin proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Cliente (opcional)</span>
                <select value={form.customerId} onChange={e => setForm(prev => ({ ...prev, customerId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Sin cliente</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Crear Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
