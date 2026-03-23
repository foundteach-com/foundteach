import { useState, useEffect, useCallback } from 'react';
import {
  FolderKanban, Users, Calendar, ChevronDown, ChevronUp, X,
  TrendingUp, CheckCircle, Clock, Package,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/ops`;

interface Customer { id: string; name: string; }
interface Project {
  id: string; title: string; description?: string; status: string;
  progress: number; startDate?: string; endDate?: string; budget?: number;
  responsible?: string; color: string; customerId?: string;
  customer?: Customer;
  _count?: { tasks: number; deliverables: number; tickets: number };
}

const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'Planificación', ACTIVE: 'Activo', ON_HOLD: 'En pausa',
  COMPLETED: 'Completado', CANCELLED: 'Cancelado',
};
const STATUS_COLORS: Record<string, string> = {
  PLANNING: '#8b5cf6', ACTIVE: '#10b981', ON_HOLD: '#f59e0b',
  COMPLETED: '#3b82f6', CANCELLED: '#ef4444',
};

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', status: 'PLANNING', progress: 0,
    startDate: '', endDate: '', budget: '', responsible: '', color: '#6366f1', customerId: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch(`${BASE}/projects`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API_URL}/api/sd/customers`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (pRes.ok) setProjects(await pRes.json());
      if (cRes.ok) setCustomers(await cRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', description: '', status: 'PLANNING', progress: 0, startDate: '', endDate: '', budget: '', responsible: '', color: '#6366f1', customerId: '' });
    setShowModal(true);
  };
  const openEdit = (p: Project) => {
    setEditing(p);
    setForm({
      title: p.title, description: p.description ?? '', status: p.status,
      progress: p.progress,
      startDate: p.startDate ? p.startDate.split('T')[0] : '',
      endDate: p.endDate ? p.endDate.split('T')[0] : '',
      budget: p.budget?.toString() ?? '', responsible: p.responsible ?? '',
      color: p.color ?? '#6366f1', customerId: p.customerId ?? '',
    });
    setShowModal(true);
  };

  const save = async () => {
    const body = {
      ...form,
      progress: Number(form.progress),
      budget: form.budget ? Number(form.budget) : undefined,
      customerId: form.customerId || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    const url = editing ? `${BASE}/projects/${editing.id}` : `${BASE}/projects`;
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
    if (res.ok) { setShowModal(false); void load(); }
  };

  const active = projects.filter(p => p.status === 'ACTIVE').length;
  const completed = projects.filter(p => p.status === 'COMPLETED').length;
  const totalTasks = projects.reduce((s, p) => s + (p._count?.tasks ?? 0), 0);

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Proyectos</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Gestión de proyectos y servicios</p>
        </div>
        <button onClick={openCreate} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          + Nuevo Proyecto
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '16px', marginBottom: '28px' }}>
        {[
          { label: 'Total', value: projects.length, icon: <FolderKanban size={20} />, color: '#818cf8' },
          { label: 'Activos', value: active, icon: <TrendingUp size={20} />, color: '#34d399' },
          { label: 'Completados', value: completed, icon: <CheckCircle size={20} />, color: '#60a5fa' },
          { label: 'Total Tareas', value: totalTasks, icon: <Package size={20} />, color: '#f472b6' },
        ].map(kpi => (
          <div key={kpi.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #334155' }}>
            <span style={{ color: kpi.color }}>{kpi.icon}</span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{kpi.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando proyectos...</div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>
          <FolderKanban size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No hay proyectos aún. ¡Crea el primero!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {projects.map(p => (
            <div key={p.id} style={{ background: '#1e293b', borderRadius: '12px', border: `1px solid ${expandedId === p.id ? p.color : '#334155'}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: p.color ?? '#6366f1', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem' }}>{p.title}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 600, background: STATUS_COLORS[p.status] + '22', color: STATUS_COLORS[p.status] }}>{STATUS_LABELS[p.status]}</span>
                    {p.customer && <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {p.customer.name}</span>}
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: p.color ?? '#6366f1', width: `${p.progress}%`, transition: 'width 0.4s' }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{p.progress}%</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}><Package size={12} /> {p._count?.tasks ?? 0}</span>
                  <button onClick={e => { e.stopPropagation(); openEdit(p); }} style={{ background: '#0f172a', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>Editar</button>
                  {expandedId === p.id ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                </div>
              </div>

              {expandedId === p.id && (
                <div style={{ borderTop: '1px solid #334155', padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '12px' }}>
                  {p.description && <div style={{ gridColumn: '1 / -1', color: '#94a3b8', fontSize: '0.875rem' }}>{p.description}</div>}
                  {p.responsible && <div><span style={{ color: '#64748b', fontSize: '0.72rem' }}>Responsable</span><br /><span style={{ fontSize: '0.875rem' }}>{p.responsible}</span></div>}
                  {p.budget && <div><span style={{ color: '#64748b', fontSize: '0.72rem' }}>Presupuesto</span><br /><span style={{ fontSize: '0.875rem' }}>$ {Number(p.budget).toLocaleString('es-CO')}</span></div>}
                  {p.startDate && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}><Calendar size={13} color="#64748b" /> {new Date(p.startDate).toLocaleDateString('es-CO')}</div>}
                  {p.endDate && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}><Clock size={13} color="#64748b" /> {new Date(p.endDate).toLocaleDateString('es-CO')}</div>}
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>📋 {p._count?.deliverables ?? 0} entregables</span>
                    <span>🎫 {p._count?.tickets ?? 0} tickets</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>{editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Título *', key: 'title', type: 'text' },
                { label: 'Responsable', key: 'responsible', type: 'text' },
                { label: 'Presupuesto (COP)', key: 'budget', type: 'number' },
                { label: 'Fecha inicio', key: 'startDate', type: 'date' },
                { label: 'Fecha fin', key: 'endDate', type: 'date' },
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
                <span style={{ color: '#94a3b8' }}>Cliente</span>
                <select value={form.customerId} onChange={e => setForm(prev => ({ ...prev, customerId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Sin cliente</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Estado</span>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Progreso: {form.progress}%</span>
                <input type='range' min={0} max={100} value={form.progress} onChange={e => setForm(prev => ({ ...prev, progress: Number(e.target.value) }))}
                  style={{ accentColor: form.color }} />
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Color:</span>
                <input type='color' value={form.color} onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))} style={{ width: '36px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
