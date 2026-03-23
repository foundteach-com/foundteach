import { useState, useEffect, useCallback } from 'react';
import { X, Wallet } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.foundteach.com';
const BASE = `${API_URL}/api/api/hcm`;

interface Employee { id: string; firstName: string; lastName: string; position?: string; }
interface Payroll {
  id: string; employeeId: string; period: string; baseSalary: number;
  bonuses: number; deductions: number; netPay: number; currency: string;
  status: string; paidAt?: string; notes?: string;
  employee?: { firstName: string; lastName: string; position: string };
}
const SC: Record<string, string> = { PENDING: '#f59e0b', PAID: '#10b981', CANCELLED: '#ef4444' };
const SL: Record<string, string> = { PENDING: 'Pendiente', PAID: 'Pagado', CANCELLED: 'Cancelado' };
const fmt = (n: number) => `$${Number(n).toLocaleString('es-CO')}`;
const token = () => localStorage.getItem('foundteach_token') ?? '';

export function NominaPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterEmp, setFilterEmp] = useState('');
  const [form, setForm] = useState({ employeeId: '', period: '', baseSalary: '', bonuses: '0', deductions: '0', currency: 'COP', notes: '' });

  const calcNet = (f: typeof form) => (Number(f.baseSalary) + Number(f.bonuses) - Number(f.deductions)).toFixed(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterEmp ? `${BASE}/payrolls?employeeId=${filterEmp}` : `${BASE}/payrolls`;
      const [pRes, eRes] = await Promise.all([
        fetch(url, { headers: { Authorization: `Bearer ${token()}` } }),
        fetch(`${BASE}/employees?onlyActive=true`, { headers: { Authorization: `Bearer ${token()}` } }),
      ]);
      if (pRes.ok) setPayrolls(await pRes.json());
      if (eRes.ok) setEmployees(await eRes.json());
    } finally { setLoading(false); }
  }, [filterEmp]);

  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    const body = { ...form, baseSalary: Number(form.baseSalary), bonuses: Number(form.bonuses), deductions: Number(form.deductions), netPay: Number(calcNet(form)) };
    await fetch(`${BASE}/payrolls`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) });
    setShowModal(false); void load();
  };

  const markPaid = async (id: string) => {
    await fetch(`${BASE}/payrolls/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify({ status: 'PAID', paidAt: new Date().toISOString() }) });
    void load();
  };

  const totalPending = payrolls.filter(p => p.status === 'PENDING').reduce((s, p) => s + Number(p.netPay), 0);
  const totalPaid = payrolls.filter(p => p.status === 'PAID').reduce((s, p) => s + Number(p.netPay), 0);

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, background: 'linear-gradient(135deg,#818cf8,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Nómina & Honorarios</h1>
          <p style={{ color: '#94a3b8', marginTop: '4px', fontSize: '0.9rem' }}>Registro de pagos por período</p>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>+ Registrar Pago</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total registros', value: String(payrolls.length), color: '#818cf8' },
          { label: 'Por pagar', value: fmt(totalPending), color: '#f59e0b' },
          { label: 'Pagado', value: fmt(totalPaid), color: '#10b981' },
          { label: 'Pendientes', value: String(payrolls.filter(p => p.status === 'PENDING').length), color: '#f97316' },
        ].map(k => (
          <div key={k.label} style={{ background: '#1e293b', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '14px' }}>
        <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.85rem' }}>
          <option value=''>Todos los colaboradores</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
      </div>
      <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Cargando nómina...</div>
          : payrolls.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '60px' }}>
              <Wallet size={48} style={{ opacity: 0.3, marginBottom: '12px' }} /><p>No hay registros de nómina.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead><tr style={{ background: '#0f172a', color: '#64748b' }}>
                {['Colaborador', 'Período', 'Base', 'Bonos', 'Deducciones', 'Neto', 'Estado', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {payrolls.map((p, i) => (
                  <tr key={p.id} style={{ borderTop: '1px solid #334155', background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                      {p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : p.employeeId}
                      {p.employee?.position && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.employee.position}</div>}
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#94a3b8' }}>{p.period}</td>
                    <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{fmt(p.baseSalary)}</td>
                    <td style={{ padding: '10px 14px', color: '#10b981' }}>{fmt(p.bonuses)}</td>
                    <td style={{ padding: '10px 14px', color: '#ef4444' }}>{fmt(p.deductions)}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700 }}>{fmt(p.netPay)}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, background: SC[p.status] + '22', color: SC[p.status] }}>{SL[p.status]}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {p.status === 'PENDING' && (
                        <button onClick={() => void markPaid(p.id)} style={{ background: '#10b98122', border: '1px solid #10b98144', color: '#10b981', cursor: 'pointer', borderRadius: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 600 }}>✓ Pagar</button>
                      )}
                      {p.paidAt && <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{new Date(p.paidAt).toLocaleDateString('es-CO')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', border: '1px solid #334155', padding: '28px', width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontWeight: 700 }}>Registrar Pago</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Colaborador *</span>
                <select value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }}>
                  <option value=''>Seleccionar</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8' }}>Período * (ej: 2026-03)</span>
                <input value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} placeholder='2026-03' style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#e2e8f0', fontSize: '0.875rem' }} />
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[{ label: 'Salario base', key: 'baseSalary' }, { label: 'Bonos', key: 'bonuses' }, { label: 'Deducciones', key: 'deductions' }].map(f => (
                  <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                    <span style={{ color: '#94a3b8' }}>{f.label}</span>
                    <input type='number' value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 10px', color: '#e2e8f0', fontSize: '0.875rem' }} />
                  </label>
                ))}
              </div>
              <div style={{ background: '#0f172a', borderRadius: '8px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Neto a pagar</span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>{fmt(Number(calcNet(form)))}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#334155', border: 'none', color: '#e2e8f0', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => void save()} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
