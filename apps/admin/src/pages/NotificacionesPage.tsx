import { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, Plus, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/comms`;
const token = () => localStorage.getItem('foundteach_token') ?? '';

interface Notification {
  id: string; title: string; message: string; type: string;
  module?: string; linkUrl?: string; isRead: boolean; createdAt: string;
}

const TYPE_C: Record<string, string>  = { ALERT: '#ef4444', INFO: '#60a5fa', WARNING: '#f59e0b', SUCCESS: '#10b981' };
const TYPE_L: Record<string, string>  = { ALERT: '🚨 Alerta', INFO: 'ℹ️ Info', WARNING: '⚠️ Aviso', SUCCESS: '✅ Éxito' };
const MOD_I: Record<string, string>   = { finance: '💰', ops: '⚙️', edu: '📚', hcm: '👥', crm: '🤝', dev: '🛠️', system: '🔔' };

const EMPTY_FORM = { title: '', message: '', type: 'INFO', module: '', linkUrl: '' };

export function NotificacionesPage() {
  const [notifs, setNotifs]     = useState<Notification[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all' | 'unread' | string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filter === 'unread' ? `${BASE}/notifications?unread=true` : `${BASE}/notifications`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setNotifs(await res.json() as Notification[]);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { void load(); }, [load]);

  const markRead = async (id: string) => {
    await fetch(`${BASE}/notifications/${id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token()}` } });
    setNotifs(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    await fetch(`${BASE}/notifications/read-all`, { method: 'PUT', headers: { Authorization: `Bearer ${token()}` } });
    setNotifs(p => p.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotif = async (id: string) => {
    await fetch(`${BASE}/notifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    setNotifs(p => p.filter(n => n.id !== id));
  };

  const createNotif = async () => {
    await fetch(`${BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form),
    });
    setShowModal(false); setForm(EMPTY_FORM); void load();
  };

  const displayed = filter === 'all' || filter === 'unread'
    ? notifs
    : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.isRead).length;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              Notificaciones
            </h1>
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#fff', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', lineHeight: 1.5 }}>{unreadCount}</span>
            )}
          </div>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Centro de notificaciones del sistema</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {unreadCount > 0 && (
            <button onClick={() => void markAllRead()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#1e293b', border: '1px solid #334155', color: '#94a3b8', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '0.82rem' }}>
              <CheckCheck size={14} /> Marcar todo leído
            </button>
          )}
          <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#818cf8,#6366f1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
            <Plus size={15} /> Nueva
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
        {(['all', 'unread', 'ALERT', 'WARNING', 'INFO', 'SUCCESS'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ background: filter === f ? '#6366f1' : '#1e293b', border: `1px solid ${filter === f ? '#6366f1' : '#334155'}`, color: filter === f ? '#fff' : '#94a3b8', borderRadius: '999px', padding: '5px 14px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s' }}>
            {f === 'all' ? 'Todas' : f === 'unread' ? `No leídas (${unreadCount})` : TYPE_L[f]}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px' }}>Cargando notificaciones...</div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', background: '#1e293b', borderRadius: '16px', border: '1px dashed #334155' }}>
          <Bell size={52} style={{ opacity: 0.15, marginBottom: '14px', display: 'block', margin: '0 auto 14px' }} />
          <p style={{ color: '#475569', fontSize: '1rem', fontWeight: 500 }}>
            {filter === 'unread' ? '¡Todo al día! Sin notificaciones pendientes 🎉' : 'No hay notificaciones.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayed.map(n => {
            const c = TYPE_C[n.type] ?? '#64748b';
            return (
              <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: n.isRead ? '#1e293b' : '#1e2d3d', borderRadius: '12px', border: `1px solid ${n.isRead ? '#334155' : c + '55'}`, padding: '14px 18px', transition: 'all 0.15s' }}>
                {/* Module icon */}
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: c + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                  {MOD_I[n.module ?? 'system'] ?? '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {!n.isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: c, flexShrink: 0, boxShadow: `0 0 6px ${c}` }} />}
                    <span style={{ fontWeight: n.isRead ? 400 : 700, fontSize: '0.9rem' }}>{n.title}</span>
                    <span style={{ padding: '1px 8px', borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, background: c + '22', color: c }}>{n.type}</span>
                    {n.module && <span style={{ fontSize: '0.68rem', color: '#475569' }}>{n.module}</span>}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>{n.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#475569' }}>{new Date(n.createdAt).toLocaleString('es-CO')}</span>
                    {n.linkUrl && <a href={n.linkUrl} target='_blank' rel='noreferrer' style={{ fontSize: '0.72rem', color: '#818cf8' }}>Ver →</a>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {!n.isRead && (
                    <button onClick={() => void markRead(n.id)} title='Marcar como leída' style={{ background: '#334155', border: 'none', color: '#94a3b8', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }}>
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button onClick={() => void deleteNotif(n.id)} title='Eliminar' style={{ background: '#ef444422', border: 'none', color: '#ef4444', borderRadius: '6px', padding: '5px 8px', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Nueva Notificación</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[{ label: 'Título *', key: 'title' }, { label: 'Módulo (optativo)', key: 'module' }, { label: 'URL de enlace (optativo)', key: 'linkUrl' }].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Mensaje *</span>
                <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} rows={3}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Tipo</span>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  {['INFO', 'SUCCESS', 'WARNING', 'ALERT'].map(t => <option key={t} value={t}>{TYPE_L[t]}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void createNotif()} style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
