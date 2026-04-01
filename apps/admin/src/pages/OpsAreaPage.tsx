import { useState } from 'react';
import {
  Wrench, FolderKanban, ListTodo, TicketCheck, PackageCheck,
  Plus, Trash2, X, ChevronDown, Clock,
  CheckCircle, AlertCircle, Circle, Loader, TrendingUp,
  BarChart2, Calendar,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const token = () => localStorage.getItem('admin_token') || '';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: string; title: string; description?: string;
  status: string; progress: number; startDate?: string;
  endDate?: string; budget?: number; responsible?: string; color: string;
}
interface Task {
  id: string; title: string; description?: string;
  status: string; priority: string; assignee?: string;
  dueDate?: string; projectId: string;
}
interface Ticket {
  id: string; subject: string; description?: string;
  priority: string; status: string; reporter?: string; assignee?: string;
  createdAt: string;
}
interface Deliverable {
  id: string; name: string; description?: string;
  status: string; fileUrl?: string; dueDate?: string; projectId: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso?: string) => iso
  ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

function StatusBadge({ value, map }: { value: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const s = map[value] ?? { label: value, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  return (
    <span style={{ fontSize: '0.71rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, color: s.color, background: s.bg, letterSpacing: '0.03em' }}>
      {s.label}
    </span>
  );
}

const PROJECT_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PLANNING:  { label: 'Planificación', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  ACTIVE:    { label: 'Activo',        color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  ON_HOLD:   { label: 'En Pausa',      color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  COMPLETED: { label: 'Completado',    color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  CANCELLED: { label: 'Cancelado',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};
const TASK_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  TODO:        { label: 'Pendiente',    color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  IN_PROGRESS: { label: 'En Progreso', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  REVIEW:      { label: 'Revisión',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  DONE:        { label: 'Listo',       color: '#059669', bg: 'rgba(5,150,105,0.1)' },
};
const PRIORITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  LOW:      { label: 'Baja',     color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  MEDIUM:   { label: 'Media',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  HIGH:     { label: 'Alta',     color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  CRITICAL: { label: 'Crítica',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};
const TICKET_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  OPEN:        { label: 'Abierto',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  IN_PROGRESS: { label: 'En Progreso',   color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  RESOLVED:    { label: 'Resuelto',      color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  CLOSED:      { label: 'Cerrado',       color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
};
const DELIVERABLE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Pendiente',  color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  SUBMITTED: { label: 'Entregado',  color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
  APPROVED:  { label: 'Aprobado',   color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  REJECTED:  { label: 'Rechazado',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub: string;
  icon: React.ComponentType<{ size?: number }>; color: string;
}) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)'; }}
    >
      <div style={{ width: 50, height: 50, borderRadius: 13, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={21} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',     label: 'Resumen',    icon: BarChart2 },
  { id: 'projects',     label: 'Proyectos',  icon: FolderKanban },
  { id: 'tasks',        label: 'Tareas',     icon: ListTodo },
  { id: 'tickets',      label: 'Tickets',    icon: TicketCheck },
  { id: 'deliverables', label: 'Entregas',   icon: PackageCheck },
];

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ projects, tasks, tickets, deliverables }: {
  projects: Project[]; tasks: Task[]; tickets: Ticket[]; deliverables: Deliverable[];
}) {
  const active = projects.filter(p => p.status === 'ACTIVE').length;
  const pending = tasks.filter(t => t.status === 'TODO').length;
  const open = tickets.filter(t => t.status === 'OPEN').length;
  const approved = deliverables.filter(d => d.status === 'APPROVED').length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Proyectos Activos"   value={active}     sub={`de ${projects.length} total`}     icon={FolderKanban}  color="#2563eb" />
        <KpiCard label="Tareas Pendientes"   value={pending}    sub={`de ${tasks.length} total`}        icon={ListTodo}      color="#f59e0b" />
        <KpiCard label="Tickets Abiertos"    value={open}       sub={`de ${tickets.length} total`}      icon={TicketCheck}   color="#ef4444" />
        <KpiCard label="Entregas Aprobadas"  value={approved}   sub={`de ${deliverables.length} total`} icon={PackageCheck}  color="#059669" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Proyectos recientes */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Proyectos Recientes</h3>
          {projects.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay proyectos registrados.</p>
            : projects.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color || '#2563eb', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 4, background: 'var(--border-color)' }}>
                      <div style={{ height: '100%', borderRadius: 4, background: p.color || '#2563eb', width: `${p.progress}%` }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{p.progress}%</span>
                  </div>
                </div>
                <StatusBadge value={p.status} map={PROJECT_STATUS} />
              </div>
            ))}
        </div>

        {/* Tickets recientes */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Tickets Recientes</h3>
          {tickets.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay tickets registrados.</p>
            : tickets.slice(0, 5).map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ marginTop: 2 }}>
                  {t.status === 'OPEN' ? <AlertCircle size={15} color="#ef4444" /> : t.status === 'RESOLVED' ? <CheckCircle size={15} color="#059669" /> : <Circle size={15} color="#64748b" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{fmtDate(t.createdAt)}</div>
                </div>
                <StatusBadge value={t.priority} map={PRIORITY_MAP} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────
function ProjectsTab({ projects, setProjects }: { projects: Project[]; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'PLANNING', progress: 0, responsible: '', budget: '', color: '#2563eb' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/ops/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...form, progress: Number(form.progress), budget: form.budget ? Number(form.budget) : undefined }),
      });
      if (res.ok) { const d = await res.json(); setProjects(p => [d, ...p]); setModal(false); setForm({ title: '', description: '', status: 'PLANNING', progress: 0, responsible: '', budget: '', color: '#2563eb' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar proyecto?')) return;
    await fetch(`${API_URL}/api/ops/projects/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setProjects(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>{projects.length} proyecto{projects.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Nuevo Proyecto
        </button>
      </div>

      {projects.length === 0
        ? <EmptyState icon={FolderKanban} text="No hay proyectos. Crea el primero." />
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {projects.map(p => (
            <div key={p.id} style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', borderTop: `4px solid ${p.color || '#2563eb'}`, padding: 20, transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = ''}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3 }}>{p.title}</h4>
                <button onClick={() => handleDelete(p.id)} style={{ color: '#ef4444', padding: 4, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button>
              </div>
              {p.description && <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.4 }}>{p.description}</p>}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 5 }}>
                  <span>Progreso</span><span style={{ fontWeight: 700 }}>{p.progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, background: 'var(--border-color)' }}>
                  <div style={{ height: '100%', borderRadius: 6, background: p.color || '#2563eb', width: `${p.progress}%`, transition: 'width 0.4s ease' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <StatusBadge value={p.status} map={PROJECT_STATUS} />
                {p.responsible && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>👤 {p.responsible}</span>}
              </div>
              {(p.startDate || p.endDate) && (
                <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: 12 }}>
                  {p.startDate && <span><Calendar size={11} style={{ verticalAlign: 'middle' }} /> {fmtDate(p.startDate)}</span>}
                  {p.endDate && <span>→ {fmtDate(p.endDate)}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      }

      {modal && (
        <Modal title="Nuevo Proyecto" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <FormField label="Título"><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></FormField>
            <FormField label="Descripción"><textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} /></FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Estado"><SelectField value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(PROJECT_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></FormField>
              <FormField label="Progreso (%)"><input type="number" className="form-input" min={0} max={100} value={form.progress} onChange={e => setForm(p => ({ ...p, progress: Number(e.target.value) }))} /></FormField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Responsable"><input className="form-input" value={form.responsible} onChange={e => setForm(p => ({ ...p, responsible: e.target.value }))} /></FormField>
              <FormField label="Presupuesto (COP)"><input type="number" className="form-input" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} /></FormField>
            </div>
            <FormField label="Color del proyecto">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid var(--border-color)', cursor: 'pointer', padding: 2 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{form.color}</span>
              </div>
            </FormField>
            <SubmitBtn loading={saving} label="Crear Proyecto" />
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────
function TasksTab({ tasks, setTasks, projects }: { tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; projects: Project[] }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [form, setForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignee: '', projectId: '', dueDate: '' });

  const filtered = filterStatus === 'ALL' ? tasks : tasks.filter(t => t.status === filterStatus);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/ops/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { const d = await res.json(); setTasks(p => [d, ...p]); setModal(false); setForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignee: '', projectId: '', dueDate: '' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar tarea?')) return;
    await fetch(`${API_URL}/api/ops/tasks/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setTasks(p => p.filter(x => x.id !== id));
  };

  const COLS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', ...COLS].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, background: filterStatus === s ? 'var(--primary-color)' : 'var(--surface-color)', color: filterStatus === s ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-color)', transition: 'all 0.15s' }}>
              {s === 'ALL' ? 'Todas' : TASK_STATUS[s]?.label ?? s}
            </button>
          ))}
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Nueva Tarea
        </button>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={ListTodo} text="No hay tareas para este filtro." />
        : <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background-color)' }}>
                {['Tarea', 'Estado', 'Prioridad', 'Asignado a', 'Vencimiento', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--background-color)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.title}</div>
                    {t.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.description.substring(0, 60)}{t.description.length > 60 ? '...' : ''}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge value={t.status} map={TASK_STATUS} /></td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge value={t.priority} map={PRIORITY_MAP} /></td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t.assignee || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{fmtDate(t.dueDate)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(t.id)} style={{ color: '#ef4444', padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }

      {modal && (
        <Modal title="Nueva Tarea" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <FormField label="Título"><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></FormField>
            <FormField label="Descripción"><textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} /></FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Estado"><SelectField value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(TASK_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></FormField>
              <FormField label="Prioridad"><SelectField value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))} options={Object.entries(PRIORITY_MAP).map(([k, v]) => ({ value: k, label: v.label }))} /></FormField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Asignado a"><input className="form-input" value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))} /></FormField>
              <FormField label="Fecha Límite"><input type="date" className="form-input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></FormField>
            </div>
            <FormField label="Proyecto">
              <SelectField value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} options={[{ value: '', label: 'Sin proyecto' }, ...projects.map(p => ({ value: p.id, label: p.title }))]} />
            </FormField>
            <SubmitBtn loading={saving} label="Crear Tarea" />
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Tickets Tab ──────────────────────────────────────────────────────────────
function TicketsTab({ tickets, setTickets }: { tickets: Ticket[]; setTickets: React.Dispatch<React.SetStateAction<Ticket[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [form, setForm] = useState({ subject: '', description: '', priority: 'MEDIUM', status: 'OPEN', reporter: '', assignee: '' });

  const filtered = filterStatus === 'ALL' ? tickets : tickets.filter(t => t.status === filterStatus);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/ops/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { const d = await res.json(); setTickets(p => [d, ...p]); setModal(false); setForm({ subject: '', description: '', priority: 'MEDIUM', status: 'OPEN', reporter: '', assignee: '' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar ticket?')) return;
    await fetch(`${API_URL}/api/ops/tickets/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setTickets(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, background: filterStatus === s ? 'var(--primary-color)' : 'var(--surface-color)', color: filterStatus === s ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-color)', transition: 'all 0.15s' }}>
              {s === 'ALL' ? 'Todos' : TICKET_STATUS[s]?.label ?? s}
            </button>
          ))}
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Nuevo Ticket
        </button>
      </div>

      {filtered.length === 0
        ? <EmptyState icon={TicketCheck} text="No hay tickets para este filtro." />
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(t => (
            <div key={t.id} style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = ''}
            >
              <div style={{ marginTop: 2 }}>
                {t.status === 'OPEN' ? <AlertCircle size={18} color="#ef4444" /> : t.status === 'IN_PROGRESS' ? <Loader size={18} color="#2563eb" /> : t.status === 'RESOLVED' ? <CheckCircle size={18} color="#059669" /> : <Circle size={18} color="#64748b" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{t.subject}</div>
                {t.description && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.description}</div>}
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t.reporter && <span>Reportado por: <strong>{t.reporter}</strong></span>}
                  {t.assignee && <span>Asignado: <strong>{t.assignee}</strong></span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {fmtDate(t.createdAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <StatusBadge value={t.status} map={TICKET_STATUS} />
                <StatusBadge value={t.priority} map={PRIORITY_MAP} />
                <button onClick={() => handleDelete(t.id)} style={{ color: '#ef4444', padding: 4, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      }

      {modal && (
        <Modal title="Nuevo Ticket" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <FormField label="Asunto"><input className="form-input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required /></FormField>
            <FormField label="Descripción"><textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} /></FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Prioridad"><SelectField value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))} options={Object.entries(PRIORITY_MAP).map(([k, v]) => ({ value: k, label: v.label }))} /></FormField>
              <FormField label="Estado"><SelectField value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(TICKET_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></FormField>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Reportado por"><input className="form-input" value={form.reporter} onChange={e => setForm(p => ({ ...p, reporter: e.target.value }))} /></FormField>
              <FormField label="Asignado a"><input className="form-input" value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))} /></FormField>
            </div>
            <SubmitBtn loading={saving} label="Crear Ticket" />
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Deliverables Tab ─────────────────────────────────────────────────────────
function DeliverablesTab({ deliverables, setDeliverables, projects }: { deliverables: Deliverable[]; setDeliverables: React.Dispatch<React.SetStateAction<Deliverable[]>>; projects: Project[] }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', status: 'PENDING', projectId: '', dueDate: '', fileUrl: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/ops/deliverables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(form),
      });
      if (res.ok) { const d = await res.json(); setDeliverables(p => [d, ...p]); setModal(false); setForm({ name: '', description: '', status: 'PENDING', projectId: '', dueDate: '', fileUrl: '' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar entrega?')) return;
    await fetch(`${API_URL}/api/ops/deliverables/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setDeliverables(p => p.filter(x => x.id !== id));
  };

  const getProject = (id: string) => projects.find(p => p.id === id);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Nueva Entrega
        </button>
      </div>

      {deliverables.length === 0
        ? <EmptyState icon={PackageCheck} text="No hay entregas registradas." />
        : <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background-color)' }}>
                {['Entrega', 'Proyecto', 'Estado', 'Fecha Límite', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliverables.map((d, i) => {
                const proj = getProject(d.projectId);
                return (
                  <tr key={d.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--background-color)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.name}</div>
                      {d.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{d.description.substring(0, 50)}{d.description.length > 50 ? '...' : ''}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {proj ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: proj.color }} />
                          <span style={{ fontSize: '0.84rem' }}>{proj.title}</span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge value={d.status} map={DELIVERABLE_STATUS} /></td>
                    <td style={{ padding: '12px 16px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{fmtDate(d.dueDate)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleDelete(d.id)} style={{ color: '#ef4444', padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      }

      {modal && (
        <Modal title="Nueva Entrega" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <FormField label="Nombre"><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></FormField>
            <FormField label="Descripción"><textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} /></FormField>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FormField label="Estado"><SelectField value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(DELIVERABLE_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></FormField>
              <FormField label="Fecha Límite"><input type="date" className="form-input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} /></FormField>
            </div>
            <FormField label="Proyecto">
              <SelectField value={form.projectId} onChange={v => setForm(p => ({ ...p, projectId: v }))} options={[{ value: '', label: 'Sin proyecto' }, ...projects.map(p => ({ value: p.id, label: p.title }))]} />
            </FormField>
            <FormField label="URL del archivo (opcional)"><input className="form-input" value={form.fileUrl} onChange={e => setForm(p => ({ ...p, fileUrl: e.target.value }))} placeholder="https://..." /></FormField>
            <SubmitBtn loading={saving} label="Crear Entrega" />
          </form>
        </Modal>
      )}
    </div>
  );
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number }>; text: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
      <Icon size={32} />
      <p style={{ marginTop: 12, fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 24px 48px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{title}</h3>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} className="form-input" style={{ appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', display: 'flex' }}>
        <ChevronDown size={14} />
      </span>
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
      {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader size={15} /> Guardando…</span> : label}
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function OpsAreaPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [projects,     setProjects]     = useState<Project[]>([]);
  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [tickets,      setTickets]      = useState<Ticket[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loaded,       setLoaded]       = useState(false);
  const [loading,      setLoading]      = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token()}` };
      const [rP, rT, rTk, rD] = await Promise.all([
        fetch(`${API_URL}/api/ops/projects`,     { headers }),
        fetch(`${API_URL}/api/ops/tasks`,        { headers }),
        fetch(`${API_URL}/api/ops/tickets`,      { headers }),
        fetch(`${API_URL}/api/ops/deliverables`, { headers }),
      ]);
      if (rP.ok)  setProjects(await rP.json());
      if (rT.ok)  setTasks(await rT.json());
      if (rTk.ok) setTickets(await rTk.json());
      if (rD.ok)  setDeliverables(await rD.json());
    } catch { /* ignore */ }
    setLoading(false);
    setLoaded(true);
  };

  const renderTab = () => {
    if (!loaded) return (
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 48, textAlign: 'center' }}>
        <Wrench size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.35 }} />
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Área Operativa</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Gestiona proyectos, tareas, tickets de soporte y entregas.</p>
        <button onClick={loadData} disabled={loading} style={{ padding: '10px 28px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>
          {loading ? 'Cargando…' : 'Cargar Datos'}
        </button>
      </div>
    );
    switch (activeTab) {
      case 'overview':     return <OverviewTab projects={projects} tasks={tasks} tickets={tickets} deliverables={deliverables} />;
      case 'projects':     return <ProjectsTab projects={projects} setProjects={setProjects} />;
      case 'tasks':        return <TasksTab tasks={tasks} setTasks={setTasks} projects={projects} />;
      case 'tickets':      return <TicketsTab tickets={tickets} setTickets={setTickets} />;
      case 'deliverables': return <DeliverablesTab deliverables={deliverables} setDeliverables={setDeliverables} projects={projects} />;
      default:             return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #059669 0%, #0ea5e9 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Wrench size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área Operativa</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestión de proyectos, tareas, tickets y entregas</p>
        </div>
        {loaded && (
          <button onClick={loadData} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-color)' }}>
            <TrendingUp size={13} /> Actualizar
          </button>
        )}
      </div>

      {/* Tabs */}
      {loaded && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-color)', borderRadius: 12, padding: 5, border: '1px solid var(--border-color)', width: 'fit-content' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, fontSize: '0.855rem', fontWeight: 600, background: active ? 'white' : 'transparent', color: active ? 'var(--primary-color)' : 'var(--text-muted)', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', border: active ? '1px solid var(--border-color)' : '1px solid transparent', transition: 'all 0.15s' }}>
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>
      )}

      {renderTab()}
    </div>
  );
}
