import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const token = () => localStorage.getItem('foundteach_token') ?? '';

interface Analytics {
  totalCourses: number; publishedCourses: number; totalEnrollments: number;
  completedEnrollments: number; completionRate: number; avgProgress: number;
  topCourses: { id: string; title: string; students: number }[];
  recentEnrollments: { id: string; studentName: string; createdAt: string; course: { title: string } }[];
}

export function AnaliticaEduPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/edu/analytics`, { headers: { Authorization: `Bearer ${token()}` } });
        if (res.ok) setData(await res.json());
      } finally { setLoading(false); }
    };
    void load();
  }, []);

  const maxStudents = data ? Math.max(...data.topCourses.map(c => c.students), 1) : 1;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Analítica de Aprendizaje</h1>
        <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Métricas del ecosistema educativo de FoundTeach</p>
      </div>

      {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px' }}>Calculando métricas...</div>
        : !data ? <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>No hay datos disponibles.</div>
        : (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '14px', marginBottom: '28px' }}>
              {[
                { label: 'Cursos totales', value: data.totalCourses, sub: `${data.publishedCourses} publicados`, color: '#818cf8', icon: '📚' },
                { label: 'Matrículas', value: data.totalEnrollments, sub: `${data.completedEnrollments} completadas`, color: '#10b981', icon: '🎓' },
                { label: 'Tasa de completación', value: `${data.completionRate}%`, sub: 'Completados / Total', color: data.completionRate >= 50 ? '#10b981' : '#f59e0b', icon: '✅' },
                { label: 'Progreso promedio', value: `${data.avgProgress}%`, sub: 'Promedio de todos', color: '#60a5fa', icon: '📈' },
              ].map(k => (
                <div key={k.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '18px', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '12px', right: '14px', fontSize: '1.8rem', opacity: 0.15 }}>{k.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: k.color }}>{k.value}</div>
                  <div style={{ fontWeight: 600, marginTop: '4px', fontSize: '0.875rem' }}>{k.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{k.sub}</div>
                  {/* Mini progress ring visual */}
                  {typeof k.value === 'string' && k.value.includes('%') && (
                    <div style={{ height: '3px', background: '#334155', borderRadius: '999px', marginTop: '10px' }}>
                      <div style={{ height: '100%', width: k.value, background: k.color, borderRadius: '999px', transition: 'width 0.5s' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Top Courses bar chart */}
              <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BarChart3 size={18} color='#818cf8' />
                  <span style={{ fontWeight: 600 }}>Cursos más populares</span>
                </div>
                {data.topCourses.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sin datos.</p>
                  : data.topCourses.map((c, i) => (
                    <div key={c.id} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span style={{ color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{c.title}</span>
                        <span style={{ color: '#818cf8', fontWeight: 700, flexShrink: 0 }}>{c.students} est.</span>
                      </div>
                      <div style={{ height: '8px', background: '#334155', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.round((c.students / maxStudents) * 100)}%`, background: ['#818cf8', '#60a5fa', '#34d399', '#f59e0b', '#f472b6'][i % 5], borderRadius: '999px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  ))}
              </div>

              {/* Recent Enrollments */}
              <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px' }}>
                <div style={{ fontWeight: 600, marginBottom: '16px' }}>🕐 Matrículas recientes</div>
                {data.recentEnrollments.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Sin datos.</p>
                  : data.recentEnrollments.map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #334155' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{e.studentName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{e.course.title}</div>
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', flexShrink: 0 }}>{new Date(e.createdAt).toLocaleDateString('es-CO')}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Completion funnel */}
            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '20px', marginTop: '16px' }}>
              <div style={{ fontWeight: 600, marginBottom: '16px' }}>📊 Embudo de aprendizaje</div>
              <div style={{ display: 'flex', gap: '0', alignItems: 'stretch', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                {[
                  { label: 'Matriculados', value: data.totalEnrollments, color: '#6366f1' },
                  { label: 'En progreso', value: data.totalEnrollments - data.completedEnrollments, color: '#f59e0b' },
                  { label: 'Completados', value: data.completedEnrollments, color: '#10b981' },
                ].map((s, i) => {
                  const pct = data.totalEnrollments > 0 ? Math.round((s.value / data.totalEnrollments) * 100) : 0;
                  return (
                    <div key={i} style={{ flex: pct || 1, background: s.color + (i === 0 ? '' : '99'), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '60px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.value}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
    </div>
  );
}
