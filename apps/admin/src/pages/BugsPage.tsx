import { useState, useEffect, useCallback } from 'react';
import { Bug, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/dev`;

interface Repo { id: string; name: string; }
interface Project { id: string; title: string; }
interface BugItem {
  id: string; title: string; description?: string; severity: string;
  status: string; assignee?: string; labels?: string; createdAt: string;
  repoId: string; projectId?: string;
  repository?: { id: string; name: string };
  project?: { id: string; title: string };
}

const SEV_COLORS: Record<string, string> = {
  LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: '#60a5fa', IN_PROGRESS: '#f59e0b', FIXED: '#10b981', WONT_FIX: '#64748b', CLOSED: '#334155',
};
const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Abierto', IN_PROGRESS: 'En progreso', FIXED: 'Corregido', WONT_FIX: 'No se corregirá', CLOSED: 'Cerrado',
};
const SEV_LABELS: Record<string, string> = {
  LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
};

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function BugsPage() {
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterRepo, setFilterRepo] = useState('');
  const [filterSev, setFilterSev] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ title: '', description: '', severity: 'MEDIUM', repoId: '', projectId: '', assignee: '', stepsToReproduce: '', labels: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE}/bugs`);
      if (filterRepo) url.searchParams.set('repoId', filterRepo);
      if (filterSev) url.searchParams.set('severity', filterSev);
      if (filterStatus) url.searchParams.set('status', filterStatus);
      const [bRes, rRes, pRes] = await Promise.all([
        fetch(url.toString(), { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/repos`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API_URL}/api/ops/projects`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (bRes.ok) setBugs(await bRes.json());
      if (rRes.ok) setRepos(await rRes.json());
      if (pRes.ok) setProjects(await pRes.json());
    } finally { setLoading(false); }
  }, [filterRepo, filterSev, filterStatus]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    await fetch(`${BASE}/bugs`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...form, projectId: form.projectId || undefined }),
    });
    setShowModal(false);
    void load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${BASE}/bugs/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    void load();
  };

  const openCount = bugs.filter(b => b.status === 'OPEN').length;
  const criticalCount = bugs.filter(b => b.severity === 'CRITICAL').length;
  const fixedCount = bugs.filter(b => b.status === 'FIXED').length;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Gestión de Bugs</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Issue tracker interno por repositorio</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
          + Reportar Bug
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: bugs.length, color: '#818cf8' },
          { label: 'Abiertos', value: openCount, color: '#60a5fa' },
          { label: 'Críticos', value: criticalCount, color: '#ef4444' },
          { label: 'Corregidos', value: fixedCount, color: '#10b981' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { value: filterRepo, set: setFilterRepo, placeholder: 'Todos los repos', options: repos.map(r => ({ k: r.id, v: r.name })) },
          { value: filterSev, set: setFilterSev, placeholder: 'Toda severidad', options: Object.entries(SEV_LABELS).map(([k, v]) => ({ k, v })) },
          { value: filterStatus, set: setFilterStatus, placeholder: 'Todo estado', options: Object.entries(STATUS_LABELS).map(([k, v]) => ({ k, v })) },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={e => f.set(e.target.value)}
            style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
            <option value=''>{f.placeholder}</option>
            {f.options.map(o => <option key={o.k} value={o.k}>{o.v}</option>)}
          </select>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando bugs...</div>
        ) : bugs.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
            <Bug size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No hay bugs registrados. ¡Todo verde! 🟢</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#64748b' }}>
                {['Título', 'Severidad', 'Estado', 'Repo', 'Asignado', 'Labels', 'Fecha', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bugs.map((b, i) => (
                <tr key={b.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 500 }}>
                    <div>{b.title}</div>
                    {b.description && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{b.description.slice(0, 55)}{b.description.length > 55 ? '…' : ''}</div>}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: SEV_COLORS[b.severity] + '22', color: SEV_COLORS[b.severity] }}>
                      {SEV_LABELS[b.severity]}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '3px 9px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: STATUS_COLORS[b.status] + '22', color: STATUS_COLORS[b.status] }}>
                      {STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', color: '#94a3b8', fontSize: '0.8rem' }}>{b.repository?.name ?? '—'}</td>
                  <td style={{ padding: '11px 14px', color: '#94a3b8' }}>{b.assignee ?? '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    {b.labels ? b.labels.split(',').map(l => (
                      <span key={l} style={{ background: '#334155', borderRadius: '4px', padding: '1px 6px', fontSize: '0.7rem', marginRight: '3px', color: '#94a3b8' }}>{l.trim()}</span>
                    )) : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(b.createdAt).toLocaleDateString('es-CO')}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <select value={b.status} onChange={e => void updateStatus(b.id, e.target.value)}
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
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Reportar Bug</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Título *', key: 'title', type: 'text' },
                { label: 'Asignado a', key: 'assignee', type: 'text' },
                { label: 'Labels (separadas por coma)', key: 'labels', type: 'text', placeholder: 'ui, auth, performance' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input type={f.type} placeholder={(f as { placeholder?: string }).placeholder} value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Descripción</span>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Pasos para reproducir</span>
                <textarea value={form.stepsToReproduce} onChange={e => setForm(prev => ({ ...prev, stepsToReproduce: e.target.value }))} rows={2}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Repositorio *</span>
                <select value={form.repoId} onChange={e => setForm(prev => ({ ...prev, repoId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Seleccionar repo</option>
                  {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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
                <span style={{ color: '#94a3b8' }}>Severidad</span>
                <select value={form.severity} onChange={e => setForm(prev => ({ ...prev, severity: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  {Object.entries(SEV_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Reportar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
