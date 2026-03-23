import { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Globe, Mail, Gamepad2, Settings, ChevronRight, Users, Building2, BarChart2, FolderOpen, DollarSign, FileText, BarChart, Handshake, KanbanSquare, ClipboardList,
} from 'lucide-react';
import { GamePlayersPage } from './pages/GamePlayersPage';
import { MessagesPage } from './pages/MessagesPage';
import { WebServicesPage } from './pages/WebServicesPage';
import { UsersPage } from './pages/UsersPage';
import { CompanyPage } from './pages/CompanyPage';
import { KpiPage } from './pages/KpiPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { FinanceReportPage } from './pages/FinanceReportPage';
import { ClientesPage } from './pages/ClientesPage';
import { PipelinePage } from './pages/PipelinePage';
import { QuotesPage } from './pages/QuotesPage';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

// ─── Nav structure ────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Sitio Web',
    items: [
      { label: 'Servicios',  path: '/web/services', icon: <Globe size={17} /> },
      { label: 'Mensajes',   path: '/web/messages', icon: <Mail size={17} /> },
    ],
  },
  {
    title: 'Plataforma GeoMath',
    items: [
      { label: 'Jugadores',  path: '/geomath/players', icon: <Gamepad2 size={17} /> },
    ],
  },
  {
    title: 'Administración',
    items: [
      { label: 'KPIs',        path: '/admin/kpis',       icon: <BarChart2 size={17} /> },
      { label: 'Usuarios',    path: '/admin/users',      icon: <Users size={17} /> },
      { label: 'Empresa',     path: '/admin/company',    icon: <Building2 size={17} /> },
      { label: 'Documentos',  path: '/admin/documents',  icon: <FolderOpen size={17} /> },
    ],
  },
  {
    title: 'Finanzas',
    items: [
      { label: 'Ingresos & Gastos', path: '/finance/transactions', icon: <DollarSign size={17} /> },
      { label: 'Facturas',          path: '/finance/invoices',     icon: <FileText size={17} /> },
      { label: 'Reportes',          path: '/finance/report',       icon: <BarChart size={17} /> },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Clientes',      path: '/crm/clients',   icon: <Handshake size={17} /> },
      { label: 'Pipeline',      path: '/crm/pipeline',  icon: <KanbanSquare size={17} /> },
      { label: 'Cotizaciones',  path: '/crm/quotes',    icon: <ClipboardList size={17} /> },
    ],
  },
];


// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-header">
        <span className="sidebar-logo">FoundTeach.</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {/* Dashboard */}
        <button
          onClick={() => navigate('/')}
          className={`nav-main-item ${location.pathname === '/' ? 'active' : ''}`}
        >
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
          {location.pathname === '/' && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
        </button>

        {/* Groups */}
        {NAV_GROUPS.map(group => (
          <div key={group.title} style={{ marginTop: 24 }}>
            <div className="nav-group-title">{group.title}</div>
            {group.items.map(item => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-main-item ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {isActive(item.path) && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={() => navigate('/settings')}
          className={`nav-main-item ${isActive('/settings') ? 'active' : ''}`}
          style={{ marginBottom: 4 }}
        >
          <Settings size={17} />
          <span>Configuración</span>
        </button>
        <button
          onClick={onLogout}
          className="nav-main-item"
          style={{ color: 'var(--danger-color)' }}
        >
          <LogOut size={17} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
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

// ─── AdminLayout ──────────────────────────────────────────────────────────────
function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();

  const getPageTitle = () => {
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        if (location.pathname.startsWith(item.path)) return item.label;
      }
    }
    if (location.pathname.startsWith('/settings')) return 'Configuración';
    return 'Dashboard';
  };

  return (
    <div className="admin-layout">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">{getPageTitle()}</h1>
          <div className="user-profile">
            <div className="avatar">M</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>Manuel M.</span>
          </div>
        </header>
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/web/services" element={<WebServicesPage />} />
            <Route path="/web/messages" element={<MessagesPage />} />
            <Route path="/geomath/players" element={<GamePlayersPage />} />
            <Route path="/admin/kpis" element={<KpiPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/company" element={<CompanyPage />} />
            <Route path="/admin/documents" element={<DocumentsPage />} />
            <Route path="/finance/transactions" element={<TransactionsPage />} />
            <Route path="/finance/invoices" element={<InvoicesPage />} />
            <Route path="/finance/report" element={<FinanceReportPage />} />
            <Route path="/crm/clients" element={<ClientesPage />} />
            <Route path="/crm/pipeline" element={<PipelinePage />} />
            <Route path="/crm/quotes" element={<QuotesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard() {
  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
          ¡Bienvenido, Manuel! 👋
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Panel de control de <strong>FoundTeach</strong> — gestiona tu sitio web y plataformas desde aquí.
        </p>
      </div>

      {/* Quick Access Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        {[
          {
            icon: '🌐',
            label: 'Servicios del Sitio',
            desc: 'Edita los servicios que aparecen en foundteach.com',
            path: '/web/services',
            color: '#2563eb',
          },
          {
            icon: '📩',
            label: 'Mensajes de Contacto',
            desc: 'Revisa los mensajes recibidos a través del sitio web',
            path: '/web/messages',
            color: '#d97706',
          },
          {
            icon: '🎮',
            label: 'Jugadores GeoMath',
            desc: 'Administra los jugadores de la plataforma educativa',
            path: '/geomath/players',
            color: '#059669',
          },
        ].map(card => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}

function DashboardCard({ icon, label, desc, path, color }: {
  icon: string; label: string; desc: string; path: string; color: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      style={{
        background: 'var(--surface-color)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        padding: '28px 24px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.2s',
        borderTop: `3px solid ${color}`,
        width: '100%',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = '';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
      }}
    >
      <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
      <div style={{ marginTop: 16, fontSize: '0.82rem', fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: 4 }}>
        Ir al módulo <ChevronRight size={14} />
      </div>
    </button>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsPage() {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 48, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚙️</div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 10 }}>Configuración</h2>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
        Próximamente: gestión de usuarios, cambio de contraseña y preferencias del sistema.
      </p>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: 16 }}>
            FoundTeach.
          </div>
          <h1 className="auth-title">Panel de Control</h1>
          <p className="auth-subtitle">Accede para gestionar tu plataforma</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input type="email" className="form-input" placeholder="usuario@foundteach.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 24 }}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
