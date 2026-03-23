import { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/edu`;
const token = () => localStorage.getItem('foundteach_token') ?? '';

interface Lesson { id: string; title: string; type: string; durationMin?: number; orderIndex: number; contentUrl?: string; }
interface Course {
  id: string; title: string; description?: string; level: string; category?: string;
  instructor?: string; status: string; durationH?: number; isPublic: boolean; coverUrl?: string;
  lessons?: Lesson[];
  _count?: { lessons: number; enrollments: number };
}

const LEVEL_C: Record<string, string> = { BEGINNER: '#10b981', INTERMEDIATE: '#f59e0b', ADVANCED: '#ef4444' };
const LEVEL_L: Record<string, string> = { BEGINNER: 'Principiante', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado' };
const STATUS_C: Record<string, string> = { DRAFT: '#64748b', PUBLISHED: '#10b981', ARCHIVED: '#94a3b8' };
const STATUS_L: Record<string, string> = { DRAFT: 'Borrador', PUBLISHED: 'Publicado', ARCHIVED: 'Archivado' };
const TYPE_I: Record<string, string> = { VIDEO: '🎬', READING: '📖', QUIZ: '🧠', ACTIVITY: '🎯' };

export function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Record<string, Course>>({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [showLessonModal, setShowLessonModal] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', type: 'VIDEO', contentUrl: '', durationMin: '', orderIndex: '0' });
  const [form, setForm] = useState({ title: '', description: '', level: 'BEGINNER', category: '', instructor: '', status: 'DRAFT', durationH: '', isPublic: false, coverUrl: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus ? `${BASE}/courses?status=${filterStatus}` : `${BASE}/courses`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) setCourses(await res.json());
    } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { void load(); }, [load]);

  const expand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    if (!expandedData[id]) {
      const res = await fetch(`${BASE}/courses/${id}`, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) { const data: Course = await res.json(); setExpandedData(p => ({ ...p, [id]: data })); }
    }
  };

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', level: 'BEGINNER', category: '', instructor: '', status: 'DRAFT', durationH: '', isPublic: false, coverUrl: '' }); setShowModal(true); };
  const openEdit = (c: Course) => { setEditing(c); setForm({ title: c.title, description: c.description ?? '', level: c.level, category: c.category ?? '', instructor: c.instructor ?? '', status: c.status, durationH: String(c.durationH ?? ''), isPublic: c.isPublic, coverUrl: c.coverUrl ?? '' }); setShowModal(true); };

  const save = async () => {
    const body = { ...form, durationH: Number(form.durationH) || 0 };
    const url = editing ? `${BASE}/courses/${editing.id}` : `${BASE}/courses`;
    await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
    setShowModal(false); void load();
  };

  const addLesson = async (courseId: string) => {
    await fetch(`${BASE}/lessons`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ ...lessonForm, courseId, durationMin: Number(lessonForm.durationMin) || 0, orderIndex: Number(lessonForm.orderIndex) || 0 }) });
    const res = await fetch(`${BASE}/courses/${courseId}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const data: Course = await res.json(); setExpandedData(p => ({ ...p, [courseId]: data })); }
    setShowLessonModal(null);
    setLessonForm({ title: '', type: 'VIDEO', contentUrl: '', durationMin: '', orderIndex: '0' });
  };

  const deleteLesson = async (lessonId: string, courseId: string) => {
    await fetch(`${BASE}/lessons/${lessonId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    const res = await fetch(`${BASE}/courses/${courseId}`, { headers: { Authorization: `Bearer ${token()}` } });
    if (res.ok) { const data: Course = await res.json(); setExpandedData(p => ({ ...p, [courseId]: data })); }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Cursos</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Gestión del contenido educativo de FoundTeach</p>
        </div>
        <button onClick={openCreate} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>+ Nuevo Curso</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total cursos', value: courses.length, color: '#818cf8' },
          { label: 'Publicados', value: courses.filter(c => c.status === 'PUBLISHED').length, color: '#10b981' },
          { label: 'Borradores', value: courses.filter(c => c.status === 'DRAFT').length, color: '#f59e0b' },
          { label: 'Total estudiantes', value: courses.reduce((s, c) => s + (c._count?.enrollments ?? 0), 0), color: '#60a5fa' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '14px', display: 'flex', gap: '10px' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los estados</option>
          {Object.entries(STATUS_L).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando cursos...</div>
        : courses.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px', background: '#1e293b', borderRadius: '12px', border: '1px dashed #334155' }}>
            <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '12px' }} /><p>No hay cursos creados.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {courses.map(c => (
              <div key={c.id} style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
                {/* Course header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }} onClick={() => void expand(c.id)}>
                  {c.coverUrl ? <img src={c.coverUrl} alt={c.title} style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} /> :
                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>📚</div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{c.title}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, background: LEVEL_C[c.level] + '22', color: LEVEL_C[c.level] }}>{LEVEL_L[c.level]}</span>
                      <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '0.68rem', fontWeight: 700, background: STATUS_C[c.status] + '22', color: STATUS_C[c.status] }}>{STATUS_L[c.status]}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '3px' }}>
                      {c.instructor && <span>👨‍🏫 {c.instructor} · </span>}
                      <span>📖 {c._count?.lessons ?? 0} lecciones · 🎓 {c._count?.enrollments ?? 0} estudiantes</span>
                      {c.durationH ? <span> · ⏱ {c.durationH}h</span> : null}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); openEdit(c); }} style={{ background: '#334155', border: 'none', color: '#94a3b8', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem' }}>Editar</button>
                    {expanded === c.id ? <ChevronDown size={18} color='#64748b' /> : <ChevronRight size={18} color='#64748b' />}
                  </div>
                </div>

                {/* Lessons accordion */}
                {expanded === c.id && (
                  <div style={{ borderTop: '1px solid #334155', background: '#0f172a', padding: '14px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>LECCIONES</span>
                      <button onClick={() => setShowLessonModal(c.id)} style={{ background: '#6366f122', border: '1px solid #6366f144', color: '#818cf8', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>+ Agregar</button>
                    </div>
                    {(expandedData[c.id]?.lessons ?? []).length === 0
                      ? <p style={{ color: '#475569', fontSize: '0.85rem' }}>Sin lecciones aún.</p>
                      : (expandedData[c.id]?.lessons ?? []).map(l => (
                        <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                          <span style={{ fontSize: '1rem' }}>{TYPE_I[l.type] ?? '📄'}</span>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{l.title}</span>
                            {l.durationMin ? <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>{l.durationMin} min</span> : null}
                          </div>
                          {l.contentUrl && <a href={l.contentUrl} target='_blank' rel='noreferrer' style={{ fontSize: '0.75rem', color: '#818cf8' }}>Ver</a>}
                          <button onClick={() => void deleteLesson(l.id, c.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Course Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>{editing ? 'Editar Curso' : 'Nuevo Curso'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <label style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Título *</span>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
              </label>
              <label style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Descripción</span>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem', resize: 'vertical' }} />
              </label>
              {[
                { label: 'Nivel', key: 'level', opts: Object.entries(LEVEL_L) },
                { label: 'Estado', key: 'status', opts: Object.entries(STATUS_L) },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <select value={String((form as Record<string, unknown>)[f.key])} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                    {f.opts.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              ))}
              {[
                { label: 'Categoría', key: 'category' }, { label: 'Instructor', key: 'instructor' },
                { label: 'Duración (horas)', key: 'durationH' }, { label: 'Portada URL', key: 'coverUrl' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem', gridColumn: f.key === 'coverUrl' ? '1/-1' : undefined }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input value={String((form as Record<string, unknown>)[f.key])} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type='checkbox' checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} />
                <span style={{ color: '#94a3b8' }}>Curso público</span>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '24px', width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>Nueva Lección</h3>
              <button onClick={() => setShowLessonModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gap: '10px' }}>
              {[{ label: 'Título *', key: 'title' }, { label: 'URL del contenido', key: 'contentUrl' }, { label: 'Duración (min)', key: 'durationMin' }, { label: 'Orden', key: 'orderIndex' }].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                  <span style={{ color: '#94a3b8' }}>{f.label}</span>
                  <input value={(lessonForm as Record<string, string>)[f.key]} onChange={e => setLessonForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                </label>
              ))}
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Tipo</span>
                <select value={lessonForm.type} onChange={e => setLessonForm(p => ({ ...p, type: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  {Object.entries(TYPE_I).map(([k, v]) => <option key={k} value={k}>{v} {k}</option>)}
                </select>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setShowLessonModal(null)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void addLesson(showLessonModal)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '9px 18px', cursor: 'pointer', fontWeight: 600 }}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
