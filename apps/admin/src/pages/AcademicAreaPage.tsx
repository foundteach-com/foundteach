import { useState } from 'react';
import {
  BookOpen, Search, FileText, ClipboardList,
  Plus, Trash2, Clock,
  CheckCircle, Send, Save, Edit3,
  Target, ArrowLeft, ExternalLink, Link
} from 'lucide-react';

interface ResearchSource { id: string; url: string; title: string; }
interface BaseArticle { 
  id: string; 
  title: string; 
  topic: string;
  sources: ResearchSource[];
  analysis: string; 
  status: 'RESEARCH' | 'DRAFTING' | 'REVIEW' | 'DELIVERED';
  author: string;
  createdAt: string;
  updatedAt: string;
}

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const ARTICLE_STATUS = { 
  RESEARCH: { label: 'Investigación', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }, 
  DRAFTING: { label: 'Redacción', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }, 
  REVIEW: { label: 'Revisión', color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' }, 
  DELIVERED: { label: 'Entregado a Marketing', color: '#059669', bg: 'rgba(5,150,105,0.1)' } 
} as const;

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

function EmptyState({ icon: Icon, text }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; text: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
      <Icon size={32} style={{ margin: '0 auto', opacity: 0.5 }} />
      <p style={{ marginTop: 12, fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

function TF({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="form-group"><label className="form-label">{label}</label>{children}</div>;
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ articles }: { articles: BaseArticle[] }) {
  const researchCount = articles.filter(a => a.status === 'RESEARCH').length;
  const deliveredCount = articles.filter(a => a.status === 'DELIVERED').length;
  const totalArticles = articles.length;
  
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Artículos Totales" value={totalArticles} sub="Creados en esta área" icon={FileText} color="#3b82f6" />
        <KpiCard label="En Investigación" value={researchCount} sub="Fase inicial" icon={Search} color="#f59e0b" />
        <KpiCard label="Entregados" value={deliveredCount} sub="Listos para Marketing" icon={CheckCircle} color="#10b981" />
        <KpiCard label="Temas Cubiertos" value={new Set(articles.map(a => a.topic)).size} sub="Áreas de conocimiento" icon={Target} color="#8b5cf6" />
      </div>

      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Actividad Reciente</h3>
        {articles.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No hay actividad registrada.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {articles.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.topic} • Actualizado: {fmtDate(a.updatedAt)}</div>
                </div>
                <Badge value={a.status} map={ARTICLE_STATUS as unknown as StatusMap} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Research & Drafting Tab ──────────────────────────────────────────────────
function ResearchTab({ articles, setArticles }: { articles: BaseArticle[]; setArticles: React.Dispatch<React.SetStateAction<BaseArticle[]>> }) {
  const [editingArticle, setEditingArticle] = useState<BaseArticle | null>(null);

  if (!editingArticle) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{articles.length} investigación{articles.length !== 1 ? 'es' : ''}</span>
          <button 
            onClick={() => setEditingArticle({ 
              id: Math.random().toString(36).substring(7), 
              title: '', 
              topic: '', 
              sources: [], 
              analysis: '', 
              status: 'RESEARCH', 
              author: 'Manuel M.', 
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
          >
            <Plus size={14} /> Nueva Investigación
          </button>
        </div>

        {articles.length === 0 ? <EmptyState icon={Search} text="Comienza tu primera investigación técnica." /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
            {articles.map(a => (
              <div key={a.id} style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 20, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Badge value={a.status} map={ARTICLE_STATUS as unknown as StatusMap} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtDate(a.updatedAt)}</span>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 4, lineHeight: 1.3 }}>{a.title || 'Sin Título'}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600, marginBottom: 12 }}>{a.topic || 'Sin Tema'}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, flex: 1, lineClamp: 3, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {a.analysis ? a.analysis.substring(0, 120) + '...' : 'Inicia el análisis de este tema...'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <Link size={12} /> {a.sources.length} fuentes
                  </div>
                  <button onClick={() => setEditingArticle(a)} style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--background-color)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Edit3 size={13} /> Editar Análisis
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const handleSave = (status: BaseArticle['status']) => {
    const isNew = !articles.find(a => a.id === editingArticle.id);
    const updatedArticle = { ...editingArticle, status, updatedAt: new Date().toISOString() };
    
    if (isNew) {
      setArticles([updatedArticle, ...articles]);
    } else {
      setArticles(articles.map(a => a.id === updatedArticle.id ? updatedArticle : a));
    }
    setEditingArticle(null);
  };

  const addSource = () => {
    const url = prompt('Ingresa la URL de la fuente confiable:');
    if (url) {
      const title = prompt('Ingresa el título o descripción de la fuente:');
      const newSource = { id: Math.random().toString(36).substring(7), url, title: title || url };
      setEditingArticle({ ...editingArticle, sources: [...editingArticle.sources, newSource] });
    }
  };

  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden', minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-color)', zIndex: 10 }}>
        <button onClick={() => setEditingArticle(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver al listado
        </button>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => handleSave('DRAFTING')} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--background-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Save size={14} /> Guardar Progreso
          </button>
          <button onClick={() => handleSave('DELIVERED')} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--primary-color)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Send size={14} /> Entregar a Marketing
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, height: 'calc(70vh - 65px)' }}>
        <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'var(--background-color)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            <input 
              type="text" 
              placeholder="Tema de Investigación (ej. El Futuro de React 19)" 
              value={editingArticle.title}
              onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', outline: 'none', marginBottom: 8, padding: 0 }}
            />
            <div style={{ marginBottom: 32 }}>
               <input 
                type="text" 
                placeholder="Área Técnica / Especialidad" 
                value={editingArticle.topic}
                onChange={e => setEditingArticle({ ...editingArticle, topic: e.target.value })}
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '1rem', fontWeight: 600, color: 'var(--primary-color)', outline: 'none', padding: 0 }}
              />
            </div>

            <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-main)' }}>Análisis Estructurado y Redacción Base</h5>
            <textarea 
              placeholder="Escribe aquí tu análisis técnico consolidado..."
              value={editingArticle.analysis}
              onChange={e => setEditingArticle({ ...editingArticle, analysis: e.target.value })}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-main)', outline: 'none', minHeight: '40vh', resize: 'none', padding: 0, fontFamily: 'inherit' }}
            />
          </div>
        </div>

        <div style={{ width: 350, padding: 24, background: 'var(--surface-color)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Fuentes Confiables</h4>
              <button onClick={addSource} style={{ background: 'var(--background-color)', border: '1px solid var(--border-color)', borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={12} /> Agregar
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {editingArticle.sources.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px', border: '1px dashed var(--border-color)', borderRadius: 8 }}>
                  No hay fuentes agregadas aún.
                </div>
              ) : (
                editingArticle.sources.map(s => (
                  <div key={s.id} style={{ padding: 12, background: 'var(--background-color)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <a href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.7rem', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                        <ExternalLink size={10} /> Visitar fuente
                      </a>
                      <button 
                        onClick={() => setEditingArticle({ ...editingArticle, sources: editingArticle.sources.filter(x => x.id !== s.id) })}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <TF label="Estado Actual">
              <div style={{ padding: '8px 12px', borderRadius: 8, background: ARTICLE_STATUS[editingArticle.status].bg, color: ARTICLE_STATUS[editingArticle.status].color, fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={14} /> {ARTICLE_STATUS[editingArticle.status].label}
              </div>
            </TF>
            <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <p>Nota: Al hacer clic en "Entregado a Marketing", el análisis base estará disponible para que el equipo de Marketing lo adapte al blog.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Resumen',        icon: ClipboardList },
  { id: 'research',  label: 'Investigación y Análisis', icon: BookOpen },
];

export function AcademicAreaPage() {
  const [activeTab, setActiveTab]   = useState('overview');
  
  const [articles, setArticles] = useState<BaseArticle[]>([
    { 
      id: '1', 
      title: 'Principios de Arquitectura en Microservicios', 
      topic: 'Arquitectura de Software',
      sources: [{ id: 's1', url: 'https://martinfowler.com/articles/microservices.html', title: 'Microservices - Martin Fowler' }],
      analysis: 'Los microservicios son un enfoque arquitectónico que permite escalar equipos y aplicaciones...', 
      status: 'DELIVERED', 
      author: 'Manuel M.',
      createdAt: '2026-04-20T10:00:00Z',
      updatedAt: '2026-04-25T15:00:00Z'
    },
    { 
      id: '2', 
      title: 'Optimización de Consultas SQL en PostgreSQL', 
      topic: 'Bases de Datos',
      sources: [],
      analysis: 'Para mejorar el rendimiento de PostgreSQL, es vital entender el uso de índices y el comando EXPLAIN ANALYZE...', 
      status: 'DRAFTING', 
      author: 'Manuel M.',
      createdAt: '2026-04-25T12:00:00Z',
      updatedAt: '2026-04-25T18:00:00Z'
    }
  ]);

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab articles={articles} />;
      case 'research':  return <ResearchTab articles={articles} setArticles={setArticles} />;
      default:          return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <BookOpen size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área Académica</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Investigación técnica, análisis de temas y redacción base</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-color)', borderRadius: 12, padding: 5, border: '1px solid var(--border-color)', width: 'fit-content' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, fontSize: '0.855rem', fontWeight: 600, background: active ? 'white' : 'transparent', color: active ? 'var(--primary-color)' : 'var(--text-muted)', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', border: active ? '1px solid var(--border-color)' : '1px solid transparent', transition: 'all 0.15s', cursor: 'pointer' }}>
              <Icon size={15} />{tab.label}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
}
