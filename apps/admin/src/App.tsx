import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, Users, LogOut, Loader2, MessageSquare, 
  Globe, Gamepad2, ShoppingCart, Settings, 
  Banknote, LineChart, Truck, PackageCheck, Factory, PlaySquare, Wrench, Building2 
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
      
      // Integraciones Web
      case '/web-services': return 'Sitio Institucional & Servicios (WP)';
      case '/web-messages': return 'Bandeja de Entrada (CRM Inbox)';
      case '/web-geomath': return 'GeoMath Platform';

      // Módulos ERP SAP
      case '/erp/fi': return 'FI - Gestión Financiera (Financial Accounting)';
      case '/erp/co': return 'CO - Controlling (Gestión de Costos)';
      case '/erp/sd': return 'SD - Ventas y Distribución (Sales & Distribution)';
      case '/erp/mm': return 'MM - Gestión de Materiales (Materials Management)';
      case '/erp/pp': return 'PP - Planificación de Producción (Production Planning)';
      case '/erp/qm': return 'QM - Gestión de Calidad (Quality Management)';
      case '/erp/pm': return 'PM - Mantenimiento de Planta (Plant Maintenance)';
      case '/erp/hcm': return 'HCM - Gestión de Capital Humano (Human Resources)';
      
      // Sistema
      case '/settings': return 'BASIS - Administración del Sistema';
      default: return 'Panel de Control ERP';
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
          
          <div className="nav-section-title">FoundTeach Ecosystem</div>
          <Link to="/web-services" className={`nav-item ${location.pathname === '/web-services' ? 'active' : ''}`}>
            <Globe size={20} /> <span>Web & Servicios</span>
          </Link>
          <Link to="/web-messages" className={`nav-item ${location.pathname === '/web-messages' ? 'active' : ''}`}>
            <MessageSquare size={20} /> <span>Inbox & Contactos</span>
          </Link>
          <Link to="/web-geomath" className={`nav-item ${location.pathname === '/web-geomath' ? 'active' : ''}`}>
            <Gamepad2 size={20} /> <span>GeoMath Platform</span>
          </Link>

          <div className="nav-section-title">SAP ERP Modules</div>
          <Link to="/erp/fi" className={`nav-item ${location.pathname === '/erp/fi' ? 'active' : ''}`}>
            <Banknote size={20} /> <span>FI - Finanzas</span>
          </Link>
          <Link to="/erp/co" className={`nav-item ${location.pathname === '/erp/co' ? 'active' : ''}`}>
            <LineChart size={20} /> <span>CO - Controlling</span>
          </Link>
          <Link to="/erp/sd" className={`nav-item ${location.pathname === '/erp/sd' ? 'active' : ''}`}>
            <Truck size={20} /> <span>SD - Ventas y Distrib.</span>
          </Link>
          <Link to="/erp/mm" className={`nav-item ${location.pathname === '/erp/mm' ? 'active' : ''}`}>
            <PackageCheck size={20} /> <span>MM - Materiales</span>
          </Link>
          <Link to="/erp/pp" className={`nav-item ${location.pathname === '/erp/pp' ? 'active' : ''}`}>
            <Factory size={20} /> <span>PP - Producción</span>
          </Link>
          <Link to="/erp/qm" className={`nav-item ${location.pathname === '/erp/qm' ? 'active' : ''}`}>
            <PlaySquare size={20} /> <span>QM - Calidad</span>
          </Link>
          <Link to="/erp/pm" className={`nav-item ${location.pathname === '/erp/pm' ? 'active' : ''}`}>
            <Wrench size={20} /> <span>PM - Mantenimiento</span>
          </Link>
          <Link to="/erp/hcm" className={`nav-item ${location.pathname === '/erp/hcm' ? 'active' : ''}`}>
            <Building2 size={20} /> <span>HCM - RRHH</span>
          </Link>
          
          <div className="nav-section-title">System (BASIS)</div>
          <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
            <Settings size={20} /> <span>Configuración y Usuarios</span>
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
            
            {/* FoundTeach Interfaces */}
            <Route path="/web-services" element={<PlaceholderPanel title="Gestión de Plataforma Web" desc="Administración del contenido del portal institucional y módulos CMS." />} />
            <Route path="/web-messages" element={<MessagesPage />} />
            <Route path="/web-geomath" element={<GamePlayersPage />} />
            
            {/* SAP Modules */}
            <Route path="/erp/fi" element={<PlaceholderPanel title="Módulo FI: Finanzas" desc="Libros mayores, cuentas por cobrar, cuentas por pagar y contabilidad bancaria." icon="💰" />} />
            <Route path="/erp/co" element={<PlaceholderPanel title="Módulo CO: Controlling" desc="Centro de costos, margen de rentabilidad y planificación financiera." icon="📈" />} />
            <Route path="/erp/sd" element={<PlaceholderPanel title="Módulo SD: Ventas y Distribución" desc="Gestión de clientes (CRM), cotizaciones, pedidos, facturación comercial." icon="🚚" />} />
            <Route path="/erp/mm" element={<PlaceholderPanel title="Módulo MM: Gestión de Materiales" desc="Inventario, compras, proveedores y control de stock de licencias." icon="📦" />} />
            <Route path="/erp/pp" element={<PlaceholderPanel title="Módulo PP: Planificación Producción" desc="Desarrollo de cursos, planificación operativa y rutas de aprendizaje." icon="🏭" />} />
            <Route path="/erp/qm" element={<PlaceholderPanel title="Módulo QM: Gestión de Calidad" desc="Inspecciones de software, control de calidad del contenido educativo." icon="✅" />} />
            <Route path="/erp/pm" element={<PlaceholderPanel title="Módulo PM: Mantenimiento Planta" desc="Mantenimiento de servidores, infraestructura tecnológica y licencias cloud." icon="🔧" />} />
            <Route path="/erp/hcm" element={<PlaceholderPanel title="Módulo HCM: Capital Humano" desc="Nómina, reclutamiento, gestión de instructores y desempeño laboral." icon="👥" />} />
            
            {/* Basis */}
            <Route path="/settings" element={<PlaceholderPanel title="Módulo BASIS: Sistema" desc="Administración de roles, copias de seguridad, logs y auditoría." icon="⚙️" />} />
            
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
