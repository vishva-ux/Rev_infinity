'use client';
import Topbar from '@/components/Topbar';
import { useState } from 'react';
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';
import { CheckCircle } from 'lucide-react';

const TXNS = [
  { id: 'TXN_92817', amount: 9999,  risk: 92, label: 'UPI Failure — Bank XYZ' },
  { id: 'TXN_92816', amount: 4599,  risk: 78, label: 'Card Decline — ICICI' },
  { id: 'TXN_92815', amount: 14999, risk: 95, label: 'Checkout Abandonment' },
  { id: 'TXN_92814', amount: 2199,  risk: 65, label: 'Payment Timeout (retry blocked)' },
];

const STRATS = [
  { key: 'DO_NOTHING',      name: 'Do Nothing',      mult: 0.08, conf: 8,  cost: 0,  friction: 'Low',    risk: 'Very High', color: '#94a3b8' },
  { key: 'RETRY',           name: 'Retry Strategy',  mult: 0.40, conf: 35, cost: 45, friction: 'Medium', risk: 'Medium',    color: '#f59e0b' },
  { key: 'PAYMENT_LINK',    name: 'Payment Link',    mult: 0.75, conf: 72, cost: 0,  friction: 'Low',    risk: 'Low',       color: '#0066ff' },
  { key: 'REMINDER',        name: 'Smart Reminder',  mult: 0.62, conf: 65, cost: 12, friction: 'Low',    risk: 'Low',       color: '#8b5cf6' },
  { key: 'ALTERNATE_METHOD',name: 'Alternate Payment',mult: 0.68, conf: 68, cost: 0, friction: 'Medium', risk: 'Low',       color: '#06b6d4' },
  { key: 'SMART_RECOVERY',  name: 'Smart Recovery',  mult: 0.92, conf: 85, cost: 18, friction: 'Low',    risk: 'Very Low',  color: '#10b981', rec: true },
  { key: 'AGGRESSIVE',      name: 'Aggressive Rec.', mult: 0.72, conf: 61, cost: 85, friction: 'High',   risk: 'Medium',    color: '#ef4444' },
];

export default function SimulatorPage() {
  const [txnId, setTxnId] = useState('TXN_92817');
  const [selected, setSelected] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const txn = TXNS.find(t => t.id === txnId)!;

  const scenarios = STRATS.map(s => {
    // blocked if retry and TXN_92814
    const blocked = s.key === 'RETRY' && txnId === 'TXN_92814';
    const expectedRecovery = blocked ? Math.round(txn.amount * 0.05) : Math.round(txn.amount * s.mult);
    const netImpact = expectedRecovery - s.cost - Math.round(txn.amount * (blocked ? 0.4 : 0.05));
    return { ...s, expectedRecovery, netImpact, blocked };
  });

  const recStrat = scenarios.find(s => s.rec);
  const chartData = scenarios.map(s => ({ name: s.name.split(' ')[0], val: s.expectedRecovery / 1000 }));

  const execute = async () => {
    const strat = selected || 'SMART_RECOVERY';
    setExecuting(true);
    const res = await fetch('/api/recovery/execute', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: txnId, strategy: strat })
    });
    const data = await res.json();
    setResult(data);
    setExecuting(false);
  };

  return (
    <>
      <Topbar title="Future Simulator" subtitle="Simulate recovery strategies before executing them" />
      <div style={{ marginTop: 8 }}>
        {/* Transaction Selector */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Select Transaction:</span>
            {TXNS.map(t => (
              <button key={t.id} onClick={() => { setTxnId(t.id); setSelected(null); setResult(null); }}
                style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: txnId === t.id ? 'var(--brand)' : 'transparent', color: txnId === t.id ? 'white' : 'var(--text-secondary)' }}>
                {t.id} · ₹{t.amount.toLocaleString('en-IN')} · Risk {t.risk}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
          {[
            { label: 'Transaction Amount', val: `₹${txn.amount.toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
            { label: 'Risk Score', val: `${txn.risk}/100`, color: '#ef4444' },
            { label: 'Recommended Recovery', val: `₹${Math.round(txn.amount * 0.92).toLocaleString('en-IN')}`, color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Scenario Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10, marginBottom: 16 }}>
          {scenarios.map(s => (
            <div key={s.key} className={`sim-card ${s.rec ? 'recommended' : ''} ${selected === s.key ? 'recommended' : ''} ${s.blocked ? 'opacity-50' : ''}`}
              style={{ opacity: s.blocked ? 0.5 : 1 }}
              onClick={() => !s.blocked && setSelected(s.key)}>
              {s.rec && <div className="rec-tag">RECOMMENDED</div>}
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: s.rec ? 8 : 0, fontWeight: 600 }}>{s.name}</div>
              {s.blocked && <div style={{ fontSize: 10, color: '#ef4444', marginTop: 4 }}>⛔ POLICY BLOCKED</div>}
              <div style={{ fontSize: 18, fontWeight: 700, color: s.blocked ? '#94a3b8' : s.color, margin: '8px 0 4px' }}>
                ₹{(s.expectedRecovery / 1000).toFixed(1)}K
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>Expected</div>
              <div className="risk-bar" style={{ marginTop: 6 }}>
                <div className="risk-bar-fill" style={{ width: `${s.conf}%`, background: s.color }} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3 }}>{s.conf}% Confidence</div>
              <div style={{ marginTop: 6, fontSize: 9 }}>
                <div style={{ color: 'var(--text-muted)' }}>Cost: ₹{s.cost}</div>
                <div style={{ color: 'var(--text-muted)' }}>Friction: {s.friction}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Expected Recovery Comparison</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => `₹${(v * 1000).toLocaleString('en-IN')}`}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="val" fill="var(--brand)" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fontSize: 9, fill: 'var(--text-muted)', formatter: (v: any) => `₹${v}K` }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Execute Strategy</div>
            {recStrat && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Recommended</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{recStrat.name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981' }}>
                  ₹{recStrat.expectedRecovery.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{recStrat.conf}% confidence</div>
              </div>
            )}
            {selected && selected !== recStrat?.key && (
              <div style={{ marginBottom: 12, padding: 10, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Selected: {selected.replace(/_/g, ' ')}</div>
              </div>
            )}
            <button className="btn-primary" style={{ width: '100%' }} disabled={executing} onClick={execute}>
              {executing ? 'Executing via Razorpay…' : 'Execute Strategy →'}
            </button>
            {result && (
              <div className="animate-in" style={{ marginTop: 12, padding: 10, background: result.policyCheck?.status === 'APPROVED' ? '#d1fae5' : '#fee2e2', borderRadius: 8 }}>
                {result.policyCheck?.status === 'APPROVED' ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <CheckCircle size={14} color="#10b981" />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46' }}>Recovery Executed!</div>
                      <div style={{ fontSize: 11, color: '#065f46' }}>₹{result.decision?.amount?.toLocaleString('en-IN')} via Razorpay TEST MODE</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b' }}>🚫 POLICY BLOCKED</div>
                    <div style={{ fontSize: 11, color: '#991b1b', marginTop: 4 }}>{result.policyCheck?.rationale}</div>
                  </div>
                )}
              </div>
            )}
            <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-muted)', padding: 8, background: 'var(--bg)', borderRadius: 6 }}>
              ⚠️ All projections are simulated estimates. Mark: PROJECTED
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
