import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/ops`;

interface Project { id: string; title: string; color: string; }
interface Task {
  id: string; title: string; description?: string; status: string;
  priority: string; assignee?: string; dueDate?: string;
  projectId: string; project?: { id: string; title: string; color: string };
}
interface Deliverable {
  id: string; name: string; description?: string; status: string;
  fileUrl?: string; dueDate?: string; projectId: string;
}

const COLUMNS = [
  { key: 'TODO',        label: 'Por Hacer',    color: '#64748b' },
  { key: 'IN_PROGRESS', label: 'En Progreso',  color: '#f59e0b' },
  { key: 'REVIEW',      label: 'Revisión',     color: '#8b5cf6' },
  { key: 'DONE',        label: 'Hecho',        color: '#10b981' },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};
const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
};

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDelivModal, setShowDelivModal] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [form, setForm] = useState({ title: '', description: '', projectId: '', priority: 'MEDIUM', assignee: '', dueDate: '' });
  const [delivForm, setDelivForm] = useState({ name: '', description: '', projectId: '', fileUrl: '', dueDate: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes, dRes] = await Promise.all([
        fetch(`${BASE}/tasks`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/projects`, { headers: { Authorization: `Bearer ${token()}` } }),
        filterProject ? fetch(`${BASE}/projects/${filterProject}`, { headers: { Authorization: `Bearer ${token()}` } }) : Promise.resolve(null),
      ]);
      if (tRes.ok) setTasks(await tRes.json());
      if (pRes.ok) setProjects(await pRes.json());
      if (dRes?.ok) {
        const proj = await dRes.json() as { deliverables?: Deliverable[] };
        setDeliverables(proj.deliverables ?? []);
      } else if (!filterProject) { setDeliverables([]); }
    } finally { setLoading(false); }
  }, [filterProject]);

  useEffect(() => { void load(); }, [load]);

  const moveTask = async (task: Task, direction: number) => {
    const idx = COLUMNS.findIndex(c => c.key === task.status);
    const next = COLUMNS[idx + direction];
    if (!next) return;
    await fetch(`${BASE}/tasks/${task.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status: next.key }),
    });
    void load();
  };

  const saveTask = async () => {
    await fetch(`${BASE}/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...form, dueDate: form.dueDate || undefined }),
    });
    setShowTaskModal(false);
    void load();
  };

  const saveDeliverable = async () => {
    await fetch(`${BASE}/deliverables`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...delivForm, dueDate: delivForm.dueDate || undefined }),
    });
    setShowDelivModal(false);
    void load();
  };

  const updateDelivStatus = async (id: string, status: string) => {
    await fetch(`${BASE}/deliverables/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    void load();
  };

  const visible = filterProject ? tasks.filter(t => t.projectId === filterProject) : tasks;

  const delStatusColor: Record<string, string> = {
    PENDING: '#64748b', SUBMITTED: '#f59e0b', APPROVED: '#10b981', REJECTED: '#ef4444',
  };
  const delStatusLabel: Record<string, string> = {
    PENDING: 'Pendiente', SUBMITTED: 'Enviado', APPROVED: 'Aprobado', REJECTED: 'Rechazado',
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Tareas & Entregables</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Tablero Kanban de tareas por proyecto</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
            <option value=''>Todos los proyectos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <button onClick={() => setShowDelivModal(true)} style={{ background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>+ Entregable</button>
          <button onClick={() => setShowTaskModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>+ Tarea</button>
        </div>
      </div>

      {/* Kanban */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando tareas...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px', marginBottom: '32px' }}>
          {COLUMNS.map(col => {
            const colTasks = visible.filter(t => t.status === col.key);
            return (
              <div key={col.key} style={{ background: '#1e293b', borderRadius: '12px', border: `1px solid #334155`, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: col.color }} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{col.label}</span>
                  </div>
                  <span style={{ background: '#0f172a', borderRadius: '999px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, color: col.color }}>{colTasks.length}</span>
                </div>
                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '120px' }}>
                  {colTasks.map(task => (
                    <div key={task.id} style={{ background: '#0f172a', borderRadius: '10px', padding: '12px', border: '1px solid #1e293b' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>{task.title}</div>
                      {task.description && <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>{task.description}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 700, background: PRIORITY_COLORS[task.priority] + '22', color: PRIORITY_COLORS[task.priority] }}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                        {task.assignee && <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>👤 {task.assignee}</span>}
                        {task.dueDate && (
                          <span style={{ fontSize: '0.7rem', color: new Date(task.dueDate) < new Date() ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {new Date(task.dueDate) < new Date() && <AlertCircle size={11} />}
                            {new Date(task.dueDate).toLocaleDateString('es-CO')}
                          </span>
                        )}
                      </div>
                      {task.project && <div style={{ marginTop: '6px', fontSize: '0.7rem', color: task.project.color, opacity: 0.8 }}>📁 {task.project.title}</div>}
                      <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                        <button onClick={() => void moveTask(task, -1)} disabled={col.key === 'TODO'}
                          style={{ flex: 1, background: '#1e293b', border: 'none', color: '#94a3b8', cursor: col.key === 'TODO' ? 'not-allowed' : 'pointer', borderRadius: '5px', padding: '4px', opacity: col.key === 'TODO' ? 0.4 : 1 }}>
                          <ChevronLeft size={13} />
                        </button>
                        <button onClick={() => void moveTask(task, 1)} disabled={col.key === 'DONE'}
                          style={{ flex: 1, background: '#1e293b', border: 'none', color: '#94a3b8', cursor: col.key === 'DONE' ? 'not-allowed' : 'pointer', borderRadius: '5px', padding: '4px', opacity: col.key === 'DONE' ? 0.4 : 1 }}>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <div style={{ textAlign: 'center', color: '#334155', fontSize: '0.8rem', padding: '20px 0' }}>Sin tareas</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Entregables */}
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #334155', fontWeight: 600 }}>📦 Entregables {filterProject && '(proyecto seleccionado)'}</div>
        {deliverables.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '24px', fontSize: '0.875rem' }}>
            {filterProject ? 'Sin entregables para este proyecto.' : 'Selecciona un proyecto para ver sus entregables.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#64748b' }}>
                {['Nombre', 'Estado', 'Fecha entrega', 'Archivo', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliverables.map((d, i) => (
                <tr key={d.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#0f172a22' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 500 }}>{d.name}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: delStatusColor[d.status] + '22', color: delStatusColor[d.status] }}>
                      {delStatusLabel[d.status]}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{d.dueDate ? new Date(d.dueDate).toLocaleDateString('es-CO') : '—'}</td>
                  <td style={{ padding: '10px 16px' }}>{d.fileUrl ? <a href={d.fileUrl} target='_blank' rel='noreferrer' style={{ color: '#818cf8', textDecoration: 'none' }}>Ver →</a> : '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    <select value={d.status} onChange={e => void updateDelivStatus(d.id, e.target.value)}
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', color: '#e2e8f0', fontSize: '0.75rem' }}>
                      {['PENDING','SUBMITTED','APPROVED','REJECTED'].map(s => <option key={s} value={s}>{delStatusLabel[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Nueva Tarea</h2>
              <button onClick={() => setShowTaskModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Título *', key: 'title', type: 'text' },
                { label: 'Asignado a', key: 'assignee', type: 'text' },
                { label: 'Fecha límite', key: 'dueDate', type: 'date' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input type={f.type} value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Descripción</span>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Proyecto *</span>
                <select value={form.projectId} onChange={e => setForm(prev => ({ ...prev, projectId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Seleccionar proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Prioridad</span>
                <select value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowTaskModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void saveTask()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Crear Tarea</button>
            </div>
          </div>
        </div>
      )}

      {/* Deliverable Modal */}
      {showDelivModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Nuevo Entregable</h2>
              <button onClick={() => setShowDelivModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Nombre *', key: 'name', type: 'text' },
                { label: 'URL del archivo', key: 'fileUrl', type: 'url' },
                { label: 'Fecha de entrega', key: 'dueDate', type: 'date' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input type={f.type} value={(delivForm as Record<string, unknown>)[f.key] as string} onChange={e => setDelivForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Descripción</span>
                <textarea value={delivForm.description} onChange={e => setDelivForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Proyecto *</span>
                <select value={delivForm.projectId} onChange={e => setDelivForm(prev => ({ ...prev, projectId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Seleccionar proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowDelivModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void saveDeliverable()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
