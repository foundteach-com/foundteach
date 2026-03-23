import { useState, useEffect, useCallback } from 'react';
import { X, Star } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/api/hcm`;

interface Employee { id: string; firstName: string; lastName: string; }
interface Review {
  id: string; employeeId: string; period: string; score: number;
  strengths?: string; improvements?: string; reviewerName?: string; status: string;
  createdAt: string;
  employee?: { id: string; firstName: string; lastName: string; position: string };
}

const STATUS_COLORS: Record<string, string> = { DRAFT: '#64748b', SUBMITTED: '#60a5fa', ACKNOWLEDGED: '#10b981' };
const STATUS_LABELS: Record<string, string> = { DRAFT: 'Borrador', SUBMITTED: 'Enviada', ACKNOWLEDGED: 'Firmada' };
const token = () => localStorage.getItem('foundteach_token') ?? '';

const Stars = ({ score }: { score: number }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(n => (
      <Star key={n} size={14} fill={n <= score ? '#f59e0b' : 'transparent'} color={n <= score ? '#f59e0b' : '#334155'} />
    ))}
  </div>
);

export function EvaluacionesPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterEmp, setFilterEmp] = useState('');
  const [form, setForm] = useState({ employeeId: '', period: '', score: '4', strengths: '', improvements: '', reviewerName: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterEmp ? `${BASE}/reviews?employeeId=${filterEmp}` : `${BASE}/reviews`;
      const [rRes, eRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/employees?onlyActive=true`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (rRes.ok) setReviews(await rRes.json());
      if (eRes.ok) setEmployees(await eRes.json());
    } finally { setLoading(false); }
  }, [filterEmp]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    await fetch(`${BASE}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ ...form, score: Number(form.score) }),
    });
    setShowModal(false);
    void load();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`${BASE}/reviews/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ status }),
    });
    void load();
  };

  const avgScore = reviews.length ? (reviews.reduce((s, r) => s + r.score, 0) / reviews.length).toFixed(1) : '—';

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Evaluaciones de Desempeño</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Seguimiento del rendimiento del equipo</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
          + Nueva Evaluación
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total evaluaciones', value: reviews.length, color: '#818cf8' },
          { label: 'Puntuación promedio', value: avgScore, color: '#f59e0b' },
          { label: 'Enviadas', value: reviews.filter(r => r.status === 'SUBMITTED').length, color: '#60a5fa' },
          { label: 'Firmadas', value: reviews.filter(r => r.status === 'ACKNOWLEDGED').length, color: '#10b981' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '14px' }}>
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los colaboradores</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando evaluaciones...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>
          <Star size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No hay evaluaciones registradas.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                    {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId}
                    {r.employee?.position && <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '8px' }}>{r.employee.position}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Stars score={r.score} />
                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>{r.score}/5</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Período: {r.period}</span>
                    {r.reviewerName && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>por {r.reviewerName}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: STATUS_COLORS[r.status] + '22', color: STATUS_COLORS[r.status] }}>
                    {STATUS_LABELS[r.status]}
                  </span>
                  <select value={r.status} onChange={e => void updateStatus(r.id, e.target.value)}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', padding: '4px 8px', color: '#e2e8f0', fontSize: '0.75rem' }}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              {(r.strengths || r.improvements) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                  {r.strengths && (
                    <div style={{ background: '#10b98110', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #10b981' }}>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginBottom: '3px' }}>✅ FORTALEZAS</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.strengths}</div>
                    </div>
                  )}
                  {r.improvements && (
                    <div style={{ background: '#f59e0b10', borderRadius: '8px', padding: '8px 12px', borderLeft: '3px solid #f59e0b' }}>
                      <div style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 700, marginBottom: '3px' }}>📈 ÁREAS A MEJORAR</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{r.improvements}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Nueva Evaluación</h2>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Período *</span>
                  <input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder='2026-Q1'
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>Evaluador</span>
                  <input value={form.reviewerName} onChange={e => setForm(p => ({ ...p, reviewerName: e.target.value }))} placeholder='Nombre'
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Puntuación: {form.score}/5</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(p => ({ ...p, score: String(n) }))}
                      style={{ background: Number(form.score) >= n ? '#f59e0b' : '#0f172a', border: `1px solid ${Number(form.score) >= n ? '#f59e0b' : '#334155'}`, borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', color: Number(form.score) >= n ? '#000' : '#64748b', fontWeight: 700 }}>
                      {n}
                    </button>
                  ))}
                </div>
              </label>
              {[
                { label: 'Fortalezas', key: 'strengths' },
                { label: 'Áreas de mejora', key: 'improvements' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <textarea value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} rows={2}
                    style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
                </label>
              ))}
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
