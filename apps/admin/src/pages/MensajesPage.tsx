import { useState, useEffect, useCallback } from 'react';
import { Send, X, MessageSquare, Reply } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/comms`;
const token = () => localStorage.getItem('foundteach_token') ?? '';

interface Reply_ { id: string; fromName: string; body: string; createdAt: string; isRead: boolean; }
interface Message {
  id: string; fromName: string; fromEmail?: string; toName: string; toEmail?: string;
  subject: string; body: string; isRead: boolean; createdAt: string; replies?: Reply_[];
}

const EMPTY_FORM = { fromName: 'FoundTeach Admin', fromEmail: '', toName: '', toEmail: '', subject: '', body: '' };

export function MensajesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading]   = useState(true);
  const [showNew, setShowNew]   = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [replyBody, setReplyBody] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/messages`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setMessages(await res.json() as Message[]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const openMessage = async (m: Message) => {
    setSelected(m);
    if (!m.isRead) {
      await fetch(`${BASE}/messages/${m.id}/read`, { method: 'PUT', headers: { Authorization: `Bearer ${token()}` } });
      setMessages(p => p.map(x => x.id === m.id ? { ...x, isRead: true } : x));
    }
  };

  const sendMessage = async () => {
    await fetch(`${BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify(form),
    });
    setShowNew(false); setForm(EMPTY_FORM); void load();
  };

  const sendReply = async () => {
    if (!selected || !replyBody.trim()) return;
    await fetch(`${BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ fromName: 'FoundTeach Admin', toName: selected.fromName, toEmail: selected.fromEmail, subject: `Re: ${selected.subject}`, body: replyBody, replyToId: selected.id }),
    });
    setReplyBody('');
    void load();
  };

  const deleteMessage = async (id: string) => {
    await fetch(`${BASE}/messages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    if (selected?.id === id) setSelected(null);
    void load();
  };

  const unreadCount = messages.filter(m => !m.isRead).length;
  const inputStyle = { background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', width: '100%', boxSizing: 'border-box' as const };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
      {/* Topbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1e293b', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, background: 'linear-gradient(135deg,#60a5fa,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Mensajes Internos
          </h1>
          {unreadCount > 0 && (
            <span style={{ background: '#6366f1', color: '#fff', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px' }}>{unreadCount} sin leer</span>
          )}
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
          <Send size={15} /> Nuevo mensaje
        </button>
      </div>

      {/* Body: list + detail */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left panel — thread list */}
        <div style={{ width: '320px', borderRight: '1px solid #1e293b', overflowY: 'auto', flexShrink: 0 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#475569', padding: '40px 16px', fontSize: '0.85rem' }}>Cargando...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 16px' }}>
              <MessageSquare size={40} style={{ opacity: 0.1, display: 'block', margin: '0 auto 12px' }} />
              <p style={{ color: '#475569', fontSize: '0.85rem' }}>Sin mensajes aún.</p>
            </div>
          ) : messages.map(m => (
            <div key={m.id} onClick={() => void openMessage(m)}
              style={{ padding: '14px 16px', borderBottom: '1px solid #1e293b', cursor: 'pointer', background: selected?.id === m.id ? '#1e293b' : 'transparent', borderLeft: selected?.id === m.id ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.1s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{ fontWeight: m.isRead ? 400 : 700, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.fromName}</div>
                {!m.isRead && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: '4px' }} />}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: m.isRead ? 400 : 600, color: m.isRead ? '#64748b' : '#e2e8f0', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</div>
              <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '3px' }}>{new Date(m.createdAt).toLocaleDateString('es-CO')}</div>
            </div>
          ))}
        </div>

        {/* Right panel — detail */}
        {selected ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>{selected.subject}</h2>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>De: {selected.fromName}{selected.fromEmail ? ` <${selected.fromEmail}>` : ''} · Para: {selected.toName}</div>
                <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>{new Date(selected.createdAt).toLocaleString('es-CO')}</div>
              </div>
              <button onClick={() => void deleteMessage(selected.id)} style={{ background: '#ef444422', border: 'none', color: '#ef4444', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Eliminar</button>
            </div>

            <div style={{ background: '#1e293b', borderRadius: '10px', padding: '16px', lineHeight: 1.7, fontSize: '0.875rem', color: '#cbd5e1' }}>
              {selected.body}
            </div>

            {/* Replies */}
            {(selected.replies ?? []).length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>RESPUESTAS</div>
                {(selected.replies ?? []).map(r => (
                  <div key={r.id} style={{ background: '#1e293b', borderRadius: '10px', padding: '12px 16px', borderLeft: '3px solid #6366f1' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>{r.fromName} · {new Date(r.createdAt).toLocaleString('es-CO')}</div>
                    <div style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{r.body}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Reply box */}
            <div style={{ background: '#1e293b', borderRadius: '10px', padding: '14px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                <Reply size={14} /> Responder
              </div>
              <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} placeholder='Escribe tu respuesta...' rows={3}
                style={{ ...inputStyle, resize: 'vertical', marginBottom: '10px' }} />
              <button onClick={() => void sendReply()} disabled={!replyBody.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: replyBody.trim() ? 'linear-gradient(135deg,#6366f1,#818cf8)' : '#334155', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 16px', cursor: replyBody.trim() ? 'pointer' : 'default', fontWeight: 600, fontSize: '0.82rem' }}>
                <Send size={14} /> Enviar respuesta
              </button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
            <MessageSquare size={56} style={{ opacity: 0.15, marginBottom: '14px' }} />
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>Selecciona un mensaje para verlo</p>
          </div>
        )}
      </div>

      {/* New message modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Nuevo Mensaje</h2>
              <button onClick={() => setShowNew(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'De (nombre)', key: 'fromName' }, { label: 'De (email)', key: 'fromEmail' },
                { label: 'Para (nombre) *', key: 'toName' }, { label: 'Para (email)', key: 'toEmail' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
                </label>
              ))}
              <label style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Asunto *</span>
                <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={inputStyle} />
              </label>
              <label style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Mensaje *</span>
                <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowNew(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void sendMessage()} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg,#6366f1,#818cf8)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
                <Send size={14} /> Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
