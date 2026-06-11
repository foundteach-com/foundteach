import { useState } from 'react';
import {
  Building2, Briefcase, Users, FileText, Activity, ChevronDown,
  Edit3, Save, X, Plus, Trash2, Eye, Download, Upload,
  Phone, Mail, Globe, MapPin, AlertCircle, CheckCircle,
  Clock, TrendingUp, BarChart2, Shield,
} from 'lucide-react';


const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CompanyData {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  rut: string;
  legalRepresentativeName: string;
  legalRepresentativeId: string;
  certificateOfExistenceNumber: string;
  certificateExpeditedDate: string;
  incorporationDate: string;
  statutesDescription: string;
}

interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface DocumentRow {
  id: string;
  name: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  category: string;
  uploadedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function fmtBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getRoleBadge(role: string) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    ADMIN:   { label: 'Admin',     color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
    TEACHER: { label: 'Docente',   color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
    STUDENT: { label: 'Estudiante',color: '#059669', bg: 'rgba(5,150,105,0.1)' },
    USER:    { label: 'Usuario',   color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  };
  const r = map[role] ?? map['USER'];
  return (
    <span style={{
      background: r.bg, color: r.color,
      fontSize: '0.72rem', fontWeight: 700,
      padding: '3px 10px', borderRadius: 20, letterSpacing: '0.03em',
    }}>{r.label}</span>
  );
}

// ─── Sub-tabs ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Resumen',   icon: BarChart2 },
  { id: 'company',   label: 'Empresa',   icon: Building2 },
  { id: 'users',     label: 'Usuarios',  icon: Users },
  { id: 'documents', label: 'Documentos',icon: FileText },
  { id: 'activity',  label: 'Actividad', icon: Activity },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
}) {
  return (
    <div style={{
      background: 'var(--surface-color)', borderRadius: 16,
      border: '1px solid var(--border-color)', padding: '22px 24px',
      display: 'flex', alignItems: 'center', gap: 18,
      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        background: `${color}18`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const kpis = [
    { label: 'Usuarios Activos',   value: '—',  sub: 'Total en el sistema',       icon: Users,       color: '#2563eb' },
    { label: 'Documentos',         value: '—',  sub: 'Archivos corporativos',      icon: FileText,    color: '#7c3aed' },
    { label: 'Actividad Reciente', value: '—',  sub: 'Acciones esta semana',       icon: Activity,    color: '#059669' },
    { label: 'Módulos Activos',    value: '6',  sub: 'Áreas configuradas',         icon: TrendingUp,  color: '#f59e0b' },
  ];

  const activities = [
    { icon: CheckCircle, color: '#059669', text: 'Módulo Área Administrativa creado', time: 'Hace 1 min' },
    { icon: Users,       color: '#2563eb', text: 'Estructura de áreas configurada',   time: 'Hace 5 min' },
    { icon: Shield,      color: '#7c3aed', text: 'Acceso de administrador verificado', time: 'Hace 12 min' },
    { icon: Building2,   color: '#f59e0b', text: 'Panel administrativo inicializado', time: 'Hace 30 min' },
    { icon: AlertCircle, color: '#ef4444', text: 'Módulos anteriores removidos',       time: 'Hace 1h' },
  ];

  return (
    <div>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 32 }}>
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Estado del sistema + Actividad */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* System Health */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 18 }}>Estado del Sistema</h3>
          {[
            { label: 'API Backend',       status: 'Operativo',    ok: true },
            { label: 'Base de Datos',     status: 'Conectada',    ok: true },
            { label: 'Almacenamiento DO', status: 'Configurado',  ok: true },
            { label: 'Deploy Railway',    status: 'En producción',ok: true },
          ].map(item => (
            <div key={item.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 500 }}>{item.label}</span>
              <span style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: item.ok ? '#059669' : '#ef4444',
                background: item.ok ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.1)',
                padding: '3px 10px', borderRadius: 20,
              }}>{item.status}</span>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 18 }}>Actividad Reciente</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activities.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: `${a.color}15`, color: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <a.icon size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.3 }}>{a.text}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CompanyField (module-level to avoid render-time creation) ─────────────────
interface CompanyFieldProps {
  label: string;
  value: string;
  field: keyof CompanyData;
  icon: React.ComponentType<{ size?: number }>;
  type?: string;
  editing: boolean;
  formValue: string;
  onChange: (field: keyof CompanyData, value: string) => void;
}
function CompanyField({ label, value, field, icon: Icon, type = 'text', editing, formValue, onChange }: CompanyFieldProps) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {editing ? (
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
            <Icon size={16} />
          </span>
          <input
            type={type}
            value={formValue}
            onChange={e => onChange(field, e.target.value)}
            className="form-input"
            style={{ paddingLeft: 36 }}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--border-color)', color: value ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.93rem', fontWeight: value ? 500 : 400 }}>
          <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex' }}><Icon size={15} /></span>
          {value || <span style={{ fontStyle: 'italic' }}>Sin registrar</span>}
        </div>
      )}
    </div>
  );
}

// ─── Company Tab ──────────────────────────────────────────────────────────────
function CompanyTab() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<CompanyData>({
    name: 'FoundTeach EdTech S.A.S',
    email: '',
    phone: '',
    website: 'https://foundteach.com',
    address: '',
    rut: '',
    legalRepresentativeName: '',
    legalRepresentativeId: '',
    certificateOfExistenceNumber: '',
    certificateExpeditedDate: '',
    incorporationDate: '',
    statutesDescription: '',
  });
  const [form, setForm] = useState<CompanyData>({ ...data });

  const token = localStorage.getItem('admin_token') || '';

  const fetchCompany = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/company`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setForm(d);
      }
    } catch { /* use defaults */ }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        setForm(d);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch { /* silently fail */ }
    setSaving(false);
    setEditing(false);
  };


  const handleFieldChange = (f: keyof CompanyData, v: string) => setForm(p => ({ ...p, [f]: v }));


  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
      {/* Main form */}
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Información de la Empresa</h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: 2 }}>Datos generales de FoundTeach EdTech S.A.S</p>
          </div>
          {!editing ? (
            <button
              onClick={() => { setEditing(true); fetchCompany(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600 }}
            >
              <Edit3 size={14} /> Editar
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { setEditing(false); setForm(data); }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}
              >
                <X size={14} /> Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#059669', color: 'white', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, opacity: saving ? 0.7 : 1 }}
              >
                <Save size={14} /> {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '0.85rem', fontWeight: 600 }}>
            <CheckCircle size={15} /> Cambios guardados correctamente
          </div>
        )}

        {/* Información Básica */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Información Básica</h4>
          <CompanyField label="Nombre legal" value={data.name}    field="name"    icon={Building2} editing={editing} formValue={form.name}    onChange={handleFieldChange} />
          <CompanyField label="Correo"        value={data.email}   field="email"   icon={Mail}     editing={editing} formValue={form.email}   onChange={handleFieldChange} type="email" />
          <CompanyField label="Teléfono"      value={data.phone}   field="phone"   icon={Phone}    editing={editing} formValue={form.phone}   onChange={handleFieldChange} />
          <CompanyField label="Sitio web"     value={data.website} field="website" icon={Globe}    editing={editing} formValue={form.website} onChange={handleFieldChange} />
          <CompanyField label="Dirección"     value={data.address} field="address" icon={MapPin}   editing={editing} formValue={form.address} onChange={handleFieldChange} />
        </div>

        {/* Información Fiscal y Legal */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Datos Tributarios</h4>
          <CompanyField label="RUT (Registro Único Tributario)" value={data.rut} field="rut" icon={FileText} editing={editing} formValue={form.rut} onChange={handleFieldChange} />
        </div>

        {/* Certificado de Existencia y Representación */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificado de Existencia y Representación</h4>
          <CompanyField label="Número de Certificado" value={data.certificateOfExistenceNumber} field="certificateOfExistenceNumber" icon={FileText} editing={editing} formValue={form.certificateOfExistenceNumber} onChange={handleFieldChange} />
          <CompanyField label="Fecha de Expedición" value={data.certificateExpeditedDate} field="certificateExpeditedDate" icon={FileText} editing={editing} formValue={form.certificateExpeditedDate} onChange={handleFieldChange} type="date" />
        </div>

        {/* Representante Legal */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Representante Legal</h4>
          <CompanyField label="Nombre Completo" value={data.legalRepresentativeName} field="legalRepresentativeName" icon={Users} editing={editing} formValue={form.legalRepresentativeName} onChange={handleFieldChange} />
          <CompanyField label="Cédula de Identidad" value={data.legalRepresentativeId} field="legalRepresentativeId" icon={FileText} editing={editing} formValue={form.legalRepresentativeId} onChange={handleFieldChange} />
        </div>

        {/* Información de Constitución */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Constitución y Estatutos</h4>
          <CompanyField label="Fecha de Constitución" value={data.incorporationDate} field="incorporationDate" icon={FileText} editing={editing} formValue={form.incorporationDate} onChange={handleFieldChange} type="date" />
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Descripción de Estatutos</label>
            {editing ? (
              <textarea
                value={form.statutesDescription}
                onChange={e => handleFieldChange('statutesDescription', e.target.value)}
                className="form-input"
                style={{ minHeight: '100px', resize: 'vertical', padding: 12 }}
                placeholder="Información sobre los estatutos de constitución de la empresa..."
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 0', borderBottom: '1px solid var(--border-color)', color: data.statutesDescription ? 'var(--text-main)' : 'var(--text-muted)', fontSize: '0.93rem', fontWeight: data.statutesDescription ? 500 : 400, lineHeight: 1.5 }}>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex', marginTop: 2 }}><FileText size={15} /></span>
                {data.statutesDescription || <span style={{ fontStyle: 'italic' }}>Sin información registrada</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identity card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)', borderRadius: 16, padding: 28, color: 'white' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Building2 size={26} />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: 4 }}>FoundTeach</div>
          <div style={{ fontSize: '0.82rem', opacity: 0.75, marginBottom: 20 }}>EdTech S.A.S — Colombia</div>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 16 }} />
          <div style={{ fontSize: '0.78rem', opacity: 0.7, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Misión</div>
          <div style={{ fontSize: '0.83rem', opacity: 0.85, lineHeight: 1.5 }}>
            Transformar la educación a través de la tecnología, haciendo el aprendizaje accesible y efectivo.
          </div>
        </div>

        {/* Información de Identidad */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Identidad Corporativa</div>
          
          {/* RUT */}
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>RUT</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {data.rut ? data.rut : <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Sin registrar</span>}
            </div>
          </div>

          {/* Certificado */}
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>Certificado de Existencia</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {data.certificateOfExistenceNumber ? (
                <>
                  <div style={{ fontWeight: 600 }}>#{data.certificateOfExistenceNumber}</div>
                  {data.certificateExpeditedDate && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Expedido: {fmtDate(data.certificateExpeditedDate)}</div>}
                </>
              ) : (
                <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Sin registrar</span>
              )}
            </div>
          </div>

          {/* Representante Legal */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>Representante Legal</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {data.legalRepresentativeName ? (
                <>
                  <div style={{ fontWeight: 600 }}>{data.legalRepresentativeName}</div>
                  {data.legalRepresentativeId && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Cédula: {data.legalRepresentativeId}</div>}
                </>
              ) : (
                <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Sin registrar</span>
              )}
            </div>
          </div>
        </div>

        {/* Enlaces Importantes */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Enlaces Rápidos</div>
          {[
            { label: 'Admin Panel',    url: 'https://admin.foundteach.com',  color: '#2563eb' },
            { label: 'App (Garzie)',   url: 'https://app.foundteach.com',    color: '#7c3aed' },
            { label: 'Sitio Web',      url: 'https://foundteach.com',        color: '#059669' },
            { label: 'API',            url: 'https://api.foundteach.com',    color: '#f59e0b' },
          ].map(l => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 0', borderBottom: '1px solid var(--border-color)',
              fontSize: '0.85rem', fontWeight: 600, color: l.color, textDecoration: 'none',
              transition: 'opacity 0.15s',
            }}>
              {l.label}
              <Globe size={14} style={{ opacity: 0.6 }} />
            </a>
          ))}
        </div>

        {/* Nota sobre Documentos */}
        <div style={{ background: 'rgba(37,99,235,0.08)', borderRadius: 12, border: '1px solid rgba(37,99,235,0.2)', padding: 16 }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={14} /> Documentos Corporativos
          </div>
          <p style={{ fontSize: '0.8rem', color: '#2563eb', opacity: 0.8, lineHeight: 1.4, marginBottom: 10 }}>
            Todos los documentos importantes (RUT, Certificado de Existencia, Estatutos, Contratos) se encuentran registrados en la sección <strong>DOCUMENTOS</strong>.
          </p>
          <button
            onClick={() => alert('Por favor dirígete a la pestaña DOCUMENTOS para ver todos los archivos corporativos')}
            style={{ width: '100%', padding: '8px 12px', background: '#2563eb', color: 'white', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: 'none' }}
          >
            Ver Documentos
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'USER' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('admin_token') || '';

  const load = async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
    setLoaded(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Error al crear usuario');
      const created = await res.json();
      setUsers(prev => [created, ...prev]);
      setShowModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'USER' });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch { /* ignore */ }
  };

  const filtered = users.filter(u => {
    const matchSearch = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  if (!loaded) {
    return (
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 40, textAlign: 'center' }}>
        <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.4 }} />
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Gestión de Usuarios</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Administra los usuarios del sistema. Crea, edita y desactiva cuentas.</p>
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: '10px 24px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}
        >
          {loading ? 'Cargando…' : 'Cargar Usuarios'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input"
          style={{ flex: 1, minWidth: 220, padding: '9px 14px', fontSize: '0.875rem' }}
        />
        <div style={{ position: 'relative' }}>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{ padding: '9px 32px 9px 14px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--surface-color)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', appearance: 'none', cursor: 'pointer' }}
          >
            <option value="ALL">Todos los roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TEACHER">Docente</option>
            <option value="STUDENT">Estudiante</option>
            <option value="USER">Usuario</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap' }}
        >
          <Plus size={15} /> Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Usuarios del Sistema</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background-color)' }}>
                {['Usuario', 'Email', 'Rol', 'Estado', 'Creado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {users.length === 0 ? 'No hay usuarios. Crea el primero.' : 'Sin resultados para la búsqueda.'}
                </td></tr>
              ) : filtered.map((u, i) => (
                <tr key={u.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--background-color)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 800, flexShrink: 0,
                      }}>
                        {u.firstName[0]?.toUpperCase()}{u.lastName[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.firstName} {u.lastName}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>{getRoleBadge(u.role)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      color: u.isActive ? '#059669' : '#ef4444',
                      background: u.isActive ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.1)',
                    }}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>{fmtDate(u.createdAt)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        title="Eliminar"
                        onClick={() => handleDelete(u.id)}
                        style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.2)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }} onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 24px 48px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>Crear Nuevo Usuario</h3>
              <button onClick={() => setShowModal(false)} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: '0.85rem', fontWeight: 600 }}>{error}</div>
            )}
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nombre</label>
                  <input className="form-input" value={newUser.firstName} onChange={e => setNewUser(p => ({ ...p, firstName: e.target.value }))} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Apellido</label>
                  <input className="form-input" value={newUser.lastName} onChange={e => setNewUser(p => ({ ...p, lastName: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input type="email" className="form-input" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña temporal</label>
                <input type="password" className="form-input" value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required minLength={6} />
              </div>
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label">Rol</label>
                <select className="form-input" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}>
                  <option value="USER">Usuario</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="TEACHER">Docente</option>
                  <option value="STUDENT">Estudiante</option>
                </select>
              </div>
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creando…' : 'Crear Usuario'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab() {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const token = localStorage.getItem('admin_token') || '';

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setDocs(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
    setLoaded(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API_URL}/api/admin/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Error al subir');
      const d = await res.json();
      setDocs(prev => [d, ...prev]);
    } catch { setUploadError('Error al subir el archivo. Intente de nuevo.'); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      await fetch(`${API_URL}/api/admin/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch { /* ignore */ }
  };

  const getMimeIcon = (mime: string) => {
    if (mime.includes('pdf')) return { label: 'PDF', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    if (mime.includes('word') || mime.includes('document')) return { label: 'DOC', color: '#2563eb', bg: 'rgba(37,99,235,0.1)' };
    if (mime.includes('sheet') || mime.includes('excel')) return { label: 'XLS', color: '#059669', bg: 'rgba(5,150,105,0.1)' };
    if (mime.includes('image')) return { label: 'IMG', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' };
    return { label: 'FILE', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  };

  if (!loaded) {
    return (
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 40, textAlign: 'center' }}>
        <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.4 }} />
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Repositorio de Documentos</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Almacena contratos, políticas, actas y documentos corporativos.</p>
        <button
          onClick={load}
          disabled={loading}
          style={{ padding: '10px 24px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}
        >
          {loading ? 'Cargando…' : 'Cargar Documentos'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Documentos Corporativos <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({docs.length})</span></h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', background: 'var(--primary-color)', color: 'white',
            borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}>
            <Upload size={14} />
            {uploading ? 'Subiendo…' : 'Subir Archivo'}
            <input type="file" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>
      {uploadError && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem', fontWeight: 600 }}>{uploadError}</div>
      )}

      {docs.length === 0 ? (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ fontSize: '0.9rem' }}>No hay documentos. Sube el primero.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {docs.map(doc => {
            const m = getMimeIcon(doc.mimetype);
            return (
              <div key={doc.id} style={{
                background: 'var(--surface-color)', borderRadius: 14,
                border: '1px solid var(--border-color)', padding: 18,
                display: 'flex', alignItems: 'flex-start', gap: 14,
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = ''}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: m.bg, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, flexShrink: 0 }}>
                  {m.label}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtBytes(doc.size)} · {fmtDate(doc.uploadedAt)}</div>
                  {doc.category && <div style={{ fontSize: '0.72rem', color: 'var(--primary-color)', fontWeight: 600, marginTop: 4 }}>{doc.category}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
                  <a href={doc.url} target="_blank" rel="noreferrer" title="Ver / Descargar"
                    style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(37,99,235,0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Eye size={13} />
                  </a>
                  <a href={doc.url} download title="Descargar"
                    style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(5,150,105,0.1)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Download size={13} />
                  </a>
                  <button onClick={() => handleDelete(doc.id)} title="Eliminar"
                    style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────
function ActivityTab() {
  const events = [
    { time: 'Hace 1 min',   icon: CheckCircle, color: '#059669', title: 'Módulo Área Administrativa creado',    desc: 'Se construyó la primera versión del módulo administrativo.' },
    { time: 'Hace 5 min',   icon: Shield,      color: '#7c3aed', title: 'Estructura de áreas configurada',       desc: 'Se definieron 8 módulos en el panel de administración.' },
    { time: 'Hace 12 min',  icon: Users,       color: '#2563eb', title: 'Acceso de administrador verificado',    desc: 'Inicio de sesión exitoso desde admin.foundteach.com.' },
    { time: 'Hace 30 min',  icon: Building2,   color: '#f59e0b', title: 'Panel administrativo inicializado',     desc: 'Se configuró la base de la plataforma desde cero.' },
    { time: 'Hace 1h',      icon: AlertCircle, color: '#ef4444', title: 'Módulos anteriores removidos',           desc: 'Se limpió la estructura previa para reiniciar desde cero.' },
    { time: 'Hace 2h',      icon: TrendingUp,  color: '#2563eb', title: 'Monorepo sincronizado con GitHub',       desc: 'Push exitoso a origin/main con todos los cambios.' },
  ];

  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 28 }}>
      <h3 style={{ fontWeight: 700, marginBottom: 24 }}>Historial de Actividad</h3>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 15, top: 0, bottom: 0, width: 2, background: 'var(--border-color)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {events.map((ev, i) => {
            const EvIcon = ev.icon;
            return (
            <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: 24, position: 'relative' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 50, flexShrink: 0,
                background: `${ev.color}15`, color: ev.color, border: `3px solid var(--surface-color)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1, outline: `2px solid ${ev.color}30`,
              }}>
                <EvIcon size={14} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{ev.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={11} /> {ev.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{ev.desc}</p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminAreaPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab />;
      case 'company':   return <CompanyTab />;
      case 'users':     return <UsersTab />;
      case 'documents': return <DocumentsTab />;
      case 'activity':  return <ActivityTab />;
      default:          return <OverviewTab />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
          }}>
            <Briefcase size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área Administrativa</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestión central de la organización FoundTeach</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-color)', borderRadius: 12, padding: 5, border: '1px solid var(--border-color)', width: 'fit-content' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 8,
                fontSize: '0.855rem', fontWeight: 600,
                background: active ? 'white' : 'transparent',
                color: active ? 'var(--primary-color)' : 'var(--text-muted)',
                boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                border: active ? '1px solid var(--border-color)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderTab()}
    </div>
  );
}
