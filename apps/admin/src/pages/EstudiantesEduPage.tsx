import { useState, useEffect, useCallback } from 'react';
import { X, GraduationCap } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/edu`;
const token = () => localStorage.getItem('foundteach_token') ?? '';
interface Course { id: string; title: string; }
interface Enrollment { id: string; courseId: string; studentName: string; studentEmail?: string; progress: number; status: string; startedAt: string; completedAt?: string; course?: { id: string; title: string; level: string }; }

const SC: Record<string, string> = { ACTIVE: '#60a5fa', COMPLETED: '#10b981', DROPPED: '#ef4444' };
const SL: Record<string, string> = { ACTIVE: 'Activo', COMPLETED: 'Completado', DROPPED: 'Abandonado' };

export function EstudiantesEduPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ courseId: '', studentName: '', studentEmail: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCourse) params.set('courseId', filterCourse);
      if (filterStatus) params.set('status', filterStatus);
      const [eRes, cRes] = await Promise.all([
        fetch(`${BASE}/enrollments?${params}`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/courses`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (eRes.ok) setEnrollments(await eRes.json());
      if (cRes.ok) setCourses(await cRes.json());
    } finally { setLoading(false); }
  }, [filterCourse, filterStatus]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    await fetch(`${BASE}/enrollments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(form) });
    setShowModal(false); void load();
  };

  const updateProgress = async (id: string, progress: number) => {
    await fetch(`${BASE}/enrollments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ progress }) });
    void load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${BASE}/enrollments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ status }) });
    void load();
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Estudiantes</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Matrículas y seguimiento de progreso</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>+ Matricular</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total matrículas', value: enrollments.length, color: '#818cf8' },
          { label: 'Activos', value: enrollments.filter(e => e.status === 'ACTIVE').length, color: '#60a5fa' },
          { label: 'Completados', value: enrollments.filter(e => e.status === 'COMPLETED').length, color: '#10b981' },
          { label: 'Progreso prom.', value: enrollments.length ? `${Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)}%` : '—', color: '#f59e0b' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los cursos</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los estados</option>
          {Object.entries(SL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando...</div>
          : enrollments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
              <GraduationCap size={48} style={{ opacity: 0.3, marginBottom: '12px' }} /><p>No hay matrículas.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ background: '#0f172a', color: '#64748b' }}>
                {['Estudiante', 'Curso', 'Progreso', 'Estado', 'Inicio'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600 }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {enrollments.map((e, i) => (
                  <tr key={e.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 500 }}>{e.studentName}</div>
                      {e.studentEmail && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{e.studentEmail}</div>}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{e.course?.title ?? e.courseId}</td>
                    <td style={{ padding: '10px 14px', minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type='range' min={0} max={100} value={e.progress} onMouseUp={ev => void updateProgress(e.id, Number((ev.target as HTMLInputElement).value))}
                          onChange={() => {}} style={{ flex: 1, accentColor: '#6366f1' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8', minWidth: '32px' }}>{e.progress}%</span>
                      </div>
                      <div style={{ height: '4px', background: '#334155', borderRadius: '999px', marginTop: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${e.progress}%`, background: e.progress === 100 ? '#10b981' : 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '999px', transition: 'width 0.3s' }} />
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <select value={e.status} onChange={ev => void updateStatus(e.id, ev.target.value)}
                        style={{ background: SC[e.status] + '22', border: `1px solid ${SC[e.status]}44`, borderRadius: '6px', padding: '3px 8px', color: SC[e.status], fontSize: '0.75rem', fontWeight: 600 }}>
                        {Object.entries(SL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(e.startedAt).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Matricular Estudiante</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Curso *</span>
                <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Seleccionar</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </label>
              {[{ label: 'Nombre *', key: 'studentName' }, { label: 'Email', key: 'studentEmail' }].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Matricular</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
