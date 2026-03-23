import { useState, useEffect, useCallback } from 'react';
import { GitBranch, ExternalLink, X, RefreshCw, Package } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/dev`;

interface Project { id: string; title: string; }
interface Repo {
  id: string; name: string; url?: string; language?: string; description?: string;
  defaultBranch: string; isActive: boolean; projectId?: string;
  project?: { id: string; title: string };
  _count?: { deployments: number; bugs: number };
}
interface GithubData {
  name?: string; description?: string; language?: string; stars?: number;
  forks?: number; openIssues?: number; pushedAt?: string; branches?: string[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5',
  Rust: '#dea584', Go: '#00ADD8', Java: '#b07219', PHP: '#4F5D95',
  CSS: '#563d7c', HTML: '#e34c26', Dart: '#00B4AB',
};

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function ReposPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Repo | null>(null);
  const [ghData, setGhData] = useState<Record<string, GithubData>>({});
  const [syncing, setSyncing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', url: '', language: '', description: '', defaultBranch: 'main', projectId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        fetch(`${BASE}/repos`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API_URL}/api/ops/projects`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (rRes.ok) setRepos(await rRes.json());
      if (pRes.ok) setProjects(await pRes.json());
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const syncGitHub = async (repo: Repo) => {
    if (!repo.url) return;
    setSyncing(repo.id);
    try {
      const res = await fetch(`${BASE}/repos/${repo.id}/github`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) {
        const data = await res.json() as GithubData;
        setGhData(prev => ({ ...prev, [repo.id]: data }));
      }
    } finally { setSyncing(null); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', url: '', language: '', description: '', defaultBranch: 'main', projectId: '' });
    setShowModal(true);
  };
  const openEdit = (r: Repo) => {
    setEditing(r);
    setForm({ name: r.name, url: r.url ?? '', language: r.language ?? '', description: r.description ?? '', defaultBranch: r.defaultBranch, projectId: r.projectId ?? '' });
    setShowModal(true);
  };

  const save = async () => {
    const url = editing ? `${BASE}/repos/${editing.id}` : `${BASE}/repos`;
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ ...form, projectId: form.projectId || undefined }) });
    if (res.ok) { setShowModal(false); void load(); }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Repositorios</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Registro de repositorios con sincronización GitHub</p>
        </div>
        <button onClick={openCreate} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
          + Nuevo Repo
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '14px', marginBottom: '24px' }}>
        {[
          { label: 'Total repos', value: repos.length, color: '#818cf8' },
          { label: 'Activos', value: repos.filter(r => r.isActive).length, color: '#34d399' },
          { label: 'Deployments', value: repos.reduce((s, r) => s + (r._count?.deployments ?? 0), 0), color: '#60a5fa' },
          { label: 'Bugs abiertos', value: repos.reduce((s, r) => s + (r._count?.bugs ?? 0), 0), color: '#f87171' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Repo Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando repositorios...</div>
      ) : repos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>
          <GitBranch size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No hay repositorios registrados.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '14px' }}>
          {repos.map(repo => {
            const gh = ghData[repo.id];
            const lang = gh?.language ?? repo.language;
            return (
              <div key={repo.id} style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>{repo.name}</span>
                      {lang && <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: (LANG_COLORS[lang] ?? '#64748b') + '33', color: LANG_COLORS[lang] ?? '#94a3b8' }}>{lang}</span>}
                      {!repo.isActive && <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', background: '#ef444422', color: '#ef4444' }}>Inactivo</span>}
                      {repo.project && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>📁 {repo.project.title}</span>}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>{gh?.description ?? repo.description ?? 'Sin descripción'}</div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GitBranch size={12} /> {repo.defaultBranch}</span>
                      {gh?.stars !== undefined && <span>⭐ {gh.stars}</span>}
                      {gh?.forks !== undefined && <span>🍴 {gh.forks}</span>}
                      {gh?.openIssues !== undefined && <span>🐛 {gh.openIssues} issues</span>}
                      {gh?.pushedAt && <span>🚀 {new Date(gh.pushedAt).toLocaleDateString('es-CO')}</span>}
                      <span><Package size={12} style={{ display: 'inline' }} /> {repo._count?.deployments ?? 0} deploys · {repo._count?.bugs ?? 0} bugs</span>
                    </div>
                    {gh?.branches && <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {gh.branches.slice(0, 5).map(b => <span key={b} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '5px', padding: '2px 8px', fontSize: '0.7rem', color: '#818cf8' }}>{b}</span>)}
                      {gh.branches.length > 5 && <span style={{ fontSize: '0.7rem', color: '#64748b' }}>+{gh.branches.length - 5} más</span>}
                    </div>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                    {repo.url && <a href={repo.url} target='_blank' rel='noreferrer' style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '7px', padding: '6px 10px', color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}><ExternalLink size={13} /> GitHub</a>}
                    {repo.url?.includes('github.com') && (
                      <button onClick={() => void syncGitHub(repo)} disabled={syncing === repo.id}
                        style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '7px', padding: '6px 10px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                        <RefreshCw size={13} style={{ animation: syncing === repo.id ? 'spin 1s linear infinite' : 'none' }} /> Sync
                      </button>
                    )}
                    <button onClick={() => openEdit(repo)} style={{ background: '#334155', border: 'none', borderRadius: '7px', padding: '6px 12px', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.75rem' }}>Editar</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>{editing ? 'Editar Repo' : 'Nuevo Repositorio'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              {[
                { label: 'Nombre *', key: 'name', type: 'text', placeholder: 'foundteach-api' },
                { label: 'URL GitHub/GitLab', key: 'url', type: 'url', placeholder: 'https://github.com/org/repo' },
                { label: 'Lenguaje', key: 'language', type: 'text', placeholder: 'TypeScript' },
                { label: 'Rama por defecto', key: 'defaultBranch', type: 'text', placeholder: 'main' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input type={f.type} placeholder={f.placeholder} value={(form as Record<string, unknown>)[f.key] as string} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Descripción</span>
                <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} rows={2}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Proyecto vinculado</span>
                <select value={form.projectId} onChange={e => setForm(prev => ({ ...prev, projectId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Sin proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
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
