import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const EMPLOYEE_TYPE_LABELS: Record<string, string> = {
  FOUNDER: 'Fundador',
  EMPLOYEE: 'Empleado',
  INSTRUCTOR: 'Instructor',
  FREELANCER: 'Freelancer',
  INTERN: 'Pasante',
};

const EMPLOYEE_TYPE_COLORS: Record<string, string> = {
  FOUNDER: '#7c3aed',
  EMPLOYEE: '#2563eb',
  INSTRUCTOR: '#0891b2',
  FREELANCER: '#d97706',
  INTERN: '#059669',
};

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
  employeeType: string;
  startDate: string;
  isActive: boolean;
  contracts?: any[];
}

const emptyForm = {
  firstName: '', lastName: '', email: '', phone: '',
  documentType: 'CC', documentNumber: '', position: '',
  department: '', employeeType: 'EMPLOYEE', startDate: '',
  city: 'Bogotá', notes: '',
};

export function HcmPage() {
  const [activeTab, setActiveTab] = useState<'employees' | 'contracts' | 'payroll'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({ totalEmployees: 0, activeEmployees: 0, totalContracts: 0, pendingPayrolls: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('admin_token');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [empRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/hcm/employees`, { headers }),
        fetch(`${API_URL}/api/hcm/stats`, { headers }),
      ]);
      if (!empRes.ok) throw new Error('Error cargando empleados');
      const [emps, st] = await Promise.all([empRes.json(), statsRes.json()]);
      setEmployees(emps);
      setStats(st);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = editId
        ? `${API_URL}/api/hcm/employees/${editId}`
        : `${API_URL}/api/hcm/employees`;
      const res = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error guardando');
      }
      await loadAll();
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setForm({
      firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
      phone: emp.phone || '', documentType: 'CC', documentNumber: '',
      position: emp.position, department: emp.department || '',
      employeeType: emp.employeeType, startDate: emp.startDate?.slice(0, 10),
      city: 'Bogotá', notes: '',
    });
    setEditId(emp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este empleado? Esta acción no se puede deshacer.')) return;
    await fetch(`${API_URL}/api/hcm/employees/${id}`, { method: 'DELETE', headers });
    await loadAll();
  };

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.position} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Colaboradores', value: stats.totalEmployees, color: '#2563eb' },
          { label: 'Activos', value: stats.activeEmployees, color: '#059669' },
          { label: 'Contratos Vigentes', value: stats.totalContracts, color: '#7c3aed' },
          { label: 'Nóminas Pendientes', value: stats.pendingPayrolls, color: '#d97706' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '20px 24px', borderLeft: `4px solid ${s.color}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {([['employees', '👥 Directorio'], ['contracts', '📄 Contratos'], ['payroll', '💰 Nómina']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', border: '1px solid var(--border-color)', transition: 'all 0.2s',
              background: activeTab === key ? 'var(--primary-color)' : 'var(--surface-color)',
              color: activeTab === key ? 'white' : 'var(--text-muted)',
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Employees Tab */}
      {activeTab === 'employees' && (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {/* Toolbar */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              placeholder="🔍 Buscar colaborador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 16px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.9rem', flex: 1, minWidth: 200, background: 'var(--background-color)', color: 'var(--text-main)' }}
            />
            <button onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); setError(''); }}
              style={{ padding: '8px 20px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              + Nuevo Colaborador
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando colaboradores...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>👥</div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>No hay colaboradores registrados</p>
              <p style={{ fontSize: '0.875rem' }}>Agrega el primer miembro del equipo.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--background-color)' }}>
                    {['Nombre', 'Cargo', 'Área', 'Tipo', 'Vinculación', 'Estado', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(emp => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: EMPLOYEE_TYPE_COLORS[emp.employeeType] || '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                            {emp.firstName[0]}{emp.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{emp.firstName} {emp.lastName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.9rem' }}>{emp.position}</td>
                      <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{emp.department || '—'}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, background: `${EMPLOYEE_TYPE_COLORS[emp.employeeType]}15`, color: EMPLOYEE_TYPE_COLORS[emp.employeeType], fontSize: '0.8rem', fontWeight: 700 }}>
                          {EMPLOYEE_TYPE_LABELS[emp.employeeType] || emp.employeeType}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(emp.startDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: 20, background: emp.isActive ? 'rgba(5,150,105,0.1)' : 'rgba(239,68,68,0.1)', color: emp.isActive ? '#059669' : '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                          {emp.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => handleEdit(emp)} style={{ padding: '5px 12px', border: '1px solid var(--border-color)', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', background: 'var(--surface-hover)', color: 'var(--text-main)' }}>Editar</button>
                          <button onClick={() => handleDelete(emp.id)} style={{ padding: '5px 12px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', background: 'rgba(239,68,68,0.05)', color: '#ef4444' }}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contracts / Payroll placeholder tabs */}
      {activeTab === 'contracts' && (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📄</div>
          <h3 style={{ marginBottom: 8 }}>Módulo de Contratos</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>Los contratos de los colaboradores se crean al seleccionar un empleado del directorio. Selecciona un colaborador y verás sus contratos activos.</p>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>💰</div>
          <h3 style={{ marginBottom: 8 }}>Módulo de Nómina</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto' }}>Gestión de pagos por períodos mensuales. Disponible una vez que se asignen contratos a los colaboradores.</p>
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 36, width: '100%', maxWidth: 640, border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{editId ? 'Editar' : 'Nuevo'} Colaborador</h2>
              <button onClick={() => setShowForm(false)} style={{ cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.875rem' }}>{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { label: 'Nombres *', key: 'firstName', type: 'text' },
                { label: 'Apellidos *', key: 'lastName', type: 'text' },
                { label: 'Correo Electrónico *', key: 'email', type: 'email' },
                { label: 'Teléfono / WhatsApp', key: 'phone', type: 'tel' },
                { label: 'Tipo de Documento', key: 'documentType', type: 'text', placeholder: 'CC, TI, NIT...' },
                { label: 'Número de Documento *', key: 'documentNumber', type: 'text' },
                { label: 'Cargo / Puesto *', key: 'position', type: 'text', placeholder: 'Ej: CTO, Instructor de Matemáticas' },
                { label: 'Área / Departamento', key: 'department', type: 'text', placeholder: 'Tecnología, Educación, Admin...' },
                { label: 'Ciudad', key: 'city', type: 'text' },
                { label: 'Fecha de Ingreso *', key: 'startDate', type: 'date' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">{f.label}</label>
                  <input
                    type={f.type} className="form-input" placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                </div>
              ))}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tipo de Colaborador</label>
                <select className="form-input" value={form.employeeType}
                  onChange={e => setForm(prev => ({ ...prev, employeeType: e.target.value }))}
                  style={{ background: 'var(--surface-color)', color: 'var(--text-main)' }}>
                  {Object.entries(EMPLOYEE_TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label">Notas adicionales</label>
                <textarea className="form-input" rows={3} value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Crear Colaborador'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', fontWeight: 600, background: 'transparent', color: 'var(--text-main)' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
