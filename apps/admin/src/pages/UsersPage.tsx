import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuario',
  TEACHER: 'Docente',
  STUDENT: 'Estudiante',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#7c3aed',
  USER: '#2563eb',
  TEACHER: '#059669',
  STUDENT: '#d97706',
};

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'USER',
};

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, { headers: authHeader() });
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchUsers(); }, [fetchUsers]);

  const showSuccessMsg = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3500);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (u: User) => {
    setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role });
    setEditId(u.id);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.email) { setError('Nombre y correo son obligatorios.'); return; }
    if (!editId && !form.password) { setError('La contraseña es obligatoria para usuarios nuevos.'); return; }
    setSaving(true); setError('');
    try {
      const body: Record<string, string> = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
      };
      if (!editId || form.password) body.password = form.password;

      const res = await fetch(
        editId ? `${API_URL}/api/users/${editId}` : `${API_URL}/api/users`,
        { method: editId ? 'PATCH' : 'POST', headers: authHeader(), body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al guardar');
      await fetchUsers();
      setShowForm(false);
      showSuccessMsg(editId ? 'Usuario actualizado.' : 'Usuario creado correctamente.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally { setSaving(false); }
  };

  const toggleActive = async (u: User) => {
    await fetch(`${API_URL}/api/users/${u.id}`, {
      method: 'PATCH', headers: authHeader(),
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    await fetchUsers();
    showSuccessMsg(`Usuario ${u.isActive ? 'desactivado' : 'activado'}.`);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Usuarios</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Gestiona los accesos al panel administrativo.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{ background: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: 10, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {success && (
        <div style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(5,150,105,0.2)' }}>
          ✅ {success}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando usuarios...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>👤</div>
            <p style={{ fontWeight: 600 }}>No hay usuarios registrados</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 120px 100px 120px', gap: 12, padding: '12px 24px', background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)' }}>
              {['Nombre', 'Correo', 'Rol', 'Estado', 'Acciones'].map(h => (
                <span key={h} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {users.map((u, i) => (
              <div
                key={u.id}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 120px 100px 120px', gap: 12, padding: '16px 24px', borderBottom: i < users.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: ROLE_COLORS[u.role] || '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Desde {new Date(u.createdAt).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{u.email}</div>
                <div>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, background: `${ROLE_COLORS[u.role] || '#2563eb'}15`, color: ROLE_COLORS[u.role] || '#2563eb' }}>
                    {ROLE_LABELS[u.role] || u.role}
                  </span>
                </div>
                <div>
                  <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, background: u.isActive ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.08)', color: u.isActive ? '#059669' : '#ef4444' }}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(u)} style={{ padding: '5px 10px', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', background: 'var(--surface-hover)', fontWeight: 600 }}>
                    Editar
                  </button>
                  <button onClick={() => toggleActive(u)} style={{ padding: '5px 10px', border: `1px solid ${u.isActive ? 'rgba(239,68,68,0.3)' : 'rgba(5,150,105,0.3)'}`, borderRadius: 6, fontSize: '0.78rem', cursor: 'pointer', background: u.isActive ? 'rgba(239,68,68,0.05)' : 'rgba(5,150,105,0.05)', color: u.isActive ? '#ef4444' : '#059669', fontWeight: 600 }}>
                    {u.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 520, border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{editId ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}</h2>
              <button onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.875rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Nombres *', key: 'firstName', type: 'text' },
                { label: 'Apellidos', key: 'lastName', type: 'text' },
                { label: 'Correo electrónico *', key: 'email', type: 'email' },
                { label: editId ? 'Nueva contraseña (dejar vacío = sin cambios)' : 'Contraseña *', key: 'password', type: 'password' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type={f.type}
                    className="form-input"
                    value={(form as Record<string, string>)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Rol del usuario</label>
                <select className="form-input" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Usuario'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
