import { useState, useEffect, useCallback } from 'react';
import { X, Users } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/api/hcm`;

interface Skill { id: string; name: string; level: string; category?: string; }
interface Employee {
  id: string; firstName: string; lastName: string; email: string; phone?: string;
  position: string; department?: string; employeeType: string; startDate: string;
  isActive: boolean; avatarUrl?: string; notes?: string; documentNumber: string;
  _count?: { payrolls: number; timeEntries: number; skills: number };
  skills?: Skill[];
}

const TYPE_LABELS: Record<string, string> = {
  FOUNDER: 'Fundador', EMPLOYEE: 'Empleado', INSTRUCTOR: 'Instructor', FREELANCER: 'Freelancer', INTERN: 'Pasante',
};
const TYPE_COLORS: Record<string, string> = {
  FOUNDER: '#f59e0b', EMPLOYEE: '#10b981', INSTRUCTOR: '#818cf8', FREELANCER: '#60a5fa', INTERN: '#f472b6',
};
const LEVEL_LABELS: Record<string, string> = {
  BASIC: 'Básico', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado', EXPERT: 'Experto',
};
const LEVEL_COLORS: Record<string, string> = {
  BASIC: '#64748b', INTERMEDIATE: '#60a5fa', ADVANCED: '#10b981', EXPERT: '#f59e0b',
};

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function ColaboradoresPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [filterDept, setFilterDept] = useState('');
  const [filterActive, setFilterActive] = useState('true');
  const [tab, setTab] = useState<'info' | 'skills'>('info');
  const [skillForm, setSkillForm] = useState({ name: '', level: 'INTERMEDIATE', category: '' });
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', position: '',
    department: '', employeeType: 'EMPLOYEE', documentNumber: '',
    startDate: '', notes: '', city: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterActive ? `${BASE}/employees?onlyActive=${filterActive}` : `${BASE}/employees`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setEmployees(await res.json());
    } finally { setLoading(false); }
  }, [filterActive]);

  useEffect(() => { void load(); }, [load]);

  const loadOne = async (id: string) => {
    const res = await fetch(`${BASE}/employees/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) setSelectedEmp(await res.json());
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ firstName: '', lastName: '', email: '', phone: '', position: '', department: '', employeeType: 'EMPLOYEE', documentNumber: '', startDate: '', notes: '', city: '' });
    setTab('info');
    setShowModal(true);
  };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({ firstName: e.firstName, lastName: e.lastName, email: e.email, phone: e.phone ?? '', position: e.position, department: e.department ?? '', employeeType: e.employeeType, documentNumber: e.documentNumber, startDate: e.startDate.split('T')[0], notes: e.notes ?? '', city: '' });
    setTab('info');
    setShowModal(true);
    void loadOne(e.id);
  };

  const save = async () => {
    const url = editing ? `${BASE}/employees/${editing.id}` : `${BASE}/employees`;
    const method = editing ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); void load(); }
  };

  const addSkill = async () => {
    if (!editing && !selectedEmp) return;
    const empId = editing?.id ?? selectedEmp?.id;
    await fetch(`${BASE}/skills`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ ...skillForm, employeeId: empId }) });
    setSkillForm({ name: '', level: 'INTERMEDIATE', category: '' });
    if (empId) void loadOne(empId);
  };

  const deleteSkill = async (skillId: string, empId: string) => {
    await fetch(`${BASE}/skills/${skillId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    void loadOne(empId);
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
  const filtered = filterDept ? employees.filter(e => e.department === filterDept) : employees;

  const initials = (e: Employee) => `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Colaboradores</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Directorio del equipo de FoundTeach</p>
        </div>
        <button onClick={openCreate} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
          + Nuevo Colaborador
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: employees.length, color: '#818cf8' },
          { label: 'Activos', value: employees.filter(e => e.isActive).length, color: '#10b981' },
          { label: 'Instructores', value: employees.filter(e => e.employeeType === 'INSTRUCTOR').length, color: '#818cf8' },
          { label: 'Freelancers', value: employees.filter(e => e.employeeType === 'FREELANCER').length, color: '#60a5fa' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value='true'>Solo activos</option>
          <option value=''>Todos</option>
        </select>
        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los departamentos</option>
          {departments.map(d => <option key={d!} value={d!}>{d}</option>)}
        </select>
      </div>

      {/* Grid cards */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando colaboradores...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>
          <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No hay colaboradores.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '14px' }}>
          {filtered.map(emp => (
            <div key={emp.id} style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '18px', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => openEdit(emp)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                {emp.avatarUrl ? (
                  <img src={emp.avatarUrl} alt={emp.firstName} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: '#fff', flexShrink: 0 }}>
                    {initials(emp)}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.position}</div>
                </div>
                {!emp.isActive && <span style={{ fontSize: '0.65rem', background: '#ef444422', color: '#ef4444', borderRadius: '999px', padding: '2px 7px', flexShrink: 0 }}>Inactivo</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: TYPE_COLORS[emp.employeeType] + '22', color: TYPE_COLORS[emp.employeeType] }}>
                  {TYPE_LABELS[emp.employeeType]}
                </span>
                {emp.department && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.department}</span>}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>📋 {emp._count?.payrolls ?? 0} nóminas</span>
                <span>⏱ {emp._count?.timeEntries ?? 0} registros</span>
                <span>🎯 {emp._count?.skills ?? 0} skills</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>{editing ? `${editing.firstName} ${editing.lastName}` : 'Nuevo Colaborador'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Tabs */}
            {editing && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#0f172a', borderRadius: '8px', padding: '4px' }}>
                {(['info', 'skills'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', background: tab === t ? '#334155' : 'transparent', color: tab === t ? '#e2e8f0' : '#64748b' }}>
                    {t === 'info' ? '👤 Información' : '🎯 Habilidades'}
                  </button>
                ))}
              </div>
            )}

            {tab === 'info' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Nombre *', key: 'firstName', col: 1 },
                  { label: 'Apellido *', key: 'lastName', col: 1 },
                  { label: 'Email *', key: 'email', col: 2 },
                  { label: 'Teléfono', key: 'phone', col: 1 },
                  { label: 'Documento', key: 'documentNumber', col: 1 },
                  { label: 'Cargo *', key: 'position', col: 1 },
                  { label: 'Departamento', key: 'department', col: 1 },
                  { label: 'Ciudad', key: 'city', col: 1 },
                  { label: 'Fecha inicio', key: 'startDate', col: 1, type: 'date' },
                ].map(f => (
                  <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', gridColumn: f.col === 2 ? '1 / -1' : undefined }}>
                    <span style={{ color: '#94a3b8' }}>{f.label}</span>
                    <input type={f.type ?? 'text'} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                  </label>
                ))}
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Tipo</span>
                  <select value={form.employeeType} onChange={e => setForm(prev => ({ ...prev, employeeType: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', gridColumn: '1 / -1' }}>
                  <span style={{ color: '#94a3b8' }}>Notas</span>
                  <textarea value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} rows={2}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
                </label>
              </div>
            )}

            {tab === 'skills' && selectedEmp && (
              <div>
                <div style={{ marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', alignItems: 'end' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Habilidad</span>
                    <input value={skillForm.name} onChange={e => setSkillForm(p => ({ ...p, name: e.target.value }))} placeholder='ej: React, Liderazgo'
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#e2e8f0', fontSize: '0.85rem' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#94a3b8' }}>Nivel</span>
                    <select value={skillForm.level} onChange={e => setSkillForm(p => ({ ...p, level: e.target.value }))}
                      style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#e2e8f0', fontSize: '0.85rem' }}>
                      {Object.entries(LEVEL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </label>
                  <button onClick={() => void addSkill()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '9px 14px', cursor: 'pointer', fontWeight: 600 }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {(selectedEmp.skills ?? []).map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0f172a', border: `1px solid ${LEVEL_COLORS[s.level]}44`, borderRadius: '999px', padding: '4px 10px 4px 12px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{s.name}</span>
                      <span style={{ padding: '1px 7px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, background: LEVEL_COLORS[s.level] + '22', color: LEVEL_COLORS[s.level] }}>{LEVEL_LABELS[s.level]}</span>
                      <button onClick={() => void deleteSkill(s.id, selectedEmp.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0' }}><X size={12} /></button>
                    </div>
                  ))}
                  {!(selectedEmp.skills?.length) && <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sin habilidades registradas.</p>}
                </div>
              </div>
            )}

            {tab === 'info' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
