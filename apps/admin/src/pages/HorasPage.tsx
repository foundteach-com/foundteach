import { useState, useEffect, useCallback } from 'react';
import { X, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/api/hcm`;

interface Employee { id: string; firstName: string; lastName: string; }
interface Project { id: string; title: string; }
interface TimeEntry {
  id: string; employeeId: string; date: string; hours: number; description?: string; projectId?: string;
  employee?: { id: string; firstName: string; lastName: string };
  project?: { id: string; title: string };
}

const token = () => localStorage.getItem('foundteach_token') ?? '';

export function HorasPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterEmp, setFilterEmp] = useState('');
  const [form, setForm] = useState({ employeeId: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', projectId: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterEmp ? `${BASE}/time-entries?employeeId=${filterEmp}` : `${BASE}/time-entries`;
      const [tRes, eRes, pRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/employees?onlyActive=true`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${API_URL}/api/ops/projects`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (tRes.ok) setEntries(await tRes.json());
      if (eRes.ok) setEmployees(await eRes.json());
      if (pRes.ok) setProjects(await pRes.json());
    } finally { setLoading(false); }
  }, [filterEmp]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    await fetch(`${BASE}/time-entries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...form, hours: Number(form.hours), projectId: form.projectId || undefined }),
    });
    setShowModal(false);
    void load();
  };

  const deleteEntry = async (id: string) => {
    await fetch(`${BASE}/time-entries/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    void load();
  };

  // Summary by employee
  const summary: Record<string, { name: string; total: number }> = {};
  entries.forEach(e => {
    const key = e.employeeId;
    if (!summary[key]) summary[key] = { name: e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : key, total: 0 };
    summary[key].total += e.hours;
  });

  const totalHours = entries.reduce((s, e) => s + e.hours, 0);

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Horas Trabajadas</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Registro de tiempo por colaborador</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
          + Registrar Horas
        </button>
      </div>

      {/* Resumen por colaborador */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#818cf8' }}>{totalHours.toFixed(1)}</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total horas registradas</div>
        </div>
        {Object.values(summary).slice(0, 4).map(s => (
          <div key={s.name} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#34d399' }}>{s.total.toFixed(1)}h</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
          </div>
        ))}
      </div>

      {/* Filtro */}
      <div style={{ marginBottom: '14px' }}>
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los colaboradores</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando registros...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
            <Clock size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No hay registros de horas.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#0f172a', color: '#64748b' }}>
                {['Colaborador', 'Fecha', 'Horas', 'Descripción', 'Proyecto', ''].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                    {e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : e.employeeId}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{new Date(e.date).toLocaleDateString('es-CO')}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#6366f122', color: '#818cf8', padding: '2px 10px', borderRadius: '999px', fontWeight: 700 }}>{e.hours}h</span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description ?? '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.8rem' }}>{e.project?.title ?? '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => void deleteEntry(e.id)} style={{ background: '#ef444422', border: 'none', color: '#ef4444', cursor: 'pointer', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem' }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Registrar Horas</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Colaborador *</span>
                <select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Seleccionar</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </label>
              {[
                { label: 'Fecha *', key: 'date', type: 'date' },
                { label: 'Horas *', key: 'hours', type: 'number' },
                { label: 'Descripción', key: 'description', type: 'text' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input type={f.type} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Proyecto (opcional)</span>
                <select value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId: e.target.value }))}
                  style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Sin proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
