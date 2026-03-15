import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, LogOut, Loader2, MessageSquare, 
  Globe, Gamepad2, ShoppingCart, Package, Building2, Settings 
} from 'lucide-react';
import { GamePlayersPage } from './pages/GamePlayersPage';
import { MessagesPage } from './pages/MessagesPage';
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
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Panel General';
      case '/services': return 'Sitio Institucional & Servicios';
      case '/messages': return 'Mensajes de Contacto';
      case '/game-players': return 'Jugadores de GeoMath';
      case '/sales': return 'Ventas y Facturación (ERP)';
      case '/crm': return 'Clientes y CRM (ERP)';
      case '/inventory': return 'Gestión de Inventario (ERP)';
      case '/hr': return 'Recursos Humanos (ERP)';
      case '/settings': return 'Configuración del Sistema';
      default: return 'Panel de Control';
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">FoundTeach.</span>
        </div>
        
        <nav className="nav-links">
          <div className="nav-section-title">Principal</div>
          <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          
          <div className="nav-section-title">Plataformas Web</div>
          <Link to="/services" className={`nav-item ${location.pathname === '/services' ? 'active' : ''}`}>
            <Globe size={20} /> <span>Sitio & Servicios</span>
          </Link>
          <Link to="/messages" className={`nav-item ${location.pathname === '/messages' ? 'active' : ''}`}>
            <MessageSquare size={20} /> <span>Bandeja Entrada</span>
          </Link>
          <Link to="/game-players" className={`nav-item ${location.pathname === '/game-players' ? 'active' : ''}`}>
            <Gamepad2 size={20} /> <span>GeoMath Players</span>
          </Link>

          <div className="nav-section-title">Sistema ERP</div>
          <Link to="/sales" className={`nav-item ${location.pathname === '/sales' ? 'active' : ''}`}>
            <ShoppingCart size={20} /> <span>Ventas y Facturas</span>
          </Link>
          <Link to="/crm" className={`nav-item ${location.pathname === '/crm' ? 'active' : ''}`}>
            <Users size={20} /> <span>CRM y Clientes</span>
          </Link>
          <Link to="/inventory" className={`nav-item ${location.pathname === '/inventory' ? 'active' : ''}`}>
            <Package size={20} /> <span>Inventario</span>
          </Link>
          <Link to="/hr" className={`nav-item ${location.pathname === '/hr' ? 'active' : ''}`}>
            <Building2 size={20} /> <span>Recursos Humanos</span>
          </Link>
          
          <div className="nav-section-title">Sistema</div>
          <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={20} /> <span>Configuración</span>
          </Link>
        </nav>
        
        <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid var(--border-color)' }}>
          <button className="nav-item" onClick={onLogout} style={{ width: '100%', color: 'var(--danger-color)' }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
            <Route path="/services" element={<PlaceholderPanel title="Gestión de Sitio Web" desc="Administración del contenido del sitio, banners y servicios." />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/game-players" element={<GamePlayersPage />} />
            
            <Route path="/sales" element={<PlaceholderPanel title="Ventas y Facturación" desc="Módulo de facturación electrónica, cotizaciones y cobros recurrentes." icon="🛒" />} />
            <Route path="/crm" element={<PlaceholderPanel title="CRM y Clientes" desc="Embudo de ventas, seguimiento de contactos e historial de interacciones." icon="👥" />} />
            <Route path="/inventory" element={<PlaceholderPanel title="Inventario" desc="Control de stock para productos físicos y licencias digitales." icon="📦" />} />
            <Route path="/hr" element={<PlaceholderPanel title="Recursos Humanos" desc="Gestión de nómina, asistencias, profesores y personal operativo." icon="🏢" />} />
            <Route path="/settings" element={<PlaceholderPanel title="Configuración del Sistema" desc="Roles, permisos, variables de entorno y preferencias generales." icon="⚙️" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// --- Pages ---

function PlaceholderPanel({ title, desc, icon = "🚀" }: { title: string, desc: string, icon?: string }) {
  return (
    <div style={{ backgroundColor: 'var(--surface-color)', padding: '60px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>{icon}</div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-main)' }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', fontSize: '1rem' }}>{desc}</p>
      <div style={{ display: 'inline-block', marginTop: '24px', padding: '8px 16px', background: 'rgba(37,99,235,0.1)', color: 'var(--primary-color)', borderRadius: '20px', fontWeight: 600, fontSize: '0.85rem' }}>
        Módulo en Desarrollo
      </div>
    </div>
  );
}

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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '-1px' }}>FoundTeach.</span>
          </div>
          <h1 className="auth-title">Plataforma Hub</h1>
          <p className="auth-subtitle">Centro de control unificado</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem', textAlign: 'center', fontWeight: 500 }}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Correo Institucional</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="manuel.martinez@foundteach.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Contraseña Administrativa</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
            {isLoading ? <Loader2 size={20} className="spin" /> : 'Acceder al Sistema'}
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
    setTimeout(() => {
      setStats({ services: 5, messages: 12, users: 145, status: 'loaded' });
    }, 1000);
  }, []);

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><Globe size={28} /></div>
          <div className="stat-info">
            <h3>Visitas Web (Mes)</h3>
            <div className="stat-value">12.5K</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon orange"><MessageSquare size={28} /></div>
          <div className="stat-info">
            <h3>Mensajes Nuevos</h3>
            <div className="stat-value">{stats.status === 'loaded' ? stats.messages : '-'}</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon green"><ShoppingCart size={28} /></div>
          <div className="stat-info">
            <h3>Ventas (Mes)</h3>
            <div className="stat-value">$14.2M</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '24px' }}>
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: 700 }}>Descripción General de FoundTeach Hub</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Bienvenido, Manuel. Desde esta plataforma central tienes control absoluto sobre todos los módulos de FoundTeach.
            Usa el menú lateral para navegar entre la administración web (como revisar mensajes de contacto) y los próximos módulos del ERP (Ventas, Clientes e Inventario).
          </p>
        </div>
        
        <div style={{ backgroundColor: 'var(--surface-color)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
           <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)', fontWeight: 600 }}>Actividad Reciente</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
               <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary-color)' }} />
               <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}><span style={{ fontWeight: 600 }}>Carlos</span> envió un mensaje</div>
             </div>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
               <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--secondary-color)' }} />
               <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Nueva cotización aprobada</div>
             </div>
             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
               <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--text-muted)' }} />
               <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Backup completado</div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default App;
