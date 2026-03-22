import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const ICON_OPTIONS = ['💻', '📊', '⚙️', '🚀', '🤝', '🎓', '📱', '🔒', '☁️', '🧠', '🔗', '📈', '🛠️', '🧩', '🌐'];

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const emptyForm = {
  title: '',
  description: '',
  icon: '💻',
  isActive: true,
  sortOrder: 0,
};

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function WebServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/services`, { headers: authHeader() });
      if (res.ok) setServices(await res.json());
    } catch {
      setError('Error cargando servicios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchServices(); }, [fetchServices]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openCreate = () => {
    setForm({ ...emptyForm, sortOrder: services.length });
    setEditId(null);
    setError('');
    setShowForm(true);
  };

  const openEdit = (s: Service) => {
    setForm({
      title: s.title,
      description: s.description,
      icon: s.icon || '💻',
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    });
    setEditId(s.id);
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('El título y la descripción son obligatorios.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const url = editId
        ? `${API_URL}/api/services/${editId}`
        : `${API_URL}/api/services`;
      const res = await fetch(url, {
        method: editId ? 'PATCH' : 'POST',
        headers: authHeader(),
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al guardar');
      }
      await fetchServices();
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      showSuccess(editId ? 'Servicio actualizado correctamente.' : 'Servicio creado correctamente.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      await fetch(`${API_URL}/api/services/${s.id}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      await fetchServices();
      showSuccess(`Servicio ${!s.isActive ? 'activado' : 'desactivado'}.`);
    } catch {
      setError('Error al actualizar el estado');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/services/${deleteId}`, {
        method: 'DELETE',
        headers: authHeader(),
      });
      await fetchServices();
      setDeleteId(null);
      showSuccess('Servicio eliminado.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Sitio & Servicios
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Gestiona los servicios que aparecen en <strong>foundteach.com</strong> — los cambios se reflejan en tiempo real.
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'var(--primary-color)', color: 'white',
            padding: '10px 20px', borderRadius: 10, fontWeight: 700,
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 8,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
          }}
        >
          + Nuevo Servicio
        </button>
      </div>

      {/* Feedback banners */}
      {successMsg && (
        <div style={{ background: 'rgba(5, 150, 105, 0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(5,150,105,0.2)' }}>
          ✅ {successMsg}
        </div>
      )}
      {error && !showForm && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Info Banner */}
      <div style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '1.4rem' }}>🌐</span>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem', marginBottom: 2 }}>
            Conexión en vivo con el sitio web
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            Los servicios activos se muestran automáticamente en la sección <strong>"Nuestros Servicios"</strong> de foundteach.com. Los inactivos están ocultos para los visitantes.
          </p>
        </div>
      </div>

      {/* Services List */}
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
            Cargando servicios...
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🌐</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>No hay servicios registrados</p>
            <p style={{ fontSize: '0.875rem', marginBottom: 20 }}>Crea el primer servicio para que aparezca en el sitio web.</p>
            <button onClick={openCreate} style={{ padding: '10px 24px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
              + Crear primer servicio
            </button>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div style={{ padding: '12px 24px', background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: '60px 1fr 2fr 100px 120px 140px', gap: 12, alignItems: 'center' }}>
              {['Orden', 'Ícono & Título', 'Descripción', 'Estado', 'Visible en Web', 'Acciones'].map(h => (
                <span key={h} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>
            {services.map((s, i) => (
              <div
                key={s.id}
                style={{
                  padding: '18px 24px',
                  borderBottom: i < services.length - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 2fr 100px 120px 140px',
                  gap: 12,
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Sort order */}
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--border-color)', textAlign: 'center' }}>
                  #{s.sortOrder + 1}
                </div>

                {/* Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                    {s.icon || '💻'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      ID: {s.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {s.description}
                </div>

                {/* Active Badge */}
                <div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
                    background: s.isActive ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.08)',
                    color: s.isActive ? '#059669' : '#ef4444',
                  }}>
                    {s.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Toggle Visibility */}
                <div>
                  <button
                    onClick={() => toggleActive(s)}
                    title={s.isActive ? 'Ocultar del sitio web' : 'Mostrar en el sitio web'}
                    style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                      cursor: 'pointer', border: '1px solid var(--border-color)',
                      background: s.isActive ? 'rgba(239,68,68,0.06)' : 'rgba(5,150,105,0.08)',
                      color: s.isActive ? '#ef4444' : '#059669',
                    }}
                  >
                    {s.isActive ? '👁️ Ocultar' : '👁️ Mostrar'}
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEdit(s)}
                    style={{ padding: '6px 14px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer', background: 'var(--surface-hover)', color: 'var(--text-main)', fontWeight: 600 }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => setDeleteId(s.id)}
                    style={{ padding: '6px 10px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer', background: 'rgba(239,68,68,0.05)', color: '#ef4444' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 580, border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                {editId ? '✏️ Editar Servicio' : '✨ Nuevo Servicio'}
              </h2>
              <button onClick={() => setShowForm(false)} style={{ fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.875rem', fontWeight: 500 }}>
                {error}
              </div>
            )}

            {/* Icon Picker */}
            <div className="form-group">
              <label className="form-label">Ícono del Servicio</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {ICON_OPTIONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(p => ({ ...p, icon }))}
                    style={{
                      width: 44, height: 44, borderRadius: 10, fontSize: '1.3rem',
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: form.icon === icon ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      background: form.icon === icon ? 'rgba(37,99,235,0.08)' : 'var(--surface-hover)',
                      transform: form.icon === icon ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Título del Servicio *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Desarrollo Web y Móvil"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Descripción *</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Descripción detallada del servicio que verán los visitantes..."
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Sort Order */}
            <div className="form-group">
              <label className="form-label">Posición de Orden (0 = primero)</label>
              <input
                type="number"
                className="form-input"
                min={0}
                value={form.sortOrder}
                onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))}
              />
            </div>

            {/* Active toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '12px 16px', background: 'var(--surface-hover)', borderRadius: 10 }}>
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="isActive" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                Mostrar en el sitio web (activo)
              </label>
            </div>

            {/* Preview */}
            <div style={{ background: 'var(--background-color)', borderRadius: 12, padding: 16, marginBottom: 28, border: '1px dashed var(--border-color)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                Vista previa (como aparecerá en el sitio)
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                  {form.icon || '💻'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{form.title || 'Título del servicio'}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{form.description || 'Descripción del servicio...'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
                style={{ flex: 1 }}
              >
                {saving ? 'Guardando...' : editId ? 'Actualizar Servicio' : 'Crear Servicio'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 380, border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
            <h2 style={{ marginBottom: 8 }}>¿Eliminar servicio?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              Esta acción no se puede deshacer. El servicio dejará de aparecer en el sitio web inmediatamente.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={handleDelete}
                disabled={saving}
                style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                {saving ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
