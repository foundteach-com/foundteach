import { useState } from 'react';
import {
  Calculator, BarChart2, ArrowDownCircle, ArrowUpCircle,
  FileText, TrendingUp, Plus, ChevronDown, X, Folder
} from 'lucide-react';

interface Transaction { id: string; date: string; concept: string; amount: number; category: string; }
interface Invoice { id: string; number: string; client: string; amount: number; dueDate: string; status: 'PENDING' | 'PAID' | 'OVERDUE'; }

const fmtD = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
const fmtM = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const INV_S: Record<string, { l: string; c: string; b: string }> = {
  PENDING: { l: 'Pendiente', c: '#f59e0b', b: 'rgba(245,158,11,0.1)' },
  PAID:    { l: 'Pagada',    c: '#059669', b: 'rgba(5,150,105,0.1)' },
  OVERDUE: { l: 'Vencida',  c: '#ef4444', b: 'rgba(239,68,68,0.1)' },
};

function Badge({ v, m }: { v: string; m: Record<string, { l: string; c: string; b: string }> }) {
  const s = m[v] ?? { l: v, c: '#64748b', b: 'rgba(100,116,139,0.1)' };
  return <span style={{ fontSize: '0.71rem', fontWeight: 700, padding: '3px 9px', borderRadius: 20, color: s.c, background: s.b }}>{s.l}</span>;
}

function Kpi({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: React.ComponentType<{ size?: number }>; color: string }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 50, height: 50, borderRadius: 13, background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon size={22} /></div>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface-color)', borderRadius: 20, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 24px 48px rgba(0,0,0,0.15)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'var(--surface-hover)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SelField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <select value={value} onChange={e => onChange(e.target.value)} className="form-input" style={{ appearance: 'none', paddingRight: 32 }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)', display: 'flex' }}><ChevronDown size={14} /></span>
      </div>
    </div>
  );
}

function TableShell({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{headers.map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function OverviewTab({ ingresos, egresos, facturas }: { ingresos: Transaction[]; egresos: Transaction[]; facturas: Invoice[] }) {
  const totalIn  = ingresos.reduce((s, t) => s + t.amount, 0);
  const totalOut = egresos.reduce((s, t) => s + t.amount, 0);
  const saldo    = totalIn - totalOut;
  const pending  = facturas.filter(f => f.status === 'PENDING').length;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        <Kpi label="Ingresos (mes)" value={fmtM(totalIn)}  sub="Cobros recibidos"    icon={ArrowDownCircle} color="#10b981" />
        <Kpi label="Egresos (mes)"  value={fmtM(totalOut)} sub="Gastos registrados"  icon={ArrowUpCircle}   color="#ef4444" />
        <Kpi label="Saldo Neto"     value={fmtM(saldo)}    sub="Ingresos vs Egresos" icon={TrendingUp}      color="#3b82f6" />
        <Kpi label="Facturas Pend." value={pending}        sub="Por cobrar/pagar"    icon={FileText}        color="#f59e0b" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Últimos Ingresos</h3>
          {ingresos.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
              <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.concept}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.category}</div></div>
              <span style={{ fontWeight: 700, color: '#10b981' }}>{fmtM(t.amount)}</span>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', padding: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16 }}>Últimos Egresos</h3>
          {egresos.slice(0, 5).map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-color)' }}>
              <div><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.concept}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.category}</div></div>
              <span style={{ fontWeight: 700, color: '#ef4444' }}>{fmtM(t.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TransactionTab({ title, items, setItems, color, categories }: { title: string; items: Transaction[]; setItems: React.Dispatch<React.SetStateAction<Transaction[]>>; color: string; categories: string[] }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ concept: '', amount: '', category: categories[0], date: new Date().toISOString().split('T')[0] });
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setItems([{ id: Date.now().toString(), concept: form.concept, amount: parseFloat(form.amount), category: form.category, date: form.date }, ...items]);
    setModal(false);
    setForm({ concept: '', amount: '', category: categories[0], date: new Date().toISOString().split('T')[0] });
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{items.length} registro{items.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          <Plus size={14} /> Registrar {title}
        </button>
      </div>
      <TableShell headers={['Fecha', 'Concepto', 'Categoría', 'Monto']}>
        {items.map(t => (
          <tr key={t.id}>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)' }}>{fmtD(t.date)}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{t.concept}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{t.category}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color }}>{fmtM(t.amount)}</td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title={`Registrar ${title}`} onClose={() => setModal(false)}>
          <form onSubmit={add}>
            <div className="form-group"><label className="form-label">Concepto</label><input className="form-input" required value={form.concept} onChange={e => setForm({ ...form, concept: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Monto (COP)</label><input className="form-input" type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <SelField label="Categoría" value={form.category} onChange={v => setForm({ ...form, category: v })} options={categories} />
            <div className="form-group"><label className="form-label">Fecha</label><input className="form-input" type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Guardar</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function FacturasTab({ facturas, setFacturas }: { facturas: Invoice[]; setFacturas: React.Dispatch<React.SetStateAction<Invoice[]>> }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ number: '', client: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setFacturas([{ id: Date.now().toString(), number: form.number, client: form.client, amount: parseFloat(form.amount), dueDate: form.dueDate, status: 'PENDING' }, ...facturas]);
    setModal(false);
    setForm({ number: '', client: '', amount: '', dueDate: new Date().toISOString().split('T')[0] });
  };
  const cycleStatus = (id: string) => {
    const cycle: Invoice['status'][] = ['PENDING', 'PAID', 'OVERDUE'];
    setFacturas(facturas.map(f => f.id === id ? { ...f, status: cycle[(cycle.indexOf(f.status) + 1) % 3] } : f));
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>{facturas.length} factura{facturas.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--primary-color)', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
          <Plus size={14} /> Nueva Factura
        </button>
      </div>
      <TableShell headers={['# Factura', 'Cliente', 'Vencimiento', 'Monto', 'Estado']}>
        {facturas.map(f => (
          <tr key={f.id}>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--primary-color)' }}>{f.number}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{f.client}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{fmtD(f.dueDate)}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>{fmtM(f.amount)}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)' }}>
              <button onClick={() => cycleStatus(f.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Badge v={f.status} m={INV_S} />
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      {modal && (
        <Modal title="Nueva Factura" onClose={() => setModal(false)}>
          <form onSubmit={add}>
            <div className="form-group"><label className="form-label">N° Factura</label><input className="form-input" required value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="FT-001" /></div>
            <div className="form-group"><label className="form-label">Cliente</label><input className="form-input" required value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Monto (COP)</label><input className="form-input" type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Fecha de Vencimiento</label><input className="form-input" type="date" required value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
            <button type="submit" style={{ width: '100%', padding: '10px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>Guardar Factura</button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function FlujoCajaTab({ ingresos, egresos }: { ingresos: Transaction[]; egresos: Transaction[] }) {
  const months: Record<string, { in: number; out: number }> = {};
  [...ingresos, ...egresos].forEach(t => {
    const m = t.date.substring(0, 7);
    if (!months[m]) months[m] = { in: 0, out: 0 };
  });
  ingresos.forEach(t => { const m = t.date.substring(0, 7); if (months[m]) months[m].in += t.amount; });
  egresos.forEach(t => { const m = t.date.substring(0, 7); if (months[m]) months[m].out += t.amount; });
  const rows = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  return (
    <TableShell headers={['Mes', 'Ingresos', 'Egresos', 'Saldo Neto']}>
      {rows.map(([month, data]) => {
        const saldo = data.in - data.out;
        return (
          <tr key={month}>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{new Date(month + '-01').toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: '#10b981' }}>{fmtM(data.in)}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: '#ef4444' }}>{fmtM(data.out)}</td>
            <td style={{ padding: '13px 14px', fontSize: '0.875rem', borderBottom: '1px solid var(--border-color)', fontWeight: 800, color: saldo >= 0 ? '#10b981' : '#ef4444' }}>{fmtM(saldo)}</td>
          </tr>
        );
      })}
    </TableShell>
  );
}

function DocumentosTab() {
  return (
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '2px dashed var(--border-color)', padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
      <Folder size={32} style={{ margin: '0 auto', opacity: 0.5 }} />
      <p style={{ marginTop: 12, fontSize: '0.9rem' }}>Repositorio de documentos próximamente.</p>
    </div>
  );
}

const TABS = [
  { id: 'overview',  label: 'Resumen',       icon: BarChart2 },
  { id: 'ingresos',  label: 'Ingresos',      icon: ArrowDownCircle },
  { id: 'egresos',   label: 'Egresos',       icon: ArrowUpCircle },
  { id: 'facturas',  label: 'Facturas',      icon: FileText },
  { id: 'flujo',     label: 'Flujo de Caja', icon: TrendingUp },
  { id: 'docs',      label: 'Documentos',    icon: Folder },
];

const IN_CATS = ['Suscripción', 'Licencia', 'Curso', 'Consultoría', 'Otro'];
const OUT_CATS = ['Nómina', 'Software', 'Marketing', 'Servicios', 'Impuestos', 'Otro'];

export function AccountantPage() {
  const [tab, setTab] = useState('overview');
  const [ingresos, setIngresos] = useState<Transaction[]>([
    { id: '1', date: '2026-04-15', concept: 'Suscripción Plan Pro — Colegio San Marcos', amount: 2500000, category: 'Suscripción' },
    { id: '2', date: '2026-04-18', concept: 'Licencia Anual — Universidad Nacional', amount: 8000000, category: 'Licencia' },
  ]);
  const [egresos, setEgresos] = useState<Transaction[]>([
    { id: '1', date: '2026-04-01', concept: 'Nómina Abril', amount: 4500000, category: 'Nómina' },
    { id: '2', date: '2026-04-10', concept: 'Railway — Hosting Plataformas', amount: 150000, category: 'Software' },
  ]);
  const [facturas, setFacturas] = useState<Invoice[]>([
    { id: '1', number: 'FT-001', client: 'Colegio San Marcos', amount: 2500000, dueDate: '2026-05-01', status: 'PENDING' },
    { id: '2', number: 'FT-002', client: 'Universidad Nacional', amount: 8000000, dueDate: '2026-04-20', status: 'PAID' },
  ]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
          <Calculator size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 2 }}>Área Contable</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ingresos, egresos, facturas y flujo de caja</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface-color)', borderRadius: 12, padding: 5, border: '1px solid var(--border-color)', width: 'fit-content', overflowX: 'auto' }}>
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 8, fontSize: '0.855rem', fontWeight: 600, background: active ? 'white' : 'transparent', color: active ? 'var(--primary-color)' : 'var(--text-muted)', boxShadow: active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', border: active ? '1px solid var(--border-color)' : '1px solid transparent', transition: 'all 0.15s', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Icon size={15} />{t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && <OverviewTab ingresos={ingresos} egresos={egresos} facturas={facturas} />}
      {tab === 'ingresos' && <TransactionTab title="Ingreso" items={ingresos} setItems={setIngresos} color="#10b981" categories={IN_CATS} />}
      {tab === 'egresos'  && <TransactionTab title="Egreso"  items={egresos}  setItems={setEgresos}  color="#ef4444" categories={OUT_CATS} />}
      {tab === 'facturas' && <FacturasTab facturas={facturas} setFacturas={setFacturas} />}
      {tab === 'flujo'    && <FlujoCajaTab ingresos={ingresos} egresos={egresos} />}
      {tab === 'docs'     && <DocumentosTab />}
    </div>
  );
}
