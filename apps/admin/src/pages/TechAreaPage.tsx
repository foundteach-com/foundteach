import { useState } from 'react';
import {
  Laptop, GitBranch, Rocket, Bug, Globe,
  Plus, Trash2, X, ChevronDown, Clock,
  CheckCircle, AlertCircle, Circle, Loader,
  BarChart2, RefreshCw, ExternalLink,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const tok = () => localStorage.getItem('admin_token') || '';

interface Repo { id: string; name: string; url: string; branch: string; language: string; status: string; description?: string; lastCommit?: string; }
interface Deploy { id: string; service: string; environment: string; status: string; commitSha?: string; commitMsg?: string; deployedBy?: string; createdAt: string; }
interface BugItem { id: string; title: string; description?: string; priority: string; status: string; assignee?: string; reporter?: string; createdAt: string; }
interface Service { id: string; name: string; url: string; status: string; method: string; description?: string; lastChecked?: string; }

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtSha = (sha?: string) => sha ? sha.substring(0, 7) : '—';

const REPO_STATUS = { ACTIVE: { label: 'Activo', color: '#059669', bg: 'rgba(5,150,105,0.1)' }, ARCHIVED: { label: 'Archivado', color: '#64748b', bg: 'rgba(100,116,139,0.1)' }, DEPRECATED: { label: 'Obsoleto', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' } } as const;
const DEPLOY_STATUS = { SUCCESS: { label: 'Exitoso', color: '#059669', bg: 'rgba(5,150,105,0.1)' }, BUILDING: { label: 'Construyendo', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' }, FAILED: { label: 'Fallido', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }, CANCELLED: { label: 'Cancelado', color: '#64748b', bg: 'rgba(100,116,139,0.1)' } } as const;
const BUG_STATUS = { OPEN: { label: 'Abierto', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }, IN_PROGRESS: { label: 'En Progreso', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' }, RESOLVED: { label: 'Resuelto', color: '#059669', bg: 'rgba(5,150,105,0.1)' }, CLOSED: { label: 'Cerrado', color: '#64748b', bg: 'rgba(100,116,139,0.1)' } } as const;
const PRIORITY_MAP = { LOW: { label: 'Baja', color: '#64748b', bg: 'rgba(100,116,139,0.1)' }, MEDIUM: { label: 'Media', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }, HIGH: { label: 'Alta', color: '#f97316', bg: 'rgba(249,115,22,0.1)' }, CRITICAL: { label: 'Crítica', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' } } as const;
const SERVICE_STATUS = { UP: { label: 'Online', color: '#059669', bg: 'rgba(5,150,105,0.1)' }, DOWN: { label: 'Caído', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }, DEGRADED: { label: 'Degradado', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }, UNKNOWN: { label: 'Desconocido', color: '#64748b', bg: 'rgba(100,116,139,0.1)' } } as const;

type StatusMap = Record<string, { label: string; color: string; bg: string }>;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ value, map }: { value: string; map: StatusMap }) {
  const s = map[value] ?? { label: value, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  return <span style={{ fontSize: '0.71rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, color: s.color, background: s.bg }}>{s.label}</span>;
}

function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: React.ComponentType<{ size?: number }>; color: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s,box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
      <div style={{ width: 50, height: 50, borderRadius: 13, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={22} /></div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number }>; text: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
      <Icon size={32} /><p style={{ marginTop: 12, fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

function TechModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
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

function TF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="form-group"><label className="form-label">{label}</label>{children}</div>;
}

function Sel({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={e => onChange(e.target.value)} className="form-input" style={{ appearance: 'none', paddingRight: 32 }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', display: 'flex' }}><ChevronDown size={14} /></span>
    </div>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>{loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader size={15} />Guardando…</span> : label}</button>;
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ repos, deploys, bugs, services }: { repos: Repo[]; deploys: Deploy[]; bugs: BugItem[]; services: Service[] }) {
  const services_up = services.filter(s => s.status === 'UP').length;
  const open_bugs = bugs.filter(b => b.status === 'OPEN').length;
  const recent_deploys = deploys.filter(d => d.status === 'SUCCESS').length;

  const LANG_COLORS: Record<string, string> = { TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584', CSS: '#563d7c', HTML: '#e34c26' };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Repositorios"        value={repos.length}    sub="en el monorepo"         icon={GitBranch} color="#2563eb" />
        <KpiCard label="Servicios Online"    value={`${services_up}/${services.length}`} sub="uptime actual" icon={Globe}     color="#059669" />
        <KpiCard label="Bugs Abiertos"       value={open_bugs}       sub={`de ${bugs.length} total`}    icon={Bug}       color="#ef4444" />
        <KpiCard label="Deploys Exitosos"    value={recent_deploys}  sub={`de ${deploys.length} total`}  icon={Rocket}    color="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Estado de Servicios</h3>
          {services.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin servicios registrados.</p>
            : services.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'UP' ? '#059669' : s.status === 'DOWN' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>{s.name}</span>
                </div>
                <Badge value={s.status} map={SERVICE_STATUS as unknown as StatusMap} />
              </div>
            ))}
        </div>

        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Últimos Deploys</h3>
          {deploys.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin historial de deploys.</p>
            : deploys.slice(0, 5).map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ marginTop: 2 }}>
                  {d.status === 'SUCCESS' ? <CheckCircle size={14} color="#059669" /> : d.status === 'FAILED' ? <AlertCircle size={14} color="#ef4444" /> : d.status === 'BUILDING' ? <Loader size={14} color="#2563eb" /> : <Circle size={14} color="#64748b" />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.service}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                    <span>{d.environment}</span>
                    {d.commitSha && <span style={{ fontFamily: 'monospace' }}>{fmtSha(d.commitSha)}</span>}
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Clock size={10} />{fmtDate(d.createdAt)}</span>
                  </div>
                </div>
                <Badge value={d.status} map={DEPLOY_STATUS as unknown as StatusMap} />
              </div>
            ))}
        </div>
      </div>

      {repos.length > 0 && (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24, marginTop: 18 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Stack Tecnológico</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[...new Set(repos.map(r => r.language).filter(Boolean))].map(lang => (
              <div key={lang} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, background: 'var(--background-color)', border: '1px solid var(--border-color)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: LANG_COLORS[lang] || '#64748b' }} />
                <span style={{ fontSize: '0.83rem', fontWeight: 600 }}>{lang}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({repos.filter(r => r.language === lang).length})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Repos Tab ────────────────────────────────────────────────────────────────
function ReposTab({ repos, setRepos }: { repos: Repo[]; setRepos: React.Dispatch<React.SetStateAction<Repo[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', branch: 'main', language: 'TypeScript', status: 'ACTIVE', description: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tech/repos`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` }, body: JSON.stringify(form) });
      if (res.ok) { const data = await res.json(); setRepos(p => [data, ...p]); setModal(false); setForm({ name: '', url: '', branch: 'main', language: 'TypeScript', status: 'ACTIVE', description: '' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar repositorio?')) return;
    await fetch(`${API_URL}/api/tech/repos/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` } });
    setRepos(p => p.filter(x => x.id !== id));
  };

  const LANG_COLORS: Record<string, string> = { TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584', CSS: '#563d7c', HTML: '#e34c26' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{repos.length} repositorio{repos.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Nuevo Repositorio
        </button>
      </div>

      {repos.length === 0 ? <EmptyState icon={GitBranch} text="No hay repositorios registrados." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
          {repos.map(r => (
            <div key={r.id} style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: 20, transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.07)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = ''}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{r.name}</div>
                  {r.description && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{r.description}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {r.url && <a href={r.url} target="_blank" rel="noreferrer" style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(37,99,235,0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ExternalLink size={12} /></a>}
                  <button onClick={() => handleDelete(r.id)} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={12} /></button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {r.language && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', fontWeight: 600 }}>
                    <div style={{ width: 9, height: 9, borderRadius: 3, background: LANG_COLORS[r.language] || '#64748b' }} />{r.language}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  <GitBranch size={11} />{r.branch}
                </div>
                <Badge value={r.status} map={REPO_STATUS as unknown as StatusMap} />
              </div>
              {r.lastCommit && <div style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} />Último commit: {r.lastCommit}</div>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TechModal title="Nuevo Repositorio" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <TF label="Nombre"><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></TF>
            <TF label="URL del repo"><input className="form-input" value={form.url} placeholder="https://github.com/..." onChange={e => setForm(p => ({ ...p, url: e.target.value }))} /></TF>
            <TF label="Descripción"><textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} /></TF>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TF label="Rama principal"><input className="form-input" value={form.branch} onChange={e => setForm(p => ({ ...p, branch: e.target.value }))} /></TF>
              <TF label="Lenguaje"><Sel value={form.language} onChange={v => setForm(p => ({ ...p, language: v }))} options={['TypeScript','JavaScript','Python','Go','Rust','CSS','HTML','Otro'].map(l => ({ value: l, label: l }))} /></TF>
            </div>
            <TF label="Estado"><Sel value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(REPO_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></TF>
            <SubmitBtn loading={saving} label="Crear Repositorio" />
          </form>
        </TechModal>
      )}
    </div>
  );
}

// ─── Deploys Tab ──────────────────────────────────────────────────────────────
function DeploysTab({ deploys, setDeploys }: { deploys: Deploy[]; setDeploys: React.Dispatch<React.SetStateAction<Deploy[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({ service: '', environment: 'production', status: 'SUCCESS', commitSha: '', commitMsg: '', deployedBy: '' });

  const filtered = filter === 'ALL' ? deploys : deploys.filter(d => d.status === filter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tech/deployments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` }, body: JSON.stringify(form) });
      if (res.ok) { const data = await res.json(); setDeploys(p => [data, ...p]); setModal(false); setForm({ service: '', environment: 'production', status: 'SUCCESS', commitSha: '', commitMsg: '', deployedBy: '' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar registro?')) return;
    await fetch(`${API_URL}/api/tech/deployments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` } });
    setDeploys(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', ...Object.keys(DEPLOY_STATUS)].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, background: filter === s ? 'var(--primary-color)' : 'var(--surface-color)', color: filter === s ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-color)', transition: 'all 0.15s' }}>
              {s === 'ALL' ? 'Todos' : (DEPLOY_STATUS as unknown as StatusMap)[s]?.label ?? s}
            </button>
          ))}
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Registrar Deploy
        </button>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Rocket} text="No hay deploys para este filtro." /> : (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background-color)' }}>
                {['Servicio', 'Ambiente', 'Commit', 'Desplegado por', 'Fecha', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--background-color)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.service}</div>
                    {d.commitMsg && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.commitMsg}</div>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, padding: '3px 9px', borderRadius: 8, background: d.environment === 'production' ? 'rgba(124,58,237,0.1)' : 'rgba(37,99,235,0.1)', color: d.environment === 'production' ? '#7c3aed' : '#2563eb' }}>{d.environment}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{fmtSha(d.commitSha)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>{d.deployedBy || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{fmtDate(d.createdAt)}</td>
                  <td style={{ padding: '12px 16px' }}><Badge value={d.status} map={DEPLOY_STATUS as unknown as StatusMap} /></td>
                  <td style={{ padding: '12px 16px' }}><button onClick={() => handleDelete(d.id)} style={{ color: '#ef4444', padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <TechModal title="Registrar Deploy" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <TF label="Servicio"><input className="form-input" value={form.service} onChange={e => setForm(p => ({ ...p, service: e.target.value }))} required placeholder="admin, api, web…" /></TF>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TF label="Ambiente"><Sel value={form.environment} onChange={v => setForm(p => ({ ...p, environment: v }))} options={[{ value: 'production', label: 'Production' }, { value: 'staging', label: 'Staging' }, { value: 'development', label: 'Development' }]} /></TF>
              <TF label="Estado"><Sel value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(DEPLOY_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></TF>
            </div>
            <TF label="Commit SHA"><input className="form-input" value={form.commitSha} onChange={e => setForm(p => ({ ...p, commitSha: e.target.value }))} placeholder="abc1234…" style={{ fontFamily: 'monospace' }} /></TF>
            <TF label="Mensaje del commit"><input className="form-input" value={form.commitMsg} onChange={e => setForm(p => ({ ...p, commitMsg: e.target.value }))} /></TF>
            <TF label="Desplegado por"><input className="form-input" value={form.deployedBy} onChange={e => setForm(p => ({ ...p, deployedBy: e.target.value }))} /></TF>
            <SubmitBtn loading={saving} label="Registrar" />
          </form>
        </TechModal>
      )}
    </div>
  );
}

// ─── Bugs Tab ─────────────────────────────────────────────────────────────────
function BugsTab({ bugs, setBugs }: { bugs: BugItem[]; setBugs: React.Dispatch<React.SetStateAction<BugItem[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'OPEN', assignee: '', reporter: '' });

  const filtered = filter === 'ALL' ? bugs : bugs.filter(b => b.status === filter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tech/bugs`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` }, body: JSON.stringify(form) });
      if (res.ok) { const data = await res.json(); setBugs(p => [data, ...p]); setModal(false); setForm({ title: '', description: '', priority: 'MEDIUM', status: 'OPEN', assignee: '', reporter: '' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar bug?')) return;
    await fetch(`${API_URL}/api/tech/bugs/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` } });
    setBugs(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['ALL', ...Object.keys(BUG_STATUS)].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, background: filter === s ? 'var(--primary-color)' : 'var(--surface-color)', color: filter === s ? 'white' : 'var(--text-muted)', border: '1px solid var(--border-color)', transition: 'all 0.15s' }}>
              {s === 'ALL' ? 'Todos' : (BUG_STATUS as unknown as StatusMap)[s]?.label ?? s}
            </button>
          ))}
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Reportar Bug
        </button>
      </div>

      {filtered.length === 0 ? <EmptyState icon={Bug} text="No hay bugs para este filtro. ¡Buen trabajo! 🎉" /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(b => (
            <div key={b.id} style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = ''}>
              <div style={{ marginTop: 2 }}>
                {b.status === 'OPEN' ? <AlertCircle size={18} color="#ef4444" /> : b.status === 'IN_PROGRESS' ? <Loader size={18} color="#2563eb" /> : b.status === 'RESOLVED' ? <CheckCircle size={18} color="#059669" /> : <Circle size={18} color="#64748b" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{b.title}</div>
                {b.description && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{b.description}</div>}
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {b.reporter && <span>Reportado por: <strong>{b.reporter}</strong></span>}
                  {b.assignee && <span>Asignado: <strong>{b.assignee}</strong></span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} />{fmtDate(b.createdAt)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <Badge value={b.status} map={BUG_STATUS as unknown as StatusMap} />
                <Badge value={b.priority} map={PRIORITY_MAP as unknown as StatusMap} />
                <button onClick={() => handleDelete(b.id)} style={{ color: '#ef4444', padding: 4, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <TechModal title="Reportar Bug" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <TF label="Título"><input className="form-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></TF>
            <TF label="Descripción"><textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} /></TF>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TF label="Prioridad"><Sel value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))} options={Object.entries(PRIORITY_MAP).map(([k, v]) => ({ value: k, label: v.label }))} /></TF>
              <TF label="Estado"><Sel value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(BUG_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></TF>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TF label="Reportado por"><input className="form-input" value={form.reporter} onChange={e => setForm(p => ({ ...p, reporter: e.target.value }))} /></TF>
              <TF label="Asignado a"><input className="form-input" value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))} /></TF>
            </div>
            <SubmitBtn loading={saving} label="Reportar Bug" />
          </form>
        </TechModal>
      )}
    </div>
  );
}

// ─── Services Tab ─────────────────────────────────────────────────────────────
function ServicesTab({ services, setServices }: { services: Service[]; setServices: React.Dispatch<React.SetStateAction<Service[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', method: 'GET', status: 'UP', description: '' });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/tech/services`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` }, body: JSON.stringify(form) });
      if (res.ok) { const data = await res.json(); setServices(p => [data, ...p]); setModal(false); setForm({ name: '', url: '', method: 'GET', status: 'UP', description: '' }); }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar servicio?')) return;
    await fetch(`${API_URL}/api/tech/services/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` } });
    setServices(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{services.length} servicio{services.length !== 1 ? 's' : ''} registrado{services.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Nuevo Servicio
        </button>
      </div>

      {services.length === 0 ? <EmptyState icon={Globe} text="No hay servicios registrados." /> : (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background-color)' }}>
                {['Servicio', 'URL', 'Método', 'Estado', 'Último chequeo', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {services.map((s, i) => (
                <tr key={s.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--background-color)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.status === 'UP' ? '#059669' : s.status === 'DOWN' ? '#ef4444' : '#f59e0b', flexShrink: 0, boxShadow: `0 0 0 3px ${s.status === 'UP' ? 'rgba(5,150,105,0.2)' : s.status === 'DOWN' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{s.name}</div>
                        {s.description && <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{s.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', color: 'var(--primary-color)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {s.url.length > 35 ? s.url.substring(0, 35) + '…' : s.url}<ExternalLink size={11} />
                    </a>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 6, background: 'var(--background-color)', border: '1px solid var(--border-color)' }}>{s.method}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}><Badge value={s.status} map={SERVICE_STATUS as unknown as StatusMap} /></td>
                  <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.lastChecked ? fmtDate(s.lastChecked) : '—'}</td>
                  <td style={{ padding: '12px 16px' }}><button onClick={() => handleDelete(s.id)} style={{ color: '#ef4444', padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <TechModal title="Nuevo Servicio" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <TF label="Nombre"><input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="API principal, Auth service…" /></TF>
            <TF label="URL"><input className="form-input" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} required placeholder="https://api.foundteach.com/health" /></TF>
            <TF label="Descripción"><textarea className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ resize: 'vertical' }} /></TF>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TF label="Método HTTP"><Sel value={form.method} onChange={v => setForm(p => ({ ...p, method: v }))} options={['GET','POST','PUT','DELETE','HEAD'].map(m => ({ value: m, label: m }))} /></TF>
              <TF label="Estado"><Sel value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={Object.entries(SERVICE_STATUS).map(([k, v]) => ({ value: k, label: v.label }))} /></TF>
            </div>
            <SubmitBtn loading={saving} label="Crear Servicio" />
          </form>
        </TechModal>
      )}
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Resumen',        icon: BarChart2 },
  { id: 'repos',     label: 'Repositorios',    icon: GitBranch },
  { id: 'deploys',   label: 'Deployments',     icon: Rocket },
  { id: 'bugs',      label: 'Bugs',            icon: Bug },
  { id: 'services',  label: 'Servicios',       icon: Globe },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export function TechAreaPage() {
  const [activeTab, setActiveTab]   = useState('overview');
  const [repos,       setRepos]     = useState<Repo[]>([]);
  const [deploys,     setDeploys]   = useState<Deploy[]>([]);
  const [bugs,        setBugs]      = useState<BugItem[]>([]);
  const [services,    setServices]  = useState<Service[]>([]);
  const [loaded,      setLoaded]    = useState(false);
  const [loading,     setLoading]   = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${tok()}` };
      const [rR, rD, rB, rS] = await Promise.all([
        fetch(`${API_URL}/api/tech/repos`,       { headers }),
        fetch(`${API_URL}/api/tech/deployments`, { headers }),
        fetch(`${API_URL}/api/tech/bugs`,        { headers }),
        fetch(`${API_URL}/api/tech/services`,    { headers }),
      ]);
      if (rR.ok) setRepos(await rR.json());
      if (rD.ok) setDeploys(await rD.json());
      if (rB.ok) setBugs(await rB.json());
      if (rS.ok) setServices(await rS.json());
    } catch { /* ignore */ }
    setLoading(false);
    setLoaded(true);
  };

  const renderTab = () => {
    if (!loaded) return (
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 48, textAlign: 'center' }}>
        <Laptop size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.35 }} />
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Área Tecnológica</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Gestiona repos, deployments, bugs y servicios web.</p>
        <button onClick={loadData} disabled={loading} style={{ padding: '10px 28px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>
          {loading ? 'Cargando…' : 'Cargar Datos'}
        </button>
      </div>
    );
    switch (activeTab) {
      case 'overview':  return <OverviewTab repos={repos} deploys={deploys} bugs={bugs} services={services} />;
      case 'repos':     return <ReposTab repos={repos} setRepos={setRepos} />;
      case 'deploys':   return <DeploysTab deploys={deploys} setDeploys={setDeploys} />;
      case 'bugs':      return <BugsTab bugs={bugs} setBugs={setBugs} />;
      case 'services':  return <ServicesTab services={services} setServices={setServices} />;
      default:          return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Laptop size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área Tecnológica</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Repositorios, deployments, bugs y servicios web</p>
        </div>
        {loaded && (
          <button onClick={loadData} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-color)' }}>
            <RefreshCw size={13} /> Actualizar
          </button>
        )}
      </div>

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
