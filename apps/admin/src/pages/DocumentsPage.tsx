import { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Image, File, Trash2, Download, Upload, Filter } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const CATEGORIES = ['Contrato', 'Propuesta', 'Factura', 'Cotización', 'Informe', 'Otro'];

const MIME_ICONS: Record<string, React.ReactNode> = {
  'application/pdf': <FileText size={20} color="#ef4444" />,
  'image/jpeg': <Image size={20} color="#2563eb" />,
  'image/png': <Image size={20} color="#2563eb" />,
  'image/webp': <Image size={20} color="#2563eb" />,
  'application/msword': <FileText size={20} color="#1d4ed8" />,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': <FileText size={20} color="#1d4ed8" />,
  'application/vnd.ms-excel': <FileText size={20} color="#059669" />,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': <FileText size={20} color="#059669" />,
};

const MIME_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'Imagen JPG',
  'image/png': 'Imagen PNG',
  'image/webp': 'Imagen WebP',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-excel': 'Excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
};

interface Doc {
  id: string;
  name: string;
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  category: string | null;
  uploadedAt: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function authHeader() {
  const token = localStorage.getItem('admin_token');
  return { Authorization: `Bearer ${token}` };
}

export function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Upload form state
  const [uploadName, setUploadName] = useState('');
  const [uploadCat, setUploadCat] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3500); };

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterCat
        ? `${API_URL}/api/documents?category=${encodeURIComponent(filterCat)}`
        : `${API_URL}/api/documents`;
      const res = await fetch(url, { headers: authHeader() });
      if (res.ok) setDocs(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [filterCat]);

  useEffect(() => { void fetchDocs(); }, [fetchDocs]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadName) setUploadName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadName) setUploadName(file.name.replace(/\.[^.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { setError('Selecciona un archivo primero.'); return; }
    if (!uploadName.trim()) { setError('El nombre del documento es obligatorio.'); return; }
    setUploading(true); setError('');
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      form.append('name', uploadName);
      if (uploadCat) form.append('category', uploadCat);

      const res = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: authHeader(),
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al subir');
      setSelectedFile(null);
      setUploadName(''); setUploadCat('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchDocs();
      showSuccess(`"${uploadName}" subido correctamente.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido');
    } finally { setUploading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const doc = docs.find(d => d.id === deleteId);
    await fetch(`${API_URL}/api/documents/${deleteId}`, {
      method: 'DELETE', headers: authHeader(),
    });
    setDeleteId(null);
    await fetchDocs();
    showSuccess(`"${doc?.name}" eliminado.`);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Gestión Documental</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Repositorio de documentos de <strong>FoundTeach</strong> — contratos, propuestas, informes y más.
        </p>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ── Lista de documentos ── */}
        <div>
          {/* Filtro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.875rem', background: 'var(--surface-color)', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <option value="">Todas las categorías</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              {loading ? '...' : `${docs.length} documento${docs.length !== 1 ? 's' : ''}`}
            </span>
          </div>

          <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando documentos...</div>
            ) : docs.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📁</div>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>No hay documentos</p>
                <p style={{ fontSize: '0.875rem' }}>{filterCat ? 'Prueba con otra categoría.' : 'Sube el primer documento usando el panel de la derecha.'}</p>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 90px 90px 90px 80px', gap: 12, padding: '10px 20px', background: 'var(--background-color)', borderBottom: '1px solid var(--border-color)', alignItems: 'center' }}>
                  {['', 'Documento', 'Tipo', 'Tamaño', 'Categoría', 'Acciones'].map(h => (
                    <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
                  ))}
                </div>
                {docs.map((doc, i) => (
                  <div
                    key={doc.id}
                    style={{ display: 'grid', gridTemplateColumns: '32px 1fr 90px 90px 90px 80px', gap: 12, padding: '14px 20px', borderBottom: i < docs.length - 1 ? '1px solid var(--border-color)' : 'none', alignItems: 'center', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <div>{MIME_ICONS[doc.mimetype] ?? <File size={20} color="var(--text-muted)" />}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(doc.uploadedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {MIME_LABELS[doc.mimetype] ?? doc.mimetype.split('/')[1].toUpperCase()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatBytes(doc.size)}</div>
                    <div>
                      {doc.category && (
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, background: 'rgba(37,99,235,0.08)', color: 'var(--primary-color)' }}>
                          {doc.category}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Descargar / Ver"
                        style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)', background: 'var(--surface-hover)', color: 'var(--primary-color)' }}
                      >
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => setDeleteId(doc.id)}
                        title="Eliminar"
                        style={{ width: 30, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.05)', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── Panel de subida ── */}
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24, position: 'sticky', top: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={16} color="var(--primary-color)" />
            Subir Documento
          </h3>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? 'var(--primary-color)' : 'var(--border-color)'}`,
              background: isDragging ? 'rgba(37,99,235,0.04)' : 'var(--background-color)',
              borderRadius: 12,
              padding: '28px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: 16,
            }}
          >
            {selectedFile ? (
              <>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>
                  {MIME_ICONS[selectedFile.type] ?? <File size={28} />}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: 4 }}>
                  {selectedFile.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatBytes(selectedFile.size)}</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📂</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                  Arrastra un archivo aquí o <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>haz clic</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                  PDF, Word, Excel, Imágenes · Máx. 10 MB
                </p>
              </>
            )}
            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" />
          </div>

          <div className="form-group">
            <label className="form-label">Nombre del documento *</label>
            <input type="text" className="form-input" placeholder="Ej: Contrato Cliente ABC" value={uploadName} onChange={e => setUploadName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-input" value={uploadCat} onChange={e => setUploadCat(e.target.value)} style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
              <option value="">Sin categoría</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            style={{ marginTop: 8, opacity: (!selectedFile || uploading) ? 0.6 : 1 }}
          >
            {uploading ? 'Subiendo...' : '⬆️ Subir Documento'}
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: 32, width: '100%', maxWidth: 360, border: '1px solid rgba(239,68,68,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
            <h2 style={{ marginBottom: 8 }}>¿Eliminar documento?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>El archivo se eliminará permanentemente del servidor.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: 8, background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                Sí, eliminar
              </button>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
