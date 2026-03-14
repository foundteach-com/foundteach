import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: 'PENDING' | 'READ' | 'REPLIED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [error, setError] = useState('');

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, { headers: authHeader() });
      if (res.ok) setMessages(await res.json());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMessages();
  }, [fetchMessages]);

  const updateStatus = async (id: string, newStatus: string) => {
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/contact/${id}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Error al actualizar el estado');
      
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as ContactMessage['status'] } : m));
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus as ContactMessage['status'] });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    }
  };

  const getStatusBadgeOptions = (status: string) => {
    switch(status) {
      case 'PENDING': return { text: 'Pendiente', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      case 'READ': return { text: 'Leído', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' };
      case 'REPLIED': return { text: 'Respondido', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'ARCHIVED': return { text: 'Archivado', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };
      default: return { text: status, color: '#fff', bg: 'transparent' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📩</div>
          <div className="stat-info">
            <h3>Bandeja de entrada</h3>
            <div className="stat-value">{messages.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <h3>Pendientes</h3>
            <div className="stat-value">{messages.filter(m => m.status === 'PENDING').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Respondidos</h3>
            <div className="stat-value">{messages.filter(m => m.status === 'REPLIED').length}</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--surface-dark)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Mensajes de Contacto recibidos</h2>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Aún no hay mensajes de contacto registrados en la plataforma.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Estado', 'Fecha', 'Nombre', 'Correo', 'Asunto', 'Acción'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    color: 'var(--text-muted)', fontWeight: 600,
                    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => {
                const badge = getStatusBadgeOptions(m.status);
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.75rem' }}>
                        {badge.text}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {new Date(m.createdAt).toLocaleDateString('es-CO')}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{m.email}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 500 }}>{m.subject}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => {
                          setSelectedMessage(m);
                          if (m.status === 'PENDING') void updateStatus(m.id, 'READ');
                        }}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >Ver Mensaje</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* VER MENSAJE MODAL */}
      {selectedMessage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-dark)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem' }}>Detalle del mensaje</h2>
              <button 
                onClick={() => setSelectedMessage(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >✖</button>
            </div>
            
            {error && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: '0.875rem' }}>{error}</p>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Nombre</p>
                <p style={{ fontWeight: 600 }}>{selectedMessage.name}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Correo</p>
                <p><a href={`mailto:${selectedMessage.email}`} style={{ color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }}>{selectedMessage.email}</a></p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Teléfono / WhatsApp</p>
                <p style={{ fontWeight: 600 }}>{selectedMessage.phone || 'No especificado'}</p>
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Fecha</p>
                <p style={{ fontWeight: 600 }}>{new Date(selectedMessage.createdAt).toLocaleString('es-CO')}</p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Asunto</p>
              <p style={{ fontWeight: 600, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>{selectedMessage.subject}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Mensaje</p>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--border-color)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <button 
                className="btn-primary" 
                onClick={() => void updateStatus(selectedMessage.id, 'REPLIED')} 
                disabled={selectedMessage.status === 'REPLIED'}
                style={{ padding: '10px 20px' }}
              >
                {selectedMessage.status === 'REPLIED' ? '✅ Marcado como Respondido' : 'Marcar como Respondido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
