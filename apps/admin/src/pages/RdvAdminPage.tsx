import { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Save, X } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';

const ETAPAS = [
  'EARLY_CHILDHOOD', 'CHILDHOOD', 'ADOLESCENCE',
  'YOUTH', 'ADULTHOOD', 'OLD_AGE'
];

interface Option {
  texto: string;
  cambiosEnAtributos?: Record<string, number>;
  cambiosEnContexto?: Record<string, number>;
  cambiosEnRelaciones?: Record<string, number>;
}

interface Decision {
  id?: string;
  etapa: string;
  titulo: string;
  descripcion: string;
  requisitos: any;
  opciones: Option[];
}

export function RdvAdminPage() {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [etapa, setEtapa] = useState(ETAPAS[0]);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [requisitosStr, setRequisitosStr] = useState('{\n  \n}');
  const [opciones, setOpciones] = useState<Option[]>([]);

  const fetchDecisions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/rdv/decisions`);
      if (res.ok) {
        const data = await res.json();
        setDecisions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
  }, []);

  const handleCreateNew = () => {
    setCurrentId(null);
    setEtapa(ETAPAS[0]);
    setTitulo('');
    setDescripcion('');
    setRequisitosStr('{\n  \n}');
    setOpciones([{ texto: 'Opción 1' }]);
    setIsEditing(true);
  };

  const handleEdit = (d: any) => {
    setCurrentId(d.id);
    setEtapa(d.etapa);
    setTitulo(d.titulo);
    setDescripcion(d.descripcion);
    setRequisitosStr(d.requisitos ? JSON.stringify(d.requisitos, null, 2) : '{\n  \n}');
    setOpciones(d.options || []);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta decisión?')) return;
    try {
      await fetch(`${API_URL}/api/rdv/decisions/${id}`, { method: 'DELETE' });
      fetchDecisions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    let reqs = {};
    try {
      reqs = JSON.parse(requisitosStr);
    } catch (err) {
      alert('El formato JSON de requisitos es inválido.');
      return;
    }

    const payload: Decision = {
      etapa,
      titulo,
      descripcion,
      requisitos: reqs,
      opciones
    };

    try {
      const method = currentId ? 'PUT' : 'POST';
      const url = currentId 
        ? `${API_URL}/api/rdv/decisions/${currentId}`
        : `${API_URL}/api/rdv/decisions`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsEditing(false);
        fetchDecisions();
      } else {
        const err = await res.json();
        alert('Error: ' + err.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión');
    }
  };

  const addOption = () => {
    setOpciones([...opciones, { texto: 'Nueva Opción' }]);
  };

  const updateOption = (index: number, val: string) => {
    const newOps = [...opciones];
    newOps[index].texto = val;
    setOpciones(newOps);
  };

  const removeOption = (index: number) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  if (isEditing) {
    return (
      <div style={{ background: 'var(--surface-color)', padding: 24, borderRadius: 16, border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
            {currentId ? 'Editar Decisión' : 'Nueva Decisión'}
          </h2>
          <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Columna Izquierda */}
          <div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Etapa de Vida</label>
              <select className="form-input" value={etapa} onChange={e => setEtapa(e.target.value)}>
                {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Título</label>
              <input type="text" className="form-input" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej. Primer día de escuela" />
            </div>

            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Descripción (Historia)</label>
              <textarea className="form-input" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4} />
            </div>
            
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Requisitos (JSON)</label>
              <textarea 
                className="form-input" 
                value={requisitosStr} 
                onChange={e => setRequisitosStr(e.target.value)} 
                rows={6} 
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                placeholder='{ "minStats": { "fisico": 50 } }'
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opcional. Formato JSON estricto.</span>
            </div>
          </div>

          {/* Columna Derecha */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label className="form-label" style={{ margin: 0 }}>Opciones</label>
              <button onClick={addOption} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '4px 8px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>
                <Plus size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Añadir
              </button>
            </div>
            
            {opciones.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input 
                  type="text" 
                  className="form-input" 
                  value={opt.texto} 
                  onChange={e => updateOption(i, e.target.value)} 
                />
                <button onClick={() => removeOption(i)} style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '0 12px', borderRadius: 8, cursor: 'pointer' }}>
                  <Trash size={16} />
                </button>
              </div>
            ))}
            
            <div style={{ marginTop: 32 }}>
              <button onClick={handleSave} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <Save size={18} />
                Guardar Decisión
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Decisiones del Juego</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gestiona las rutas y ramificaciones de Rutas de Vida.</p>
        </div>
        <button onClick={handleCreateNew} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={18} />
          Crear Decisión
        </button>
      </div>

      <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando decisiones...</div>
        ) : decisions.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No hay decisiones creadas.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>ETAPA</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>TÍTULO</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>OPCIONES</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map(d => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                    <span style={{ background: 'var(--bg-color)', padding: '4px 8px', borderRadius: 4, fontWeight: 600, fontSize: '0.8rem' }}>
                      {d.etapa}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>{d.titulo}</td>
                  <td style={{ padding: '16px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{d.options?.length || 0} opciones</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button onClick={() => handleEdit(d)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', marginRight: 16 }}>
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(d.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
