'use client';
import Topbar from '@/components/Topbar';

const CUSTOMERS = [
  { id: 'CUST_12981', name: 'Aarav Sharma', ltv: 142000, successRate: '94%', failureCount: 2, recProb: 87, bestTime: '8 PM – 10 PM', preferredMethod: 'UPI', responseRates: { 'Payment Link': 79, Reminder: 61, Retry: 34, Alternate: 65 }, status: 'High Value' },
  { id: 'CUST_68211', name: 'Ananya Verma', ltv: 67000,  successRate: '88%', failureCount: 4, recProb: 72, bestTime: '2 PM – 4 PM', preferredMethod: 'CARD', responseRates: { 'Payment Link': 72, Reminder: 55, Retry: 28, Alternate: 60 }, status: 'Active' },
  { id: 'CUST_77521', name: 'Rohan Patel',  ltv: 91000,  successRate: '91%', failureCount: 1, recProb: 81, bestTime: '8 PM – 10 PM', preferredMethod: 'UPI', responseRates: { 'Payment Link': 84, Reminder: 67, Retry: 41, Alternate: 72 }, status: 'High Value' },
  { id: 'CUST_44219', name: 'Priya Reddy',  ltv: 28000,  successRate: '79%', failureCount: 6, recProb: 58, bestTime: '6 PM – 8 PM', preferredMethod: 'NETBANKING', responseRates: { 'Payment Link': 58, Reminder: 48, Retry: 22, Alternate: 45 }, status: 'At Risk' },
];

export default function CustomerDNAPage() {
  return (
    <>
      <Topbar title="Customer DNA" subtitle="Revenue behavioral profiles and recovery intelligence" />
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
        {CUSTOMERS.map(c => (
          <div key={c.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>{c.id}</div>
              </div>
              <span className={`badge ${c.status === 'High Value' ? 'badge-success' : c.status === 'At Risk' ? 'badge-danger' : 'badge-info'}`}>
                {c.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Lifetime Value', val: `₹${(c.ltv/1000).toFixed(0)}K`, color: '#0066ff' },
                { label: 'Success Rate', val: c.successRate, color: '#10b981' },
                { label: 'Recovery Prob.', val: `${c.recProb}%`, color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg)', borderRadius: 6 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Recovery Response Rates</div>
              {Object.entries(c.responseRates).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontSize: 11, width: 90, color: 'var(--text-secondary)' }}>{k}</div>
                  <div className="risk-bar" style={{ flex: 1 }}>
                    <div className="risk-bar-fill" style={{ width: `${v}%`, background: v > 70 ? '#10b981' : v > 50 ? '#0066ff' : '#f59e0b' }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, width: 32, textAlign: 'right' }}>{v}%</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, fontSize: 11 }}>
              <div style={{ flex: 1, padding: 8, background: 'var(--bg)', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-muted)' }}>Preferred Method</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{c.preferredMethod}</div>
              </div>
              <div style={{ flex: 1, padding: 8, background: 'var(--bg)', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-muted)' }}>Best Contact Window</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{c.bestTime}</div>
              </div>
              <div style={{ flex: 1, padding: 8, background: 'var(--bg)', borderRadius: 6 }}>
                <div style={{ color: 'var(--text-muted)' }}>Failure Count</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{c.failureCount} events</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
