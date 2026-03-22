import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Gamepad2, Globe, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
}

interface KpiData {
  messages: { total: number; pending: number; read: number; replied: number };
  players: { total: number };
  services: { total: number; active: number };
  users: { total: number; active: number };
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon, label, value, sub, color, loading, onClick,
}: {
  icon: React.ReactNode; label: string; value: number | string; sub?: string;
  color: string; loading: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        padding: '24px',
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        borderTop: `3px solid ${color}`,
        width: '100%',
      }}
      onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        {onClick && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ver →</span>
        )}
      </div>
      <div style={{ fontSize: loading ? '1.5rem' : '2.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 4, lineHeight: 1 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: sub ? 8 : 0 }}>
        {label}
      </div>
      {sub && !loading && (
        <div style={{ fontSize: '0.8rem', color, fontWeight: 600 }}>{sub}</div>
      )}
    </button>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: 700, color }}>{value}</span>
      </div>
      <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function KpiPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchKpis = async () => {
    setLoading(true);
    try {
      const [messagesRes, playersRes, servicesRes, usersRes] = await Promise.allSettled([
        fetch(`${API_URL}/api/contact`, { headers: authHeader() }),
        fetch(`${API_URL}/api/game-players`, { headers: authHeader() }),
        fetch(`${API_URL}/api/services`, { headers: authHeader() }),
        fetch(`${API_URL}/api/users`, { headers: authHeader() }),
      ]);

      const messages = messagesRes.status === 'fulfilled' && messagesRes.value.ok
        ? await messagesRes.value.json() as Array<{ status: string }> : [];
      const players = playersRes.status === 'fulfilled' && playersRes.value.ok
        ? await playersRes.value.json() as unknown[] : [];
      const services = servicesRes.status === 'fulfilled' && servicesRes.value.ok
        ? await servicesRes.value.json() as Array<{ isActive: boolean }> : [];
      const users = usersRes.status === 'fulfilled' && usersRes.value.ok
        ? await usersRes.value.json() as Array<{ isActive: boolean }> : [];

      setData({
        messages: {
          total: messages.length,
          pending: messages.filter(m => m.status === 'PENDING').length,
          read: messages.filter(m => m.status === 'READ').length,
          replied: messages.filter(m => m.status === 'REPLIED').length,
        },
        players: { total: players.length },
        services: {
          total: services.length,
          active: services.filter(s => s.isActive).length,
        },
        users: {
          total: users.length,
          active: (users as Array<{ isActive: boolean }>).filter(u => u.isActive).length,
        },
      });
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchKpis(); }, []);

  const health = data
    ? (data.messages.pending === 0 ? 'great' : data.messages.pending <= 3 ? 'ok' : 'attention')
    : 'ok';

  const healthConfig = {
    great:     { label: 'Todo al día', color: '#059669', icon: <CheckCircle size={16} /> },
    ok:        { label: 'Mensajes pendientes', color: '#d97706', icon: <Clock size={16} /> },
    attention: { label: 'Requiere atención', color: '#ef4444', icon: <AlertCircle size={16} /> },
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Dashboard · KPIs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Métricas en tiempo real de FoundTeach.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastUpdate && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Actualizado: {lastUpdate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => void fetchKpis()}
            disabled={loading}
            style={{ padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-color)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '⏳ Cargando...' : '↻ Actualizar'}
          </button>
        </div>
      </div>

      {/* Estado general */}
      {!loading && data && (
        <div style={{ background: `${healthConfig[health].color}10`, border: `1px solid ${healthConfig[health].color}30`, borderRadius: 12, padding: '12px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: healthConfig[health].color }}>{healthConfig[health].icon}</span>
          <div>
            <span style={{ fontWeight: 700, color: healthConfig[health].color, fontSize: '0.9rem' }}>
              Estado del sistema: {healthConfig[health].label}
            </span>
            {data.messages.pending > 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: 8 }}>
                — {data.messages.pending} mensaje{data.messages.pending > 1 ? 's' : ''} esperando respuesta
              </span>
            )}
          </div>
        </div>
      )}

      {/* KPI Cards — Fila principal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <KpiCard
          icon={<Mail size={20} />} label="Mensajes Totales"
          value={data?.messages.total ?? 0} loading={loading}
          color="#d97706"
          sub={data && data.messages.pending > 0 ? `${data.messages.pending} sin leer` : undefined}
          onClick={() => navigate('/web/messages')}
        />
        <KpiCard
          icon={<Gamepad2 size={20} />} label="Jugadores GeoMath"
          value={data?.players.total ?? 0} loading={loading}
          color="#059669"
          onClick={() => navigate('/geomath/players')}
        />
        <KpiCard
          icon={<Globe size={20} />} label="Servicios Activos"
          value={data ? `${data.services.active} / ${data.services.total}` : 0} loading={loading}
          color="#2563eb"
          sub={data && data.services.total > data.services.active ? `${data.services.total - data.services.active} inactivo(s)` : undefined}
          onClick={() => navigate('/web/services')}
        />
        <KpiCard
          icon={<Users size={20} />} label="Usuarios del Panel"
          value={data?.users.active ?? 0} loading={loading}
          color="#7c3aed"
          sub={data && data.users.total > data.users.active ? `${data.users.total - data.users.active} inactivo(s)` : undefined}
          onClick={() => navigate('/admin/users')}
        />
      </div>

      {/* Fila de detalle */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Mensajes por estado */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Mail size={18} color="#d97706" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Mensajes por Estado</h3>
          </div>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando...</div>
          ) : data && data.messages.total > 0 ? (
            <>
              <MiniBar label="Pendientes" value={data.messages.pending} max={data.messages.total} color="#ef4444" />
              <MiniBar label="Leídos" value={data.messages.read} max={data.messages.total} color="#d97706" />
              <MiniBar label="Respondidos" value={data.messages.replied} max={data.messages.total} color="#059669" />
              <MiniBar label="Otros" value={data.messages.total - data.messages.pending - data.messages.read - data.messages.replied} max={data.messages.total} color="#94a3b8" />
            </>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No hay mensajes aún.
            </div>
          )}
          {!loading && data && (
            <button
              onClick={() => navigate('/web/messages')}
              style={{ marginTop: 16, width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--surface-hover)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}
            >
              Ver todos los mensajes →
            </button>
          )}
        </div>

        {/* Resumen general */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={18} color="#2563eb" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Resumen de Plataformas</h3>
          </div>
          {loading ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Cargando...</div>
          ) : data ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '🎮', label: 'GeoMath — Jugadores registrados', value: data.players.total, color: '#059669' },
                { icon: '🌐', label: 'Sitio web — Servicios publicados', value: data.services.active, color: '#2563eb' },
                { icon: '👥', label: 'Panel — Usuarios activos', value: data.users.active, color: '#7c3aed' },
                { icon: '📩', label: 'Inbox — Mensajes respondidos', value: data.messages.replied, color: '#059669' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--background-color)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
