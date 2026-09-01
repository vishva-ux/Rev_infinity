'use client';
import Topbar from '@/components/Topbar';
import { useEffect, useState } from 'react';

const MOCK_INTERVENTIONS = [
  { id: 'TXN_92817', cust: 'CUST_12981', amount: 9999,  strategy: 'SMART_RECOVERY', predicted: 9199,  actual: 9999,  policy: 'APPROVED', status: 'SUCCESS',   ts: '15:42' },
  { id: 'TXN_92816', cust: 'CUST_68211', amount: 4599,  strategy: 'PAYMENT_LINK',   predicted: 3450,  actual: null,  policy: 'APPROVED', status: 'IN_PROGRESS',ts: '15:41' },
  { id: 'TXN_92814', cust: 'CUST_44219', amount: 2199,  strategy: 'RETRY',          predicted: 800,   actual: null,  policy: 'BLOCKED',  status: 'BLOCKED',   ts: '15:40' },
  { id: 'TXN_92813', cust: 'CUST_11871', amount: 7499,  strategy: 'REMINDER',       predicted: 4649,  actual: null,  policy: 'APPROVED', status: 'IN_PROGRESS',ts: '15:39' },
  { id: 'TXN_10501', cust: 'CUST_30011', amount: 24999, strategy: 'PAYMENT_LINK',   predicted: 18750, actual: null,  policy: 'REQUIRES_APPROVAL', status: 'PENDING', ts: '15:35' },
  { id: 'TXN_10489', cust: 'CUST_22107', amount: 1499,  strategy: 'SMART_RECOVERY', predicted: 1379,  actual: 1499,  policy: 'APPROVED', status: 'SUCCESS',   ts: '15:20' },
];

const STATUS_BADGE: Record<string, string> = {
  SUCCESS: 'badge-success', BLOCKED: 'badge-blocked', IN_PROGRESS: 'badge-purple',
  PENDING: 'badge-warning', FAILED: 'badge-danger',
};

const POLICY_BADGE: Record<string, string> = {
  APPROVED: 'badge-success', BLOCKED: 'badge-blocked', REQUIRES_APPROVAL: 'badge-warning',
};

export default function InterventionsPage() {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'SUCCESS', 'IN_PROGRESS', 'BLOCKED', 'PENDING'];
  const data = filter === 'ALL' ? MOCK_INTERVENTIONS : MOCK_INTERVENTIONS.filter(r => r.status === filter);

  return (
    <>
      <Topbar title="Interventions" subtitle="All recovery actions and their outcomes" />
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Total Interventions', val: 532, color: 'var(--brand)' },
            { label: 'Successful', val: 276, color: '#10b981' },
            { label: 'In Progress', val: 96, color: '#8b5cf6' },
            { label: 'Policy Blocked', val: 37, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: filter === f ? 'var(--brand)' : 'transparent', color: filter === f ? 'white' : 'var(--text-secondary)' }}>
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Transaction</th><th>Customer</th><th>Amount</th><th>Strategy</th>
                  <th>Predicted Recovery</th><th>Actual Recovery</th><th>Policy</th><th>Status</th><th>Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--brand)', fontFamily: 'monospace', fontSize: 12 }}>{r.id}</td>
                    <td style={{ fontSize: 12 }}>{r.cust}</td>
                    <td style={{ fontWeight: 600 }}>₹{r.amount.toLocaleString('en-IN')}</td>
                    <td><span className="badge badge-info">{r.strategy.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontSize: 12 }}>₹{r.predicted.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 12, fontWeight: 600, color: r.actual ? '#10b981' : 'var(--text-muted)' }}>
                      {r.actual ? `₹${r.actual.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td><span className={`badge ${POLICY_BADGE[r.policy] || 'badge-info'}`}>{r.policy.replace('_', ' ')}</span></td>
                    <td><span className={`badge ${STATUS_BADGE[r.status] || 'badge-info'}`}>{r.status.replace('_', ' ')}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.ts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
