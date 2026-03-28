import { useState, useEffect, useCallback } from 'react';
import { Download, Package, Search, Plus, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/sd`;

interface Product {
  id: string;
  name: string;
  code: string;
  description: string | null;
  category: string;
  unitPrice: number;
  currency: string;
  unit: string;
  isActive: boolean;
}

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

function fmt(n: number, curr = 'COP') {
  return new Intl.NumberFormat('es-CO', { 
    style: 'currency', 
    currency: curr, 
    minimumFractionDigits: 0 
  }).format(n);
}

export function InventariosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/products`, { headers: authHeader() });
      if (res.ok) {
        setProducts(await res.json());
      } else {
        setError('No se pudieron cargar los productos');
      }
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchProducts(); }, [fetchProducts]);

  const exportToCSV = () => {
    if (products.length === 0) return;

    // Header
    const headers = ['Código', 'Nombre', 'Categoría', 'Precio', 'Unidad', 'Estado'];
    
    // Rows
    const rows = products.map(p => [
      p.code,
      p.name,
      p.category,
      p.unitPrice,
      p.unit,
      p.isActive ? 'Activo' : 'Inactivo'
    ]);

    // Build CSV content - Add BOM for Excel UTF-8 support
    const csvContent = "\uFEFF" + [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    // Create blobs and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario_productos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-fade-in" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-row:hover {
          background: rgba(37, 99, 235, 0.03) !important;
          transform: scale(1.002);
        }
        .btn-hover:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: 'rgba(37,99,235,0.1)', padding: 12, borderRadius: 16 }}>
              <Package size={32} color="var(--primary-color)" />
            </div>
            Inventarios
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: 6, fontWeight: 500 }}>
            Catálogo maestro de productos y servicios · <span style={{ color: 'var(--primary-color)' }}>Ospina Comercializadora</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <button 
            onClick={exportToCSV}
            className="btn-hover"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, 
              background: 'var(--surface-color)', color: 'var(--text-main)', 
              padding: '12px 22px', borderRadius: 14, fontWeight: 700, 
              border: '1px solid var(--border-color)', cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Download size={20} />
            Exportar Productos
          </button>
          <button 
            className="btn-hover"
            style={{ 
              display: 'flex', alignItems: 'center', gap: 10, 
              background: 'linear-gradient(135deg, var(--primary-color), #4f46e5)', 
              color: 'white', 
              padding: '12px 22px', borderRadius: 14, fontWeight: 700, 
              border: 'none', cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        <button style={{ 
          paddingBottom: 12, borderBottom: '3px solid var(--primary-color)', 
          color: 'var(--text-main)', fontWeight: 700, background: 'none', 
          border: 'none', cursor: 'pointer', 
          fontSize: '0.95rem' 
        }}>
          Productos
        </button>
        <button style={{ 
          paddingBottom: 12, color: 'var(--text-muted)', fontWeight: 500, 
          background: 'none', border: 'none', cursor: 'pointer', 
          fontSize: '0.95rem' 
        }}>
          Categorías
        </button>
        <button style={{ 
          paddingBottom: 12, color: 'var(--text-muted)', fontWeight: 500, 
          background: 'none', border: 'none', cursor: 'pointer', 
          fontSize: '0.95rem' 
        }}>
          Stock Crítico
        </button>
      </div>

      {/* Search & Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o código..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 16px 12px 42px', borderRadius: 12, 
              background: 'var(--surface-color)', border: '1px solid var(--border-color)', 
              color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none'
            }} 
          />
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Ref.</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-color)' }}>{products.length}</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ 
        background: 'var(--surface-color)', borderRadius: 16, 
        border: '1px solid var(--border-color)', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
            Cargando inventario...
          </div>
        ) : error ? (
          <div style={{ padding: 64, textAlign: 'center', color: '#ef4444' }}>
            <AlertTriangle size={32} style={{ marginBottom: 12 }} />
            <p>{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📦</div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>No se encontraron productos</p>
            <p style={{ fontSize: '0.9rem' }}>Prueba con otros términos de búsqueda.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)' }}>
                  {['Código', 'Producto', 'Categoría', 'Precio Unit.', 'Unidad', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr 
                    key={p.id} 
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-color)' : 'none', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--primary-color)' }}>{p.code}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{p.description}</div>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: 'var(--background-color)', padding: '4px 10px', borderRadius: 8, fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>{fmt(p.unitPrice, p.currency)}</td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)' }}>{p.unit}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, 
                        background: p.isActive ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: p.isActive ? '#059669' : '#ef4444'
                      }}>
                        {p.isActive ? 'En Stock' : 'Agotado'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>⋮</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
