import { useState, useEffect, useCallback } from 'react';
import { Building2, Mail, Phone, Globe, MapPin, Image } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

interface CompanyConfig {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  logoUrl: string | null;
}

const FIELDS: { key: keyof Omit<CompanyConfig, 'id'>; label: string; type: string; placeholder: string; icon: React.ReactNode }[] = [
  { key: 'name',    label: 'Nombre de la empresa',   type: 'text',  placeholder: 'FoundTeach EdTech S.A.S',       icon: <Building2 size={16} /> },
  { key: 'email',   label: 'Correo de contacto',     type: 'email', placeholder: 'contacto@foundteach.com',        icon: <Mail size={16} /> },
  { key: 'phone',   label: 'Teléfono / WhatsApp',    type: 'text',  placeholder: '+57 320 832 5534',               icon: <Phone size={16} /> },
  { key: 'website', label: 'Sitio web',              type: 'url',   placeholder: 'https://foundteach.com',         icon: <Globe size={16} /> },
  { key: 'address', label: 'Dirección',              type: 'text',  placeholder: 'Yopal, Casanare, Colombia',      icon: <MapPin size={16} /> },
  { key: 'logoUrl', label: 'URL del Logo',           type: 'url',   placeholder: 'https://...',                    icon: <Image size={16} /> },
];

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function CompanyPage() {
  const [config, setConfig] = useState<Partial<CompanyConfig>>({});
  const [form, setForm] = useState<Partial<Omit<CompanyConfig, 'id'>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/company`);
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          address: data.address || '',
          logoUrl: data.logoUrl || '',
        });
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void fetchConfig(); }, [fetchConfig]);

  const handleChange = (key: string, value: string) => {
    setForm(p => ({ ...p, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/company`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al guardar');
      const updated = await res.json();
      setConfig(updated);
      setDirty(false);
      setSuccess('Configuración guardada correctamente.');
      setTimeout(() => setSuccess(''), 3500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando configuración...</div>;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Configuración de la Empresa</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Información general de <strong>FoundTeach</strong>. Estos datos se usarán en el sitio web y las comunicaciones.
        </p>
      </div>

      {/* Logo preview */}
      {(form.logoUrl || config.logoUrl) && (
        <div style={{ marginBottom: 24, padding: 20, background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src={form.logoUrl || config.logoUrl || ''}
            alt="Logo"
            style={{ height: 48, width: 'auto', objectFit: 'contain', borderRadius: 8 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{form.name || config.name}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Vista previa del logo</div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {success && (
        <div style={{ background: 'rgba(5,150,105,0.1)', color: '#059669', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '0.875rem', border: '1px solid rgba(5,150,105,0.2)' }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontWeight: 600, fontSize: '0.875rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Form */}
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {FIELDS.map(f => (
            <div key={f.key} className="form-group" style={{ marginBottom: 0, gridColumn: f.key === 'address' || f.key === 'logoUrl' ? '1 / -1' : 'auto' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>{f.icon}</span>
                {f.label}
              </label>
              <input
                type={f.type}
                className="form-input"
                placeholder={f.placeholder}
                value={(form as Record<string, string>)[f.key] || ''}
                onChange={e => handleChange(f.key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 28, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {dirty && (
            <button
              onClick={() => { void fetchConfig(); setDirty(false); }}
              style={{ padding: '10px 20px', border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-muted)' }}
            >
              Descartar cambios
            </button>
          )}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !dirty}
            style={{ width: 'auto', padding: '10px 28px', opacity: dirty ? 1 : 0.5 }}
          >
            {saving ? 'Guardando...' : '💾 Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}
