import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Loader2, MessageSquare, Briefcase } from 'lucide-react';
import './App.css';

// Config
const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

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
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
      />
      <Route 
        path="/*" 
        element={isAuthenticated ? <AdminLayout onLogout={handleLogout} /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

// --- Layout ---
function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/services', label: 'Servicios', icon: Briefcase },
    { path: '/messages', label: 'Mensajes', icon: MessageSquare },
    { path: '/users', label: 'Usuarios', icon: Users },
  ];

  const currentPage = navItems.find(item => item.path === location.pathname)?.label || 'Panel de Control';

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">FoundTeach.</span>
        </div>
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', padding: '16px' }}>
          <button className="nav-item" onClick={onLogout} style={{ width: '100%', color: 'var(--danger-color)' }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <h1 className="page-title">{currentPage}</h1>
          <div className="user-profile">
            <div className="avatar">A</div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Admin</span>
          </div>
        </header>
        
        <div className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<div style={{ padding: 40, textAlign: 'center' }}>Gestión de Servicios (Próximamente)</div>} />
            <Route path="/messages" element={<div style={{ padding: 40, textAlign: 'center' }}>Mensajes de Contacto (Próximamente)</div>} />
            <Route path="/users" element={<div style={{ padding: 40, textAlign: 'center' }}>Gestión de Usuarios (Próximamente)</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// --- Pages ---

function Login({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      onLogin(data.access_token);
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Admin Login</h1>
          <p className="auth-subtitle">Ingresa tus credenciales de administrador</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: 'var(--danger-color)', marginBottom: '16px', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="admin@foundteach.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isLoading ? <Loader2 size={20} className="spin" /> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({ services: 0, messages: 0, users: 0, status: 'loading' });

  useEffect(() => {
    // In a complete implementation, fetch actual stats here.
    // For now, simulating API load.
    setTimeout(() => {
      setStats({ services: 5, messages: 12, users: 2, status: 'loaded' });
    }, 1000);
  }, []);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Briefcase size={24} /></div>
          <div className="stat-info">
            <h3>Servicios Activos</h3>
            <div className="stat-value">{stats.status === 'loaded' ? stats.services : '-'}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><MessageSquare size={24} /></div>
          <div className="stat-info">
            <h3>Mensajes Nuevos</h3>
            <div className="stat-value">{stats.status === 'loaded' ? stats.messages : '-'}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon"><Users size={24} /></div>
          <div className="stat-info">
            <h3>Usuarios del Sistema</h3>
            <div className="stat-value">{stats.status === 'loaded' ? stats.users : '-'}</div>
          </div>
        </div>
      </div>
      
      <div style={{ backgroundColor: 'var(--surface-dark)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Bienvenido al Panel de Administración</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Desde aquí podrás gestionar todo el contenido de la plataforma de FoundTeach. 
          Selecciona una opción en el menú lateral para comenzar.
        </p>
      </div>
    </div>
  );
}

export default App;
