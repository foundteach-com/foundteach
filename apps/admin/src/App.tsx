import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, LogOut, Settings, ChevronRight,
  Briefcase, Wrench, Laptop, BookOpen, Palette, Megaphone, Calculator, Scale
} from 'lucide-react';
import { AdminAreaPage } from './pages/AdminAreaPage';
import { OpsAreaPage } from './pages/OpsAreaPage';
import { TechAreaPage } from './pages/TechAreaPage';
import { AcademicAreaPage } from './pages/AcademicAreaPage';
import { DesignAreaPage } from './pages/DesignAreaPage';
import { MarketingAreaPage } from './pages/MarketingAreaPage';
import { AccountantPage } from './pages/AccountantPage';
import { LawyerPage } from './pages/LawyerPage';
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
    title: 'Área Administrativa',
    items: [
      { label: 'Administración', path: '/admin-area', icon: <Briefcase size={17} /> },
    ],
  },
  {
    title: 'Área Operativa',
    items: [
      { label: 'Operaciones', path: '/ops-area', icon: <Wrench size={17} /> },
    ],
  },
  {
    title: 'Área Tecnológica',
    items: [
      { label: 'Tecnología', path: '/tech-area', icon: <Laptop size={17} /> },
    ],
  },
  {
    title: 'Área Académica',
    items: [
      { label: 'Académico', path: '/academic-area', icon: <BookOpen size={17} /> },
    ],
  },
  {
    title: 'Área de Diseño',
    items: [
      { label: 'Diseño', path: '/design-area', icon: <Palette size={17} /> },
    ],
  },
  {
    title: 'Área de Marketing',
    items: [
      { label: 'Marketing', path: '/marketing-area', icon: <Megaphone size={17} /> },
    ],
  },
  {
    title: 'Áreas Externas',
    items: [
      { label: 'Contador', path: '/external/accountant', icon: <Calculator size={17} /> },
      { label: 'Abogado', path: '/external/lawyer', icon: <Scale size={17} /> },
    ],
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const isActive = (path: string) => location.pathname.startsWith(path);

  useEffect(() => {
    for (const group of NAV_GROUPS) {
      if (group.items.some(item => isActive(item.path))) {
        setExpandedGroup(group.title);
        break;
      }
    }
  }, [location.pathname]);

  const toggleGroup = (title: string) => {
    setExpandedGroup(prev => prev === title ? null : title);
  };

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
        {NAV_GROUPS.map(group => {
          const isExpanded = expandedGroup === group.title;
          const hasActiveItem = group.items.some(item => isActive(item.path));
          
          return (
            <div key={group.title} style={{ marginTop: 16 }}>
              <button
                onClick={() => toggleGroup(group.title)}
                className={`nav-group-button ${hasActiveItem ? 'active-group' : ''}`}
              >
                <div className="nav-group-title" style={{ margin: 0, padding: 0 }}>{group.title}</div>
                <ChevronRight 
                  size={14} 
                  style={{ 
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: 'var(--text-muted)'
                  }} 
                />
              </button>
              
              <div 
                className="nav-group-content"
                style={{ 
                  display: isExpanded ? 'block' : 'none',
                  marginTop: 4
                }}
              >
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
            </div>
          );
        })}
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
            <Route path="/admin-area" element={<AdminAreaPage />} />
            <Route path="/ops-area" element={<OpsAreaPage />} />
            <Route path="/tech-area" element={<TechAreaPage />} />
            <Route path="/academic-area" element={<AcademicAreaPage />} />
            <Route path="/design-area" element={<DesignAreaPage />} />
            <Route path="/marketing-area" element={<MarketingAreaPage />} />
            <Route path="/external/accountant" element={<AccountantPage />} />
            <Route path="/external/lawyer" element={<LawyerPage />} />
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

      {/* Próximamente: Estadísticas y accesos rápidos */}
      <div style={{ padding: '40px', border: '2px dashed var(--border-color)', borderRadius: 16, textAlign: 'center', color: 'var(--text-muted)' }}>
        Estructura vacía. Listo para nuevos módulos.
      </div>
    </div>
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
