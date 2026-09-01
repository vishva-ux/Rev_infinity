'use client';
import Topbar from '@/components/Topbar';
import { useState } from 'react';

const NODES = [
  { id: 'cust1', label: 'Aarav Sharma', type: 'customer', x: 100, y: 150, amount: '₹9,999', status: 'recovered' },
  { id: 'cust2', label: 'Ananya Verma', type: 'customer', x: 100, y: 320, amount: '₹4,599', status: 'failed' },
  { id: 'cust3', label: 'Rohan Patel',  type: 'customer', x: 100, y: 490, amount: '₹14,999', status: 'failed' },
  { id: 'txn1',  label: 'TXN_92817', type: 'txn', x: 300, y: 100, amount: '₹9,999', status: 'recovered' },
  { id: 'txn2',  label: 'TXN_92816', type: 'txn', x: 300, y: 270, amount: '₹4,599', status: 'failed' },
  { id: 'txn3',  label: 'TXN_92815', type: 'txn', x: 300, y: 440, amount: '₹14,999', status: 'failed' },
  { id: 'pm1',   label: 'UPI — Bank XYZ', type: 'payment', x: 520, y: 100, amount: '', status: 'degraded' },
  { id: 'pm2',   label: 'Card — ICICI',   type: 'payment', x: 520, y: 270, amount: '', status: 'failed' },
  { id: 'pm3',   label: 'UPI — PhonePe',  type: 'payment', x: 520, y: 440, amount: '', status: 'failed' },
  { id: 'risk1', label: 'Risk Score: 92', type: 'risk', x: 740, y: 100, amount: '₹9,999 at risk', status: 'high' },
  { id: 'risk2', label: 'Risk Score: 78', type: 'risk', x: 740, y: 270, amount: '₹4,599 at risk', status: 'medium' },
  { id: 'risk3', label: 'Risk Score: 95', type: 'risk', x: 740, y: 440, amount: '₹14,999 at risk', status: 'high' },
  { id: 'act1',  label: 'Payment Link', type: 'action', x: 960, y: 100, amount: '✓ Executed', status: 'success' },
  { id: 'act2',  label: 'Retry Attempt', type: 'action', x: 960, y: 270, amount: 'In Progress', status: 'progress' },
  { id: 'act3',  label: 'Reminder Sent', type: 'action', x: 960, y: 440, amount: 'Pending', status: 'pending' },
  { id: 'out1',  label: '₹9,999 RECOVERED', type: 'outcome', x: 1160, y: 100, amount: '', status: 'success' },
];

const EDGES = [
  ['cust1', 'txn1'], ['cust2', 'txn2'], ['cust3', 'txn3'],
  ['txn1', 'pm1'], ['txn2', 'pm2'], ['txn3', 'pm3'],
  ['pm1', 'risk1'], ['pm2', 'risk2'], ['pm3', 'risk3'],
  ['risk1', 'act1'], ['risk2', 'act2'], ['risk3', 'act3'],
  ['act1', 'out1'],
];

const COLOR: Record<string, string> = {
  customer: '#0066ff', txn: '#8b5cf6', payment: '#f59e0b',
  risk: '#ef4444', action: '#10b981', outcome: '#10b981',
};

const STATUS_COLOR: Record<string, string> = {
  recovered: '#10b981', failed: '#ef4444', degraded: '#f59e0b',
  high: '#ef4444', medium: '#f59e0b', success: '#10b981',
  progress: '#0066ff', pending: '#94a3b8',
};

export default function UniversePage() {
  const [selected, setSelected] = useState<any>(null);
  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <>
      <Topbar title="Revenue Universe" subtitle="Real-time view of your revenue ecosystem" />
      <div className="card" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          {['customer','txn','payment','risk','action','outcome'].map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLOR[t] }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{t === 'txn' ? 'Transaction' : t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 260px' : '1fr', gap: 16 }}>
          <div style={{ overflowX: 'auto', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <svg width={1280} height={580} style={{ display: 'block' }}>
              {EDGES.map(([a, b]) => {
                const na = nodeMap[a], nb = nodeMap[b];
                if (!na || !nb) return null;
                const sx = na.x + 65, sy = na.y + 20;
                const tx = nb.x,      ty = nb.y + 20;
                const mx = (sx + tx) / 2;
                return (
                  <path key={`${a}-${b}`} d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                    stroke="var(--border)" strokeWidth={1.5} fill="none" strokeDasharray={na.status === 'recovered' && nb.status === 'success' ? 'none' : '4 3'} />
                );
              })}
              {NODES.map(n => {
                const sc = STATUS_COLOR[n.status] || '#64748b';
                const nc = COLOR[n.type] || '#64748b';
                return (
                  <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(n)}>
                    <rect x={n.x} y={n.y} width={130} height={40} rx={8}
                      fill="var(--bg-card)" stroke={selected?.id === n.id ? nc : 'var(--border)'}
                      strokeWidth={selected?.id === n.id ? 2 : 1} />
                    <circle cx={n.x + 10} cy={n.y + 20} r={5} fill={nc} />
                    <text x={n.x + 22} y={n.y + 15} fontSize={10} fill="var(--text-primary)" fontWeight={600}>{n.label}</text>
                    {n.amount && <text x={n.x + 22} y={n.y + 30} fontSize={9} fill={sc}>{n.amount}</text>}
                  </g>
                );
              })}
            </svg>
          </div>

          {selected && (
            <div className="card animate-in" style={{ alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{selected.label}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>×</button>
              </div>
              {[['Type', selected.type], ['Status', selected.status], ['Amount', selected.amount || '—']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: 8, borderRadius: 6 }}>
                Click any node to inspect details. Edges show revenue flow from customer checkout to outcome.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
