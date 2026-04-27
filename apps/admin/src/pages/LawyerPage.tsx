import { useState } from 'react';
import {
  Scale, FileText, Upload, Trash2, X, Clock, Loader, Download, Eye, FileSignature, RefreshCw, BarChart2, Plus, Search
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

interface ContractItem {
  id: string;
  employeeId: string;
  contractType: string;
  status: string;
  startDate: string;
  endDate?: string;
  salary: number;
  currency: string;
  createdAt: string;
  employee?: { firstName: string; lastName: string; documentNumber: string };
}

interface EmployeeItem {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  position: string;
}

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const CONTRACT_STATUS = {
  ACTIVE: { label: 'Activo', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
  INACTIVE: { label: 'Inactivo', color: '#64748b', bg: 'rgba(100,116,139,0.1)' },
  SUSPENDED: { label: 'Suspendido', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  TERMINATED: { label: 'Terminado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
} as const;

const CONTRACT_TYPES = {
  FIXED_TERM: 'Término Fijo',
  INDEFINITE: 'Término Indefinido',
  SERVICE_CONTRACT: 'Prestación de Servicios',
  INTERNSHIP: 'Práctica / Pasantía'
};

type StatusMap = Record<string, { label: string; color: string; bg: string }>;

// ─── Shared UI ────────────────────────────────────────────────────────────────
function Badge({ value, map }: { value: string; map: StatusMap }) {
  const s = map[value] ?? { label: value, color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
  return <span style={{ fontSize: '0.71rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, color: s.color, background: s.bg }}>{s.label}</span>;
}

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

function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number }>; text: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
      <Icon size={32} /><p style={{ marginTop: 12, fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

function LegalModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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
function OverviewTab({ documents, contracts }: { documents: DocumentItem[]; contracts: ContractItem[] }) {
  const activeContracts = contracts.filter(c => c.status === 'ACTIVE').length;
  const recentDocs = documents.slice(0, 5);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Documentos Legales" value={documents.length}    sub="archivos guardados"       icon={FileText} color="#2563eb" />
        <KpiCard label="Contratos Activos"  value={activeContracts}     sub="en curso"                 icon={FileSignature} color="#059669" />
        <KpiCard label="Casos Abiertos"     value={0}                   sub="Módulo próximo"           icon={Scale}       color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Documentos Recientes</h3>
          {recentDocs.length === 0
            ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay documentos recientes.</p>
            : recentDocs.map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 600 }}>{d.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                      <span>{fmtSize(d.size)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Clock size={10} />{fmtDate(d.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
                <a href={d.url} target="_blank" rel="noreferrer" style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--background-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                  <Eye size={14} />
                </a>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab({ documents, setDocuments }: { documents: DocumentItem[]; setDocuments: React.Dispatch<React.SetStateAction<DocumentItem[]>> }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [search, setSearch] = useState('');

  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setSaving(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name || file.name);
    formData.append('category', 'legal');

    try {
      const res = await fetch(`${API_URL}/api/documents/upload`, { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${tok()}` }, 
        body: formData 
      });
      if (res.ok) { 
        const data = await res.json(); 
        setDocuments(p => [data, ...p]); 
        setModal(false); 
        setFile(null); 
        setName(''); 
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar documento legal de forma permanente?')) return;
    await fetch(`${API_URL}/api/documents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` } });
    setDocuments(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-color)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar documento..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Upload size={14} /> Subir Documento
        </button>
      </div>

      {filteredDocs.length === 0 ? <EmptyState icon={FileText} text={documents.length === 0 ? "No hay documentos legales." : "No hay resultados para la búsqueda."} /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {filteredDocs.map(d => (
            <div key={d.id} style={{ background: 'var(--surface-color)', borderRadius: 14, border: '1px solid var(--border-color)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{fmtSize(d.size)} • {fmtDate(d.uploadedAt)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                <a href={d.url} target="_blank" rel="noreferrer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8, background: 'var(--background-color)', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  <Download size={14} /> Descargar
                </a>
                <button onClick={() => handleDelete(d.id)} style={{ width: 36, borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <LegalModal title="Subir Documento Legal" onClose={() => setModal(false)}>
          <form onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Nombre del documento</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Contrato de confidencialidad" />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Archivo</label>
              <input type="file" className="form-input" onChange={e => setFile(e.target.files?.[0] || null)} required accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" style={{ padding: '10px' }} />
            </div>
            <button type="submit" disabled={saving || !file} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              {saving ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader size={15} /> Subiendo…</span> : 'Subir Documento'}
            </button>
          </form>
        </LegalModal>
      )}
    </div>
  );
}

// ─── Contracts Tab ────────────────────────────────────────────────────────────
function ContractsTab({ contracts, setContracts, employees }: { contracts: ContractItem[]; setContracts: React.Dispatch<React.SetStateAction<ContractItem[]>>; employees: EmployeeItem[] }) {
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({
    employeeId: '',
    contractType: 'FIXED_TERM',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    salary: 0,
    currency: 'COP',
    description: ''
  });

  const filteredContracts = contracts.filter(c => {
    const term = search.toLowerCase();
    const empName = c.employee ? `${c.employee.firstName} ${c.employee.lastName}`.toLowerCase() : '';
    return empName.includes(term) || c.employee?.documentNumber.includes(term) || c.contractType.toLowerCase().includes(term);
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/hcm/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` },
        body: JSON.stringify({
          ...form,
          salary: Number(form.salary),
          endDate: form.endDate ? form.endDate : undefined
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Buscar el empleado para agregarlo visualmente al nuevo contrato
        const emp = employees.find(x => x.id === data.employeeId);
        setContracts(p => [{ ...data, employee: emp }, ...p]);
        setModal(false);
        setForm({ employeeId: '', contractType: 'FIXED_TERM', startDate: new Date().toISOString().split('T')[0], endDate: '', salary: 0, currency: 'COP', description: '' });
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar contrato? Esta acción no se puede deshacer.')) return;
    await fetch(`${API_URL}/api/hcm/contracts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok()}` } });
    setContracts(p => p.filter(x => x.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-color)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', flex: 1, maxWidth: 300 }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Buscar por nombre o documento..." value={search} onChange={e => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }} />
        </div>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem' }}>
          <Plus size={14} /> Nuevo Contrato
        </button>
      </div>

      {filteredContracts.length === 0 ? <EmptyState icon={FileSignature} text={contracts.length === 0 ? "No hay contratos registrados en el sistema." : "No hay resultados."} /> : (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--background-color)' }}>
                {['Empleado', 'Tipo', 'Inicio', 'Fin', 'Salario', 'Estado', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((c, i) => (
                <tr key={c.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-color)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'var(--background-color)'}
                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : c.employeeId.substring(0,8)}</div>
                    {c.employee && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.employee.documentNumber}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>{(CONTRACT_TYPES as any)[c.contractType] || c.contractType}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fmtDate(c.startDate)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{fmtDate(c.endDate)}</td>
                  <td style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
                    {new Intl.NumberFormat('es-CO', { style: 'currency', currency: c.currency, maximumFractionDigits: 0 }).format(c.salary)}
                  </td>
                  <td style={{ padding: '12px 16px' }}><Badge value={c.status} map={CONTRACT_STATUS as unknown as StatusMap} /></td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => handleDelete(c.id)} style={{ color: '#ef4444', padding: 5, borderRadius: 6, background: 'rgba(239,68,68,0.08)' }}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <LegalModal title="Nuevo Contrato" onClose={() => setModal(false)}>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Empleado</label>
              <select className="form-input" value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} required>
                <option value="">Selecciona un empleado...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.documentNumber})</option>
                ))}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Tipo de Contrato</label>
                <select className="form-input" value={form.contractType} onChange={e => setForm(p => ({ ...p, contractType: e.target.value }))} required>
                  {Object.entries(CONTRACT_TYPES).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Salario Bruto</label>
                <input type="number" className="form-input" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: Number(e.target.value) }))} required min={0} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div className="form-group">
                <label className="form-label">Fecha de Inicio</label>
                <input type="date" className="form-input" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Fin (Opcional)</label>
                <input type="date" className="form-input" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>

            <button type="submit" disabled={saving || !form.employeeId} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              {saving ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Loader size={15} /> Creando…</span> : 'Registrar Contrato'}
            </button>
          </form>
        </LegalModal>
      )}
    </div>
  );
}

const TABS = [
  { id: 'overview',  label: 'Resumen',        icon: BarChart2 },
  { id: 'documents', label: 'Documentos',     icon: FileText },
  { id: 'contracts', label: 'Contratos',      icon: FileSignature },
];

export function LawyerPage() {
  const [activeTab, setActiveTab]   = useState('overview');
  const [documents,   setDocuments] = useState<DocumentItem[]>([]);
  const [contracts,   setContracts] = useState<ContractItem[]>([]);
  const [employees,   setEmployees] = useState<EmployeeItem[]>([]);
  const [loaded,      setLoaded]    = useState(false);
  const [loading,     setLoading]   = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${tok()}` };
      const [rD, rC, rE] = await Promise.all([
        fetch(`${API_URL}/api/documents?category=legal`, { headers }),
        fetch(`${API_URL}/api/hcm/contracts`,            { headers }),
        fetch(`${API_URL}/api/hcm/employees`,            { headers }),
      ]);
      if (rD.ok) setDocuments(await rD.json());
      if (rC.ok) setContracts(await rC.json());
      if (rE.ok) setEmployees(await rE.json());
    } catch { /* ignore */ }
    setLoading(false);
    setLoaded(true);
  };

  const renderTab = () => {
    if (!loaded) return (
      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 48, textAlign: 'center' }}>
        <Scale size={40} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.35 }} />
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Área Legal</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>Gestiona documentos legales, contratos y casos de la empresa.</p>
        <button onClick={loadData} disabled={loading} style={{ padding: '10px 28px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.9rem' }}>
          {loading ? 'Cargando…' : 'Cargar Datos'}
        </button>
      </div>
    );
    switch (activeTab) {
      case 'overview':  return <OverviewTab documents={documents} contracts={contracts} />;
      case 'documents': return <DocumentsTab documents={documents} setDocuments={setDocuments} />;
      case 'contracts': return <ContractsTab contracts={contracts} setContracts={setContracts} employees={employees} />;
      default:          return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Scale size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área Legal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Documentos legales, contratos corporativos y normativas</p>
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
