import { useState } from 'react';
import {
  Palette, Image as ImageIcon, Upload, Trash2, X, Clock, Loader, Eye, Layers, Type, Paintbrush, RefreshCw, BarChart2, Search
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const tok = () => localStorage.getItem('admin_token') || '';

interface DocumentItem {
  id: string;
  name: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  category: string;
  uploadedAt: string;
}

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: React.ComponentType<{ size?: number }>; color: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, transition: 'transform 0.2s,box-shadow 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>
      <div style={{ width: 50, height: 50, borderRadius: 13, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={22} /></div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; text: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
      <Icon size={32} style={{ margin: '0 auto' }} /><p style={{ marginTop: 12, fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

function DesignModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 500, boxShadow: '0 24px 48px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{title}</h3>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────
function OverviewTab({ assets }: { assets: DocumentItem[] }) {
  const recentAssets = assets.slice(0, 4);
  const imagesCount = assets.filter(a => a.mimetype.startsWith('image/')).length;
  const vectorsCount = assets.filter(a => a.mimetype.includes('svg') || a.mimetype.includes('pdf')).length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Total Activos"     value={assets.length}   sub="archivos subidos" icon={Layers} color="#8b5cf6" />
        <KpiCard label="Imágenes"          value={imagesCount}     sub="jpg, png, webp"   icon={ImageIcon} color="#ec4899" />
        <KpiCard label="Vectores / Docs"   value={vectorsCount}    sub="svg, pdf"         icon={Palette} color="#14b8a6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={16} color="var(--primary-color)" /> Subidas Recientes
          </h3>
          {recentAssets.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay activos recientes.</p>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {recentAssets.map(a => {
                  const isImage = a.mimetype.startsWith('image/');
                  return (
                    <div key={a.id} className="group" style={{ borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden', position: 'relative' }}>
                      {isImage ? (
                        <div style={{ height: 120, background: 'var(--background-color)', backgroundImage: `url(${a.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ) : (
                        <div style={{ height: 120, background: 'var(--background-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <Layers size={32} />
                        </div>
                      )}
                      <div style={{ padding: '10px 12px', background: 'var(--surface-color)', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{fmtSize(a.size)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ─── Assets Tab ───────────────────────────────────────────────────────────────
function AssetsTab({ assets, setAssets }: { assets: DocumentItem[]; setAssets: React.Dispatch<React.SetStateAction<DocumentItem[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);
    formData.append('category', 'design');

    try {
      const res = await fetch(`${API_URL}/api/documents/upload`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${tok()}` }, 
        body: formData 
      });
      if (res.ok) { 
        const data = await res.json(); 
        setAssets(p => [data, ...p]); 
        setModal(false); 
        setFile(null); 
        setName(''); 
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar activo de diseño? Esta acción no se puede deshacer.')) return;
    await fetch(`${API_URL}/api/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` } });
    setAssets(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-color)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Upload size={14} /> Subir Activo
        </button>
      </div>

      {filteredAssets.length === 0 ? <EmptyState icon={ImageIcon} text={assets.length === 0 ? "No hay activos de diseño." : "No hay resultados para la búsqueda."} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {filteredAssets.map(a => {
            const isImage = a.mimetype.startsWith('image/');
            return (
              <div key={a.id} style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 140, background: 'var(--background-color)', backgroundImage: isImage ? `url(${a.url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                  {!isImage && <Layers size={40} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />}
                </div>
                <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={a.name}>{a.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 12 }}>{fmtSize(a.size)} • {fmtDate(a.uploadedAt)}</div>
                  
                  <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                    <a href={a.url} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '6px', borderRadius: 6, background: 'var(--background-color)', border: '1px solid var(--border-color)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', transition: 'background 0.2s' }}>
                      <Eye size={12} /> Ver
                    </a>
                    <button onClick={() => handleDelete(a.id)} style={{ width: 32, borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <DesignModal title="Subir Activo Visual" onClose={() => setModal(false)}>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Nombre del activo</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Logo Principal Blanco" />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Archivo (Imágenes, WebP, PDF)</label>
              <input type="file" className="form-input" onChange={e => setFile(e.target.files?.[0] || null)} required accept="image/*,.pdf" style={{ padding: '10px' }} />
            </div>
            <button type="submit" disabled={saving || !file} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              {saving ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader size={15} /> Subiendo…</span> : 'Subir Activo'}
            </button>
          </form>
        </DesignModal>
      )}
    </div>
  );
}

// ─── Brand Guidelines Tab ─────────────────────────────────────────────────────
function BrandGuidelinesTab() {
  const colors = [
    { name: 'Primary Blue', hex: '#2563eb', rgb: '37, 99, 235', usage: 'Botones principales, enlaces, logotipos' },
    { name: 'Midnight', hex: '#0f172a', rgb: '15, 23, 42', usage: 'Fondos de sidebar, textos principales' },
    { name: 'Surface', hex: '#ffffff', rgb: '255, 255, 255', usage: 'Tarjetas, fondos de módulos' },
    { name: 'Muted Gray', hex: '#64748b', rgb: '100, 116, 139', usage: 'Textos secundarios, bordes, íconos inactivos' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Paintbrush size={18} color="var(--primary-color)" /> Paleta de Colores
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          Estos son los colores oficiales de la marca FoundTeach. Asegúrate de utilizarlos con precisión para mantener la consistencia visual.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          {colors.map(c => (
            <div key={c.hex} style={{ borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <div style={{ height: 80, background: c.hex, borderBottom: '1px solid rgba(0,0,0,0.05)' }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{c.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  <span>HEX: <strong style={{ color: 'var(--text-main)' }}>{c.hex}</strong></span>
                  <span>RGB: <strong style={{ color: 'var(--text-main)' }}>{c.rgb}</strong></span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Uso: {c.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Type size={18} color="var(--primary-color)" /> Tipografía Corporativa
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          La familia tipográfica principal es <strong style={{ color: 'var(--text-main)' }}>'Inter'</strong> u <strong style={{ color: 'var(--text-main)' }}>'Outfit'</strong>. Se utiliza para transmitir claridad, modernidad y accesibilidad.
        </p>
        <div style={{ padding: 20, background: 'var(--background-color)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8, lineHeight: 1.2 }}>Aa Bb Cc Dd Ee</div>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: 24 }}>0123456789 !@#$%^&*()</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Light 300</span>
              <span style={{ fontWeight: 300, color: 'var(--text-main)' }}>El rápido zorro marrón salta sobre el perro perezoso.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Regular 400</span>
              <span style={{ fontWeight: 400, color: 'var(--text-main)' }}>El rápido zorro marrón salta sobre el perro perezoso.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>SemiBold 600</span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>El rápido zorro marrón salta sobre el perro perezoso.</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>ExtraBold 800</span>
              <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>El rápido zorro marrón salta sobre el perro perezoso.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview',   label: 'Resumen',         icon: BarChart2 },
  { id: 'assets',     label: 'Activos Visuales',icon: ImageIcon },
  { id: 'guidelines', label: 'Guía de Estilo',  icon: Palette },
];

export function DesignAreaPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [assets, setAssets]       = useState<DocumentItem[]>([]);
  const [loaded, setLoaded]       = useState(false);
  const [loading, setLoading]     = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${tok()}` };
      const rA = await fetch(`${API_URL}/api/documents?category=design`, { headers });
      if (rA.ok) setAssets(await rA.json());
    } catch { /* ignore */ }
    setLoading(false);
    setLoaded(true);
  };

  const renderTab = () => {
    if (!loaded) return (
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 48, textAlign: 'center' }}>
        <Palette size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.35, margin: '0 auto' }} />
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Área de Diseño</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px auto' }}>Gestiona los activos gráficos, mockups, logotipos y las guías de estilo de la marca.</p>
        <button onClick={loadData} disabled={loading} style={{ padding: '10px 28px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>
          {loading ? 'Cargando…' : 'Cargar Datos'}
        </button>
      </div>
    );
    switch (activeTab) {
      case 'overview':   return <OverviewTab assets={assets} />;
      case 'assets':     return <AssetsTab assets={assets} setAssets={setAssets} />;
      case 'guidelines': return <BrandGuidelinesTab />;
      default:           return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Palette size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área de Diseño</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestión de recursos visuales y manual de marca corporativa</p>
        </div>
        {loaded && (
          <button onClick={loadData} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-color)' }}>
            <RefreshCw size={13} /> Actualizar
          </button>
        )}
      </div>

      {loaded && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-color)', borderRadius: 12, padding: 5, border: '1px solid var(--border-color)', width: 'fit-content' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, fontSize: '0.855rem', fontWeight: 600, background: active ? 'white' : 'transparent', color: active ? 'var(--primary-color)' : 'var(--text-muted)', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', border: active ? '1px solid var(--border-color)' : '1px solid transparent', transition: 'all 0.15s' }}>
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>
      )}

      {renderTab()}
    </div>
  );
}
