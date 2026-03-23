import { useState, useEffect, useCallback } from 'react';
import { X, Rocket } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/dev`;

interface Repo { id: string; name: string; }
interface Deployment {
  id: string; version: string; environment: string; status: string;
  notes?: string; deployedBy?: string; deployedAt: string;
  repoId: string; repository?: { id: string; name: string };
}

const ENV_COLORS: Record<string, string> = { DEV: '#64748b', STAGING: '#f59e0b', PROD: '#10b981' };
const STATUS_COLORS: Record<string, string> = {
  SUCCESS: '#10b981', FAILED: '#ef4444', IN_PROGRESS: '#60a5fa', ROLLED_BACK: '#f97316',
};
const STATUS_LABELS: Record<string, string> = {
  SUCCESS: 'Exitoso', FAILED: 'Fallido', IN_PROGRESS: 'En progreso', ROLLED_BACK: 'Revertido',
};

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterRepo, setFilterRepo] = useState('');
  const [filterEnv, setFilterEnv] = useState('');
  const [form, setForm] = useState({ version: '', environment: 'PROD', status: 'IN_PROGRESS', repoId: '', notes: '', deployedBy: '', deployedAt: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL(`${BASE}/deployments`);
      if (filterRepo) url.searchParams.set('repoId', filterRepo);
      if (filterEnv) url.searchParams.set('environment', filterEnv);
      const [dRes, rRes] = await Promise.all([
        fetch(url.toString(), { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/repos`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (dRes.ok) setDeployments(await dRes.json());
      if (rRes.ok) setRepos(await rRes.json());
    } finally { setLoading(false); }
  }, [filterRepo, filterEnv]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    await fetch(`${BASE}/deployments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...form, deployedAt: form.deployedAt || undefined }),
    });
    setShowModal(false);
    void load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${BASE}/deployments/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    void load();
  };

  const successCount = deployments.filter(d => d.status === 'SUCCESS').length;
  const failedCount = deployments.filter(d => d.status === 'FAILED').length;
  const inProgressCount = deployments.filter(d => d.status === 'IN_PROGRESS').length;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Deployments</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Historial de despliegues por ambiente</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
          + Registrar Deploy
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: deployments.length, color: '#818cf8' },
          { label: 'Exitosos', value: successCount, color: '#10b981' },
          { label: 'Fallidos', value: failedCount, color: '#ef4444' },
          { label: 'En curso', value: inProgressCount, color: '#60a5fa' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterRepo} onChange={e => setFilterRepo(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los repos</option>
          {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={filterEnv} onChange={e => setFilterEnv(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los ambientes</option>
          {['DEV','STAGING','PROD'].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Timeline */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando deployments...</div>
      ) : deployments.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>
          <Rocket size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No hay deployments registrados.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {deployments.map(d => (
            <div key={d.id} style={{ background: '#1e293b', borderRadius: '10px', border: `1px solid ${STATUS_COLORS[d.status]}33`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[d.status], flexShrink: 0, boxShadow: d.status === 'IN_PROGRESS' ? `0 0 8px ${STATUS_COLORS[d.status]}` : 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.95rem' }}>{d.version}</span>
                  <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: ENV_COLORS[d.environment] + '33', color: ENV_COLORS[d.environment] }}>{d.environment}</span>
                  <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: STATUS_COLORS[d.status] + '22', color: STATUS_COLORS[d.status] }}>{STATUS_LABELS[d.status]}</span>
                  {d.repository && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📦 {d.repository.name}</span>}
                  {d.deployedBy && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>👤 {d.deployedBy}</span>}
                </div>
                {d.notes && <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{d.notes}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(d.deployedAt).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <select value={d.status} onChange={e => void updateStatus(d.id, e.target.value)}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', color: '#e2e8f0', fontSize: '0.75rem' }}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Registrar Deployment</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Versión / Tag *', key: 'version', type: 'text', placeholder: 'v1.3.0 o commit sha' },
                { label: 'Desplegado por', key: 'deployedBy', type: 'text', placeholder: 'Nombre' },
                { label: 'Fecha (opcional)', key: 'deployedAt', type: 'datetime-local' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input type={f.type} placeholder={(f as { placeholder?: string }).placeholder} value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Notas</span>
                <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} rows={2}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Ambiente</span>
                  <select value={form.environment} onChange={e => setForm(prev => ({ ...prev, environment: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {['DEV','STAGING','PROD'].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Estado inicial</span>
                  <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
