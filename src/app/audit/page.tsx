'use client';
import Topbar from '@/components/Topbar';
import { useEffect, useState } from 'react';

const MOCK = [
  { id: 'AUDIT_01', decisionId: 'REC_10482', transactionId: 'TXN_92817', timestamp: '15:42:06', eventType: 'RECOVERY_EXECUTED',   actor: 'RAZORPAY_EXECUTOR', details: 'Payment Link Created via Razorpay TEST MODE. Amount: ₹9,999. Link: pl_L92817' },
  { id: 'AUDIT_02', decisionId: 'REC_10481', transactionId: 'TXN_92814', timestamp: '15:40:11', eventType: 'POLICY_BLOCKED',      actor: 'FINANCIAL_GUARDIAN', details: 'BLOCKED: Maximum retry limit reached (2/2). Escalating to manual review.' },
  { id: 'AUDIT_03', decisionId: 'REC_10480', transactionId: 'TXN_92813', timestamp: '15:39:44', eventType: 'POLICY_APPROVED',     actor: 'FINANCIAL_GUARDIAN', details: 'APPROVED: Action complies with all financial, retry, and contact frequency policies.' },
  { id: 'AUDIT_04', decisionId: 'REC_10479', transactionId: 'TXN_92816', timestamp: '15:38:20', eventType: 'WEBHOOK_CAPTURED',    actor: 'OUTCOME_OBSERVER',  details: 'payment_link.paid received. Signature verified. ₹9,999 marked recovered.' },
  { id: 'AUDIT_05', decisionId: 'REC_10478', transactionId: 'TXN_92815', timestamp: '15:35:01', eventType: 'SIMULATION_COMPLETE', actor: 'FUTURE_SIMULATOR',  details: 'Simulated 7 strategies. Smart Recovery: ₹13,799 (85%). Payment Link: ₹11,249 (72%).' },
];

const EVENT_BADGE: Record<string, string> = {
  RECOVERY_EXECUTED:   'badge-success',
  POLICY_BLOCKED:      'badge-blocked',
  POLICY_APPROVED:     'badge-success',
  WEBHOOK_CAPTURED:    'badge-info',
  SIMULATION_COMPLETE: 'badge-purple',
};

export default function AuditPage() {
  const [logs, setLogs] = useState(MOCK);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    fetch('/api/audit').then(r => r.json()).then(data => {
      if (data.data?.length > 0) setLogs([...data.data.slice(0, 10), ...MOCK]);
    }).catch(() => {});
  }, []);

  return (
    <>
      <Topbar title="Audit Ledger" subtitle="Immutable record of every AI financial decision" />
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Decision Audit Trail</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Every financial AI action has an immutable audit record</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Decision ID</th><th>Transaction</th><th>Time</th><th>Event Type</th><th>Actor</th><th>Summary</th></tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id + i} onClick={() => setSelected(log)} style={{ cursor: 'pointer' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--brand)' }}>{log.decisionId}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{log.transactionId}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.timestamp}</td>
                    <td><span className={`badge ${EVENT_BADGE[log.eventType] || 'badge-info'}`} style={{ fontSize: 10 }}>{log.eventType}</span></td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.actor}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-secondary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="card animate-in" style={{ alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ fontWeight: 700 }}>Audit Record</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
            </div>
            {[
              ['Decision ID', selected.decisionId],
              ['Transaction', selected.transactionId],
              ['Timestamp', selected.timestamp],
              ['Event Type', selected.eventType],
              ['Actor', selected.actor],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--text-muted)' }}>{k as string}</span>
                <span style={{ fontWeight: 600 }}>{v as string}</span>
              </div>
            ))}
            <div style={{ marginTop: 12, padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {selected.details}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
