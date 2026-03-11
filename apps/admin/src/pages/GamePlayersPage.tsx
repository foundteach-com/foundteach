import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

interface GamePlayer {
  id: string;
  name: string;
  studentCode: string;
  totalScore: number;
  highestLevel: number;
  lastLevel: number;
  roundsPlayed: number;
  levelsData: unknown;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  topPlayer: GamePlayer | null;
  averageScore: number;
}

interface EditForm {
  name: string;
  studentCode: string;
  totalScore: string;
  highestLevel: string;
  lastLevel: string;
}

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function GamePlayersPage() {
  const [players, setPlayers]         = useState<GamePlayer[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [editPlayer, setEditPlayer]   = useState<GamePlayer | null>(null);
  const [editForm, setEditForm]       = useState<EditForm>({ name: '', studentCode: '', totalScore: '', highestLevel: '', lastLevel: '' });
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const fetchAll = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/game-players?search=${encodeURIComponent(q)}`, { headers: authHeader() }),
        fetch(`${API_URL}/api/game-players/stats`, { headers: authHeader() }),
      ]);
      if (pRes.ok) setPlayers(await pRes.json());
      if (sRes.ok) setStats(await sRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => { void fetchAll(search); }, 350);
    return () => clearTimeout(t);
  }, [search, fetchAll]);

  const openEdit = (p: GamePlayer) => {
    setEditPlayer(p);
    setEditForm({
      name:         p.name,
      studentCode:  p.studentCode,
      totalScore:   String(p.totalScore),
      highestLevel: String(p.highestLevel),
      lastLevel:    String(p.lastLevel),
    });
    setError('');
  };

  const handleSave = async () => {
    if (!editPlayer) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/game-players/${editPlayer.id}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({
          name:         editForm.name,
          studentCode:  editForm.studentCode,
          totalScore:   Number(editForm.totalScore),
          highestLevel: Number(editForm.highestLevel),
          lastLevel:    Number(editForm.lastLevel),
        }),
      });
      if (!res.ok) throw new Error('Error al guardar');
      setEditPlayer(null);
      void fetchAll(search);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/game-players/${deleteId}`, { method: 'DELETE', headers: authHeader() });
      setDeleteId(null);
      void fetchAll(search);
    } finally {
      setSaving(false);
    }
  };

  const medal = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `#${i + 1}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Stats cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎮</div>
          <div className="stat-info">
            <h3>Total jugadores</h3>
            <div className="stat-value">{stats?.total ?? '-'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>Puntaje promedio</h3>
            <div className="stat-value">{stats?.averageScore ?? '-'}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Mejor jugador</h3>
            <div className="stat-value" style={{ fontSize: '1rem' }}>
              {stats?.topPlayer ? stats.topPlayer.name.split(' ')[0] : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div style={{ backgroundColor: 'var(--surface-dark)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre o código…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ flex: 1, margin: 0 }}
          />
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => void fetchAll(search)}>
            Actualizar
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando jugadores…</div>
        ) : players.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {search ? 'Sin resultados para esa búsqueda.' : 'Aún no hay jugadores registrados en GeoMath Match.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['#', 'Jugador', 'Código', 'Nivel', 'Nivel Actual', 'Puntaje', 'Rondas', 'Registro', 'Acciones'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    color: 'var(--text-muted)', fontWeight: 600,
                    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-muted)' }}>{medal(i)}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--accent-color)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '0.85rem', flexShrink: 0
                      }}>
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <code style={{ background: 'rgba(var(--accent-rgb), 0.12)', color: 'var(--accent-color)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {p.studentCode}
                    </code>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-color)', padding: '4px 10px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>
                      Nv.{p.highestLevel}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Nv.{p.lastLevel}
                  </td>
                  <td style={{ padding: '14px 16px', fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>{p.totalScore.toLocaleString()}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{p.roundsPlayed}</td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {new Date(p.createdAt).toLocaleDateString('es-CO')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEdit(p)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >✏️ Editar</button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >🗑️ Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {editPlayer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-dark)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, border: '1px solid var(--border-color)' }}>
            <h2 style={{ marginBottom: 20 }}>✏️ Editar jugador</h2>
            {error && <p style={{ color: '#ef4444', marginBottom: 12, fontSize: '0.875rem' }}>{error}</p>}
            {(['name', 'studentCode', 'totalScore', 'highestLevel', 'lastLevel'] as (keyof EditForm)[]).map(field => (
              <div className="form-group" key={field}>
                <label className="form-label">{
                  { name: 'Nombre', studentCode: 'Código estudiantil', totalScore: 'Puntaje total', highestLevel: 'Nivel más alto', lastLevel: 'Último nivel' }[field]
                }</label>
                <input
                  className="form-input"
                  type={['totalScore', 'highestLevel', 'lastLevel'].includes(field) ? 'number' : 'text'}
                  value={editForm[field]}
                  onChange={e => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button className="btn-primary" onClick={() => void handleSave()} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button onClick={() => setEditPlayer(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-dark)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380, border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
            <h2 style={{ marginBottom: 8 }}>¿Eliminar jugador?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>Esta acción no se puede deshacer. Se perderán todos sus datos y progreso.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => void handleDelete()} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                {saving ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
