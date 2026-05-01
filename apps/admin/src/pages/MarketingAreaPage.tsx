import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Megaphone, Users, PenTool, BarChart2,
  Image as ImageIcon, Send, Save, Edit3,
  TrendingUp, Target, ArrowLeft,
  Bold, Italic, Heading1, Heading2, Quote,
  Code, List, ListOrdered, Link, Trash2, Table as TableIcon,
  Loader
} from 'lucide-react';
import { blogService, type BlogPost } from '../services/blog.service';

interface Campaign { id: string; name: string; platform: string; budget: number; spent: number; status: string; leads: number; startDate: string; }
interface Lead { id: string; name: string; email: string; source: string; status: string; createdAt: string; }

const fmtDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (num: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(num);

const CAMPAIGN_STATUS = { ACTIVE: { label: 'Activa', color: '#059669', bg: 'rgba(5,150,105,0.1)' }, PAUSED: { label: 'Pausada', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }, ENDED: { label: 'Finalizada', color: '#64748b', bg: 'rgba(100,116,139,0.1)' } } as const;
const LEAD_STATUS = { NEW: { label: 'Nuevo', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }, CONTACTED: { label: 'Contactado', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }, QUALIFIED: { label: 'Calificado', color: '#059669', bg: 'rgba(5,150,105,0.1)' }, LOST: { label: 'Perdido', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' } } as const;
const BLOG_STATUS = { DRAFT: { label: 'Borrador', color: '#64748b', bg: 'rgba(100,116,139,0.1)' }, PUBLISHED: { label: 'Publicado', color: '#059669', bg: 'rgba(5,150,105,0.1)' }, ARCHIVED: { label: 'Archivado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' } } as const;

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

function ToolbarButton({ icon: Icon, onClick, title, active }: { icon: any, onClick: () => void, title: string, active?: boolean }) {
  return (
    <button 
      onClick={(e) => { e.preventDefault(); onClick(); }} 
      title={title} 
      style={{ background: active ? 'var(--surface-hover)' : 'transparent', border: 'none', cursor: 'pointer', color: active ? 'var(--primary-color)' : 'var(--text-muted)', padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'}
      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = active ? 'var(--surface-hover)' : 'transparent'}
    >
      <Icon size={16} />
    </button>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ campaigns, leads, posts }: { campaigns: Campaign[]; leads: Lead[]; posts: BlogPost[] }) {
  const active_campaigns = campaigns.filter(c => c.status === 'ACTIVE').length;
  const total_spent = campaigns.reduce((acc, curr) => acc + curr.spent, 0);
  const total_leads = leads.length;
  const new_leads = leads.filter(l => l.status === 'NEW').length;
  
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <KpiCard label="Campañas Activas" value={active_campaigns} sub={`de ${campaigns.length} total`} icon={Target} color="#8b5cf6" />
        <KpiCard label="Inversión Total" value={fmtMoney(total_spent)} sub="Mes actual" icon={TrendingUp} color="#10b981" />
        <KpiCard label="Total Leads" value={total_leads} sub={`${new_leads} sin contactar`} icon={Users} color="#3b82f6" />
        <KpiCard label="Artículos Blog" value={posts.length} sub={`${posts.filter(p => p.status === 'PUBLISHED').length} publicados`} icon={PenTool} color="#f59e0b" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Rendimiento de Campañas</h3>
          {campaigns.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin campañas activas.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {campaigns.slice(0, 5).map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{c.platform} • {c.leads} leads</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{fmtMoney(c.spent)}</div>
                    <Badge value={c.status} map={CAMPAIGN_STATUS as unknown as StatusMap} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Últimos Leads</h3>
          {leads.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sin leads registrados.</p> : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             {leads.slice(0, 5).map(l => (
               <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                   <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--background-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.8rem' }}>
                     {l.name.substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                     <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{l.name}</div>
                     <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{l.source}</div>
                   </div>
                 </div>
                 <Badge value={l.status} map={LEAD_STATUS as unknown as StatusMap} />
               </div>
             ))}
           </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Blog Editor Tab ─────────────────────────────────────────────────────────
function BlogEditorView({ editingPost, setEditingPost, posts, setPosts }: any) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: editingPost.content || '',
    onUpdate: ({ editor }) => {
      setEditingPost((prev: any) => prev ? { ...prev, content: editor.getHTML() } : null);
    },
    editorProps: {
      attributes: {
        class: 'markdown-preview tiptap-editor',
        style: 'min-height: 50vh; outline: none; padding: 10px 0;'
      }
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    setIsSaving(true);
    try {
      const isNew = !posts.find((p: any) => p.id === editingPost.id);
      const data = { ...editingPost, status };
      
      if (isNew) {
        const { id, ...createData } = data; // Backend generates UUID
        const savedPost = await blogService.create(createData);
        setPosts([savedPost, ...posts]);
      } else {
        const savedPost = await blogService.update(editingPost.id, data);
        setPosts(posts.map((p: any) => p.id === savedPost.id ? savedPost : p));
      }
      setEditingPost(null);
    } catch (err) {
      alert('Error al guardar el artículo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { url } = await blogService.uploadImage(file);
      setEditingPost({ ...editingPost, coverImage: url });
    } catch (err) {
      alert('Error al subir imagen de portada');
    }
  };

  if (!editor) return null;

  const insertLink = () => {
    const url = window.prompt('URL del enlace:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const { url } = await blogService.uploadImage(file);
          editor.chain().focus().setImage({ src: url }).run();
        } catch (err) {
          alert('Error al subir imagen');
        }
      }
    };
    input.click();
  };

  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden', minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      {/* Editor Toolbar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface-color)', zIndex: 10 }}>
        <button onClick={() => setEditingPost(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
          <ArrowLeft size={16} /> Volver
        </button>
        
        <div style={{ display: 'flex', gap: 12 }}>
          {posts.some((p: any) => p.id === editingPost.id) && (
            <button onClick={() => { setPosts(posts.filter((p: any) => p.id !== editingPost.id)); setEditingPost(null); }} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid transparent', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          <button onClick={() => handleSave('DRAFT')} disabled={isSaving} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--background-color)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontWeight: 600, fontSize: '0.875rem', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Guardar Borrador
          </button>
          <button onClick={() => handleSave('PUBLISHED')} disabled={isSaving} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--primary-color)', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: isSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: isSaving ? 0.7 : 1 }}>
            {isSaving ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} Publicar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Main Editor Area */}
        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', overflowY: 'auto', background: 'var(--background-color)' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
            
            {/* Cover Image */}
            <div 
              onClick={() => coverInputRef.current?.click()}
              style={{ width: '100%', height: 250, background: editingPost.coverImage ? `url(${editingPost.coverImage}) center/cover` : 'var(--surface-color)', borderRadius: 16, border: editingPost.coverImage ? 'none' : '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 32, color: editingPost.coverImage ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'background 0.2s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '0.9'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}>
              <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" style={{ display: 'none' }} />
              {editingPost.coverImage && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />}
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <ImageIcon size={32} style={{ marginBottom: 12 }} />
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{editingPost.coverImage ? 'Cambiar imagen de portada' : 'Añadir imagen de portada'}</span>
                {!editingPost.coverImage && <span style={{ fontSize: '0.75rem', marginTop: 4, display: 'block' }}>Recomendado: 1200 x 630px</span>}
              </div>
            </div>

            {/* Title Input */}
            <input 
              type="text" 
              placeholder="Escribe un título atrapante..." 
              value={editingPost.title}
              onChange={e => {
                const newTitle = e.target.value;
                const newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setEditingPost({ ...editingPost, title: newTitle, slug: editingPost.slug || newSlug });
              }}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', outline: 'none', marginBottom: 16, padding: 0 }}
            />

            {/* TipTap Toolbar */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, padding: '8px 0', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <ToolbarButton icon={Bold} onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita" />
              <ToolbarButton icon={Italic} onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva" />
              <div style={{ width: 1, background: 'var(--border-color)', margin: '4px 4px' }} />
              <ToolbarButton icon={Heading1} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Título 1" />
              <ToolbarButton icon={Heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título 2" />
              <div style={{ width: 1, background: 'var(--border-color)', margin: '4px 4px' }} />
              <ToolbarButton icon={Quote} onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Cita" />
              <ToolbarButton icon={Code} onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Código" />
              <div style={{ width: 1, background: 'var(--border-color)', margin: '4px 4px' }} />
              <ToolbarButton icon={List} onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista" />
              <ToolbarButton icon={ListOrdered} onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada" />
              <div style={{ width: 1, background: 'var(--border-color)', margin: '4px 4px' }} />
              <ToolbarButton icon={Link} onClick={insertLink} active={editor.isActive('link')} title="Enlace" />
              <ToolbarButton icon={ImageIcon} onClick={insertImage} title="Imagen" />
              <ToolbarButton icon={TableIcon} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Tabla" />
            </div>

            {/* TipTap Content */}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div style={{ width: 320, padding: 24, background: 'var(--surface-color)', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>Configuración del Post</h4>
            <TF label="Autor">
              <input type="text" className="form-input" value={editingPost.author} onChange={e => setEditingPost({ ...editingPost, author: e.target.value })} />
            </TF>
            <TF label="URL Slug (opcional)">
              <input type="text" className="form-input" placeholder="ejemplo-de-articulo" value={editingPost.slug || ''} onChange={e => setEditingPost({ ...editingPost, slug: e.target.value })} />
            </TF>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>SEO & Descubrimiento</h4>
            <TF label="Descripción Meta">
              <textarea className="form-input" rows={3} placeholder="Breve resumen para Google y redes sociales..." style={{ resize: 'vertical' }} value={editingPost.metaDescription || ''} onChange={e => setEditingPost({ ...editingPost, metaDescription: e.target.value })}></textarea>
            </TF>
            <TF label="Etiquetas (separadas por coma)">
              <input type="text" className="form-input" placeholder="Educación, Tecnología, Novedades" value={editingPost.tags?.join(', ')} onChange={e => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map((t: string) => t.trim()) })} />
            </TF>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlogTab({ posts, setPosts }: { posts: BlogPost[]; setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>> }) {
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  
  // Lista de Posts
  if (!editingPost) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{posts.length} artículo{posts.length !== 1 ? 's' : ''}</span>
          <button 
            onClick={() => setEditingPost({ id: Math.random().toString(36).substring(7), title: '', content: '', author: 'Equipo Académico', status: 'DRAFT', tags: [], slug: '', metaDescription: '' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
          >
            <PenTool size={14} /> Escribir Artículo
          </button>
        </div>

        {posts.length === 0 ? <EmptyState icon={PenTool} text="No hay artículos en el blog aún." /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
            {posts.map(p => (
              <div key={p.id} style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: 140, background: p.coverImage ? `url(${p.coverImage}) center/cover` : 'var(--background-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {!p.coverImage && <ImageIcon size={32} style={{ opacity: 0.2 }} />}
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <Badge value={p.status} map={BLOG_STATUS as unknown as StatusMap} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fmtDate(p.publishedAt || new Date().toISOString())}</span>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 8, lineHeight: 1.3 }}>{p.title || 'Sin Título'}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16, flex: 1 }}>{p.content ? p.content.substring(0, 100) + '...' : 'Sin contenido...'}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{p.author}</span>
                      <button onClick={async () => {
                        if (confirm('¿Eliminar este artículo?')) {
                          await blogService.delete(p.id);
                          setPosts(posts.filter(post => post.id !== p.id));
                        }
                      }} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, border: '1px solid transparent', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Trash2 size={13} /> Eliminar
                      </button>
                      <button onClick={() => setEditingPost(p)} style={{ padding: '6px 12px', borderRadius: 6, background: 'var(--background-color)', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Edit3 size={13} /> Editar
                      </button>
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (editingPost) {
    return <BlogEditorView editingPost={editingPost} setEditingPost={setEditingPost} posts={posts} setPosts={setPosts} />;
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',  label: 'Resumen',        icon: BarChart2 },
  { id: 'blog',      label: 'Blog (Contenido)',icon: PenTool },
  { id: 'campaigns', label: 'Campañas',       icon: Megaphone },
  { id: 'leads',     label: 'Leads',          icon: Users },
];

export function MarketingAreaPage() {
  const [activeTab, setActiveTab]   = useState('overview');
  
  // Mock Data (En una implementación real se obtendría del API)
  const [campaigns] = useState<Campaign[]>([
    { id: '1', name: 'Lanzamiento FoundTeach Pro', platform: 'Meta Ads', budget: 500000, spent: 120000, status: 'ACTIVE', leads: 45, startDate: '2026-04-01' },
    { id: '2', name: 'Retargeting Usuarios Activos', platform: 'Google Ads', budget: 200000, spent: 50000, status: 'ACTIVE', leads: 12, startDate: '2026-04-15' }
  ]);
  const [leads] = useState<Lead[]>([
    { id: '1', name: 'Laura Gómez', email: 'laura@email.com', source: 'Lanzamiento FoundTeach Pro', status: 'NEW', createdAt: new Date().toISOString() },
    { id: '2', name: 'Carlos Ruíz', email: 'carlos@email.com', source: 'Orgánico (Blog)', status: 'CONTACTED', createdAt: new Date().toISOString() }
  ]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await blogService.getAll();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const renderTab = () => {
    if (loading && activeTab === 'blog') return <div style={{ padding: 40, textAlign: 'center' }}><Loader className="animate-spin" style={{ margin: '0 auto' }} /></div>;
    
    switch (activeTab) {
      case 'overview':  return <OverviewTab campaigns={campaigns} leads={leads} posts={posts} />;
      case 'blog':      return <BlogTab posts={posts} setPosts={setPosts} />;
      case 'campaigns': return <EmptyState icon={Megaphone} text="Módulo de Campañas en construcción..." />;
      case 'leads':     return <EmptyState icon={Users} text="CRM de Leads en construcción..." />;
      default:          return null;
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Megaphone size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área de Marketing</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gestión de campañas, contenido del blog y leads</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-color)', borderRadius: 12, padding: 5, border: '1px solid var(--border-color)', width: 'fit-content', overflowX: 'auto' }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, fontSize: '0.855rem', fontWeight: 600, background: active ? 'white' : 'transparent', color: active ? 'var(--primary-color)' : 'var(--text-muted)', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', border: active ? '1px solid var(--border-color)' : '1px solid transparent', transition: 'all 0.15s', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Icon size={15} />{tab.label}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
}
