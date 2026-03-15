import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, ChevronDown,
  Globe, Settings,
  Banknote, LineChart, Truck, PackageCheck, Factory, CheckSquare, Wrench, Building2,
} from 'lucide-react';
import { GamePlayersPage } from './pages/GamePlayersPage';
import { MessagesPage } from './pages/MessagesPage';
import { HcmPage } from './pages/HcmPage';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

// ─── Types ──────────────────────────────────────────────────────────────────
type SectionId = 'ecosystem' | 'fi' | 'co' | 'sd' | 'mm' | 'pp' | 'qm' | 'pm' | 'hcm' | 'basis';

interface NavChild { label: string; path: string; }
interface NavSection {
  id: SectionId;
  label: string;
  code: string;
  icon: React.ReactNode;
  children: NavChild[];
}

// ─── Nav Structure ───────────────────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
  {
    id: 'ecosystem',
    label: 'Web & Plataformas',
    code: 'WEB',
    icon: <Globe size={18} />,
    children: [
      { label: 'Sitio & Servicios', path: '/web-services' },
      { label: 'Inbox / Contactos', path: '/web-messages' },
      { label: 'GeoMath Platform', path: '/web-geomath' },
    ],
  },
  {
    id: 'hcm',
    label: 'Capital Humano',
    code: 'HCM',
    icon: <Building2 size={18} />,
    children: [
      { label: 'Directorio de Equipo', path: '/erp/hcm' },
      { label: 'Contratos', path: '/erp/hcm/contracts' },
      { label: 'Nómina', path: '/erp/hcm/payroll' },
    ],
  },
  {
    id: 'fi',
    label: 'Contabilidad Financiera',
    code: 'FI',
    icon: <Banknote size={18} />,
    children: [
      { label: 'Plan de Cuentas', path: '/erp/fi/accounts' },
      { label: 'Ingresos', path: '/erp/fi/income' },
      { label: 'Gastos', path: '/erp/fi/expenses' },
      { label: 'Extractos Bancarios', path: '/erp/fi/bank' },
    ],
  },
  {
    id: 'co',
    label: 'Controlling',
    code: 'CO',
    icon: <LineChart size={18} />,
    children: [
      { label: 'Centros de Costo', path: '/erp/co/centers' },
      { label: 'P&L por Línea', path: '/erp/co/pl' },
      { label: 'Presupuesto', path: '/erp/co/budget' },
    ],
  },
  {
    id: 'sd',
    label: 'Ventas y Distribución',
    code: 'SD',
    icon: <Truck size={18} />,
    children: [
      { label: 'Clientes / CRM', path: '/erp/sd/customers' },
      { label: 'Catálogo de Servicios', path: '/erp/sd/catalog' },
      { label: 'Cotizaciones', path: '/erp/sd/quotes' },
      { label: 'Pedidos y Facturas', path: '/erp/sd/invoices' },
      { label: 'Pipeline de Ventas', path: '/erp/sd/pipeline' },
    ],
  },
  {
    id: 'mm',
    label: 'Gestión de Materiales',
    code: 'MM',
    icon: <PackageCheck size={18} />,
    children: [
      { label: 'Inventario Licencias', path: '/erp/mm/inventory' },
      { label: 'Proveedores', path: '/erp/mm/suppliers' },
      { label: 'Órdenes de Compra', path: '/erp/mm/purchase' },
    ],
  },
  {
    id: 'pp',
    label: 'Producción y Proyectos',
    code: 'PP',
    icon: <Factory size={18} />,
    children: [
      { label: 'Proyectos de Software', path: '/erp/pp/projects' },
      { label: 'Desarrollo de Cursos', path: '/erp/pp/courses' },
      { label: 'Sprints / Tareas', path: '/erp/pp/tasks' },
    ],
  },
  {
    id: 'qm',
    label: 'Gestión de Calidad',
    code: 'QM',
    icon: <CheckSquare size={18} />,
    children: [
      { label: 'Inspecciones', path: '/erp/qm/inspections' },
      { label: 'NPS & Satisfacción', path: '/erp/qm/nps' },
      { label: 'Incidencias / Bugs', path: '/erp/qm/bugs' },
    ],
  },
  {
    id: 'pm',
    label: 'Mantenimiento',
    code: 'PM',
    icon: <Wrench size={18} />,
    children: [
      { label: 'Activos Cloud', path: '/erp/pm/assets' },
      { label: 'Calendario Renovaciones', path: '/erp/pm/renewals' },
      { label: 'Historial de Incidentes', path: '/erp/pm/incidents' },
    ],
  },
  {
    id: 'basis',
    label: 'Administración del Sistema',
    code: 'BASIS',
    icon: <Settings size={18} />,
    children: [
      { label: 'Usuarios y Roles', path: '/settings/users' },
      { label: 'Configuración General', path: '/settings/config' },
      { label: 'Auditoría y Logs', path: '/settings/audit' },
    ],
  },
];

// ─── Accordion Sidebar ──────────────────────────────────────────────────────
function AccordionSidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<SectionId | null>(() => {
    // Auto-expand section of current path on load
    const current = NAV_SECTIONS.find(s => s.children.some(c => location.pathname.startsWith(c.path)));
    return current?.id ?? null;
  });

  const toggle = (id: SectionId) => {
    setOpenSection(prev => (prev === id ? null : id));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">FoundTeach.</span>
      </div>

      <nav style={{ overflowY: 'auto', flex: 1, padding: '12px 0' }}>
        {/* Dashboard link */}
        <div style={{ padding: '0 12px', marginBottom: 4 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
              fontWeight: 600, fontSize: '0.9rem', border: 'none', transition: 'all 0.2s',
              background: location.pathname === '/' ? 'rgba(37,99,235,0.08)' : 'transparent',
              color: location.pathname === '/' ? 'var(--primary-color)' : 'var(--text-muted)',
            }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
        </div>

        <div style={{ padding: '0 12px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--border-color)', padding: '8px 6px 4px', borderTop: '1px solid var(--border-color)', marginTop: 4 }}>
            MÓDULOS ERP
          </div>
        </div>

        {NAV_SECTIONS.map(section => {
          const isOpen = openSection === section.id;
          const isActiveSection = section.children.some(c => location.pathname.startsWith(c.path));

          return (
            <div key={section.id} style={{ padding: '0 12px', marginBottom: 2 }}>
              {/* Section Header */}
              <button
                onClick={() => toggle(section.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  border: 'none', transition: 'all 0.2s', textAlign: 'left',
                  background: isActiveSection ? 'rgba(37,99,235,0.08)' : isOpen ? 'var(--surface-hover)' : 'transparent',
                  color: isActiveSection ? 'var(--primary-color)' : 'var(--text-muted)',
                }}>
                <span style={{ flexShrink: 0, color: isActiveSection ? 'var(--primary-color)' : 'var(--text-muted)' }}>{section.icon}</span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '0.88rem' }}>{section.label}</span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 800, padding: '2px 5px', borderRadius: 4,
                  background: isActiveSection ? 'rgba(37,99,235,0.15)' : 'var(--border-color)',
                  color: isActiveSection ? 'var(--primary-color)' : 'var(--text-muted)', marginRight: 4,
                }}>{section.code}</span>
                <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }} />
              </button>

              {/* Children */}
              {isOpen && (
                <div style={{ paddingLeft: 12, marginTop: 2, marginBottom: 4 }}>
                  {section.children.map(child => {
                    const isActive = location.pathname === child.path;
                    return (
                      <button
                        key={child.path}
                        onClick={() => navigate(child.path)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                          border: 'none', fontSize: '0.875rem', transition: 'all 0.15s',
                          fontWeight: isActive ? 700 : 500,
                          background: isActive ? 'rgba(37,99,235,0.1)' : 'transparent',
                          color: isActive ? 'var(--primary-color)' : 'var(--text-muted)',
                          borderLeft: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--surface-hover)'; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}>
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: 'none', background: 'transparent', color: 'var(--danger-color)', fontWeight: 600, fontSize: '0.9rem' }}>
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('admin_token'));

  const handleLogin = (token: string) => {
    localStorage.setItem('admin_token', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
      <Route path="/*" element={isAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

// ─── AdminLayout ─────────────────────────────────────────────────────────────
function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  const getTitle = () => {
    for (const section of NAV_SECTIONS) {
      for (const child of section.children) {
        if (location.pathname.startsWith(child.path)) return `${section.code} · ${child.label}`;
      }
    }
    return 'Dashboard General';
  };

  return (
    <div className="admin-layout">
      <AccordionSidebar onLogout={onLogout} />
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">{getTitle()}</h1>
          <div className="user-profile">
            <div className="avatar">M</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Manuel M.</span>
          </div>
        </header>
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* Web */}
            <Route path="/web-services" element={<Placeholder title="Sitio & Servicios" desc="Gestión del portal institucional FoundTeach." icon="🌐" />} />
            <Route path="/web-messages" element={<MessagesPage />} />
            <Route path="/web-geomath" element={<GamePlayersPage />} />
            {/* HCM */}
            <Route path="/erp/hcm" element={<HcmPage />} />
            <Route path="/erp/hcm/*" element={<HcmPage />} />
            {/* FI */}
            <Route path="/erp/fi/*" element={<Placeholder title="FI · Contabilidad Financiera" desc="Libros mayores, cuentas por cobrar y pagar, flujo de caja." icon="💰" />} />
            {/* CO */}
            <Route path="/erp/co/*" element={<Placeholder title="CO · Controlling" desc="Centros de costo, P&L y presupuesto por línea de negocio." icon="📈" />} />
            {/* SD */}
            <Route path="/erp/sd/*" element={<Placeholder title="SD · Ventas y Distribución" desc="CRM, cotizaciones, pedidos y facturación comercial." icon="🚚" />} />
            {/* MM */}
            <Route path="/erp/mm/*" element={<Placeholder title="MM · Gestión de Materiales" desc="Inventario, proveedores y órdenes de compra." icon="📦" />} />
            {/* PP */}
            <Route path="/erp/pp/*" element={<Placeholder title="PP · Producción y Proyectos" desc="Proyectos de software, cursos y sprints." icon="🏭" />} />
            {/* QM */}
            <Route path="/erp/qm/*" element={<Placeholder title="QM · Gestión de Calidad" desc="Inspecciones, NPS y registro de bugs." icon="✅" />} />
            {/* PM */}
            <Route path="/erp/pm/*" element={<Placeholder title="PM · Mantenimiento" desc="Activos cloud, renovaciones e historiales de incidentes." icon="🔧" />} />
            {/* BASIS */}
            <Route path="/settings/*" element={<Placeholder title="BASIS · Administración del Sistema" desc="Usuarios, roles, permisos y auditoría." icon="⚙️" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ─── Placeholder Panel ───────────────────────────────────────────────────────
function Placeholder({ title, desc, icon = '🚀' }: { title: string; desc: string; icon?: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', padding: '60px 40px', borderRadius: 16, border: '1px solid var(--border-color)', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: 20 }}>{icon}</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: 12 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>{desc}</p>
      <div style={{ display: 'inline-block', marginTop: 24, padding: '8px 20px', background: 'rgba(37,99,235,0.08)', color: 'var(--primary-color)', borderRadius: 20, fontWeight: 700, fontSize: '0.85rem' }}>
        Módulo en Desarrollo
      </div>
    </div>
  );
}

// ─── Login ───────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
      onLogin(data.access_token);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: 16 }}>FoundTeach.</div>
          <h1 className="auth-title">ERP Hub</h1>
          <p className="auth-subtitle">Centro de control unificado · FoundTeach EdTech SAS</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Correo Institucional</label>
            <input type="email" className="form-input" placeholder="usuario@foundteach.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 24 }}>
            {loading ? 'Verificando...' : 'Acceder al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Módulo HCM', sub: 'Capital Humano', value: 'Activo', color: '#2563eb', icon: '👥' },
          { label: 'Mensajes recibidos', sub: 'Inbox sitio web', value: '12', color: '#d97706', icon: '📩' },
          { label: 'Jugadores GeoMath', sub: 'Plataforma educativa', value: '145+', color: '#059669', icon: '🎮' },
          { label: 'Módulos ERP', sub: 'Planificados', value: '8', color: '#7c3aed', icon: '🏗️' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '24px', borderTop: `3px solid ${s.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: '2.2rem' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{s.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '32px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-main)' }}>🗺️ Estado del ERP · FoundTeach EdTech SAS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { code: 'HCM', label: 'Capital Humano', status: 'En desarrollo', color: '#2563eb' },
            { code: 'SD', label: 'Ventas (CRM)', status: 'Planificado', color: '#94a3b8' },
            { code: 'FI', label: 'Finanzas', status: 'Planificado', color: '#94a3b8' },
            { code: 'CO', label: 'Controlling', status: 'Planificado', color: '#94a3b8' },
            { code: 'MM', label: 'Materiales', status: 'Planificado', color: '#94a3b8' },
            { code: 'PP', label: 'Producción', status: 'Planificado', color: '#94a3b8' },
            { code: 'QM', label: 'Calidad', status: 'Planificado', color: '#94a3b8' },
            { code: 'PM', label: 'Mantenimiento', status: 'Planificado', color: '#94a3b8' },
          ].map(m => (
            <div key={m.code} style={{ padding: '14px 18px', border: '1px solid var(--border-color)', borderRadius: 10, borderLeft: `3px solid ${m.color}` }}>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: m.color }}>{m.code}</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: '0.78rem', color: m.status === 'En desarrollo' ? '#059669' : 'var(--text-muted)', fontWeight: 600 }}>{m.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
