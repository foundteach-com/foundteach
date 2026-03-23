import { useState, useEffect, useCallback } from 'react';
import { X, ClipboardCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/edu`;
const token = () => localStorage.getItem('foundteach_token') ?? '';
interface Course { id: string; title: string; }
interface Enrollment { id: string; studentName: string; }
interface Assessment { id: string; courseId: string; enrollmentId?: string; title: string; type: string; maxScore: number; score?: number; description?: string; createdAt: string; course?: { id: string; title: string }; enrollment?: { id: string; studentName: string }; }
const TYPE_C: Record<string, string> = { QUIZ: '#818cf8', PROJECT: '#f59e0b', EXAM: '#ef4444' };

export function EvaluacionesEduPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [form, setForm] = useState({ courseId: '', enrollmentId: '', title: '', type: 'QUIZ', maxScore: '100', score: '', description: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterCourse ? `${BASE}/assessments?courseId=${filterCourse}` : `${BASE}/assessments`;
      const [aRes, cRes, eRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/courses`, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/enrollments`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (aRes.ok) setAssessments(await aRes.json());
      if (cRes.ok) setCourses(await cRes.json());
      if (eRes.ok) setEnrollments(await eRes.json());
    } finally { setLoading(false); }
  }, [filterCourse]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    await fetch(`${BASE}/assessments`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ ...form, maxScore: Number(form.maxScore), score: form.score !== '' ? Number(form.score) : undefined, enrollmentId: form.enrollmentId || undefined }) });
    setShowModal(false); void load();
  };

  const avgPct = assessments.filter(a => a.score != null).map(a => Math.round((a.score! / a.maxScore) * 100));
  const avgScore = avgPct.length ? Math.round(avgPct.reduce((s, n) => s + n, 0) / avgPct.length) : null;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Evaluaciones</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Puntajes y registros de evaluación</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>+ Nueva Evaluación</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: assessments.length, color: '#818cf8' },
          { label: 'Calificadas', value: assessments.filter(a => a.score != null).length, color: '#10b981' },
          { label: 'Pendientes', value: assessments.filter(a => a.score == null).length, color: '#f59e0b' },
          { label: 'Promedio', value: avgScore != null ? `${avgScore}%` : '—', color: '#60a5fa' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '14px' }}>
        <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los cursos</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </div>
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando...</div>
          : assessments.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
              <ClipboardCheck size={48} style={{ opacity: 0.3, marginBottom: '12px' }} /><p>No hay evaluaciones.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ background: '#0f172a', color: '#64748b' }}>
                {['Evaluación', 'Tipo', 'Curso', 'Estudiante', 'Puntaje', 'Fecha'].map(h => <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {assessments.map((a, i) => {
                  const pct = a.score != null ? Math.round((a.score / a.maxScore) * 100) : null;
                  return (
                    <tr key={a.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500 }}>{a.title}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: TYPE_C[a.type] + '22', color: TYPE_C[a.type] }}>{a.type}</span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{a.course?.title ?? '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{a.enrollment?.studentName ?? '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {a.score != null ? (
                          <div>
                            <span style={{ fontWeight: 700, color: pct! >= 60 ? '#10b981' : '#ef4444' }}>{a.score}/{a.maxScore}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b', marginLeft: '6px' }}>({pct}%)</span>
                            <div style={{ height: '3px', background: '#334155', borderRadius: '999px', marginTop: '4px', width: '80px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: pct! >= 60 ? '#10b981' : '#ef4444', borderRadius: '999px' }} />
                            </div>
                          </div>
                        ) : <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}>Pendiente</span>}
                      </td>
                      <td style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.8rem' }}>{new Date(a.createdAt).toLocaleDateString('es-CO')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Registrar Evaluación</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[{ label: 'Título *', key: 'title' }, { label: 'Descripción', key: 'description' }].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Curso *</span>
                <select value={form.courseId} onChange={e => setForm(p => ({ ...p, courseId: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Seleccionar</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Estudiante (matrícula)</span>
                <select value={form.enrollmentId} onChange={e => setForm(p => ({ ...p, enrollmentId: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>General (sin estudiante)</option>
                  {enrollments.map(e => <option key={e.id} value={e.id}>{e.studentName}</option>)}
                </select>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Tipo</span>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {['QUIZ', 'PROJECT', 'EXAM'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </label>
                {[{ label: 'Máx.', key: 'maxScore' }, { label: 'Puntaje', key: 'score' }].map(f => (
                  <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                    <span style={{ color: '#94a3b8' }}>{f.label}</span>
                    <input type='number' value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                  </label>
                ))}
              </div>
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
