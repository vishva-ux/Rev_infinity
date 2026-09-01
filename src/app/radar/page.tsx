'use client';
import Topbar from '@/components/Topbar';
import { useState } from 'react';

const RISK_DATA = [
  { id: 'TXN_92817', customer: 'Aarav Sharma',  amount: 9999,  risk: 92, method: 'UPI',       bank: 'BANK_XYZ', reason: 'Payment Method Degradation', status: 'FAILED',    timeAgo: '3 min ago' },
  { id: 'TXN_92815', customer: 'Rohan Patel',   amount: 14999, risk: 95, method: 'UPI',       bank: 'BANK_XYZ', reason: 'Checkout Abandonment',        status: 'ABANDONED', timeAgo: '5 min ago' },
  { id: 'TXN_92816', customer: 'Ananya Verma',  amount: 4599,  risk: 78, method: 'CARD',      bank: 'ICICI',    reason: 'Bank Decline',                status: 'FAILED',    timeAgo: '8 min ago' },
  { id: 'TXN_92813', customer: 'Vikram Nair',   amount: 7499,  risk: 81, method: 'NETBANKING',bank: 'AXIS',     reason: 'Network Error',               status: 'FAILED',    timeAgo: '12 min ago' },
  { id: 'TXN_92814', customer: 'Priya Reddy',   amount: 2199,  risk: 65, method: 'NETBANKING',bank: 'SBI',      reason: 'Payment Timeout',             status: 'FAILED',    timeAgo: '21 min ago' },
  { id: 'TXN_10501', customer: 'Kabir Gupta',   amount: 24999, risk: 88, method: 'CARD',      bank: 'HDFC',     reason: 'Bank Decline',                status: 'FAILED',    timeAgo: '35 min ago' },
  { id: 'TXN_10489', customer: 'Sneha Singh',   amount: 1499,  risk: 55, method: 'WALLET',    bank: 'PAYTM',    reason: 'Checkout Abandonment',        status: 'ABANDONED', timeAgo: '1 hr ago' },
];

function RiskBar({ score }: { score: number }) {
  const c = score > 80 ? '#ef4444' : score > 60 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="risk-bar" style={{ width: 70 }}>
        <div className="risk-bar-fill" style={{ width: `${score}%`, background: c }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{score}</span>
    </div>
  );
}

export default function RadarPage() {
  const [filter, setFilter] = useState('ALL');
  const FILTERS = ['ALL', 'UPI', 'CARD', 'NETBANKING'];
  const filtered = filter === 'ALL' ? RISK_DATA : RISK_DATA.filter(r => r.method === filter);

  return (
    <>
      <Topbar title="Risk Radar" subtitle="Live revenue risk monitoring and triage" />
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 16 }}>
        {[
          { label: 'High Risk (>80)', count: RISK_DATA.filter(r => r.risk > 80).length, color: '#ef4444' },
          { label: 'Medium Risk (60-80)', count: RISK_DATA.filter(r => r.risk >= 60 && r.risk <= 80).length, color: '#f59e0b' },
          { label: 'Low Risk (<60)', count: RISK_DATA.filter(r => r.risk < 60).length, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '5px 12px', borderRadius: 5, border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: filter === f ? 'var(--brand)' : 'transparent', color: filter === f ? 'white' : 'var(--text-secondary)' }}>
              {f}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Transaction</th><th>Customer</th><th>Amount</th><th>Risk Score</th><th>Method</th><th>Bank</th><th>Root Cause</th><th>Time</th></tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600, color: 'var(--brand)', fontFamily: 'monospace', fontSize: 12 }}>{row.id}</td>
                  <td style={{ fontSize: 12 }}>{row.customer}</td>
                  <td style={{ fontWeight: 600 }}>₹{row.amount.toLocaleString('en-IN')}</td>
                  <td><RiskBar score={row.risk} /></td>
                  <td><span className="badge badge-info">{row.method}</span></td>
                  <td style={{ fontSize: 12 }}>{row.bank}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.reason}</td>
                  <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.timeAgo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
