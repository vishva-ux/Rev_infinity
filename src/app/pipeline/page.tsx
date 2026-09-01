'use client';
import Topbar from '@/components/Topbar';
import { useState } from 'react';

const STAGES = [
  { key: 'DETECT',       label: 'Detect',        color: '#0066ff', status: 'done',     detail: 'Risk Score: 92/100 · Revenue at Risk: ₹9,999 · Cause: Payment Method Degradation' },
  { key: 'DIAGNOSE',     label: 'Diagnose',       color: '#8b5cf6', status: 'done',     detail: 'Root Cause: Bank XYZ UPI API latency > 4200ms · Affected: 413 transactions' },
  { key: 'PREDICT',      label: 'Predict',        color: '#06b6d4', status: 'done',     detail: 'Recovery Probability: 85% · Expected Recovery: ₹9,199 · Model: Logistic Regression' },
  { key: 'SIMULATE',     label: 'Simulate',       color: '#f59e0b', status: 'done',     detail: 'Simulated 7 strategies · Smart Recovery: ₹9,199 (85%) · Payment Link: ₹7,499 (72%)' },
  { key: 'DECIDE',       label: 'Decide',         color: '#f97316', status: 'done',     detail: 'Selected: SMART_RECOVERY · Net Value Score: 94 · Red Team: Approved' },
  { key: 'POLICY_CHECK', label: 'Policy Check',   color: '#10b981', status: 'done',     detail: 'Policy Guardian: APPROVED · Amount: ₹9,999 ≤ ₹10,000 threshold · Retries: 1/2' },
  { key: 'EXECUTE',      label: 'Execute',        color: '#10b981', status: 'done',     detail: 'Razorpay TEST MODE: Payment Link Created · pl_L92817 · https://rzp.io/i/pl_L92817' },
  { key: 'OBSERVE',      label: 'Observe',        color: '#10b981', status: 'done',     detail: 'Webhook: payment_link.paid · Signature: ✓ Verified · Idempotency: ✓ Checked' },
  { key: 'RECOVER',      label: 'Recover',        color: '#10b981', status: 'done',     detail: 'Payment Captured · ₹9,999 received · Transaction marked RECOVERED' },
  { key: 'MEASURE',      label: 'Measure',        color: '#10b981', status: 'done',     detail: 'Predicted: ₹9,199 · Actual: ₹9,999 · Prediction Error: +8.7% (within acceptable range)' },
  { key: 'LEARN',        label: 'Learn',          color: '#10b981', status: 'done',     detail: 'Customer DNA Updated · Smart Recovery weight increased · Model feedback recorded' },
];

const FAILURE_STAGES = [
  { key: 'DETECT',       label: 'Detect',        color: '#0066ff', status: 'done',   detail: 'TXN_92814 · Risk Score: 65 · Amount: ₹2,199 · Status: FAILED' },
  { key: 'DIAGNOSE',     label: 'Diagnose',       color: '#8b5cf6', status: 'done',   detail: 'Root Cause: Payment Timeout · Retries so far: 2/2' },
  { key: 'PREDICT',      label: 'Predict',        color: '#06b6d4', status: 'done',   detail: 'AI proposes: RETRY strategy · Expected Recovery: ₹800' },
  { key: 'POLICY_CHECK', label: 'Policy Check',   color: '#ef4444', status: 'blocked',detail: 'BLOCKED: MAX_RETRIES_EXCEEDED · Rule: Max 2 retries reached (2/2) · Next: Escalate' },
  { key: 'ESCALATE',     label: 'Escalate',       color: '#f59e0b', status: 'escalated',detail: 'Escalated to Manual Review · Agent: FINANCIAL_GUARDIAN · Reason: Policy Block' },
];

export default function PipelinePage() {
  const [active, setActive] = useState<string | null>(null);
  const [demo, setDemo] = useState<'SUCCESS' | 'FAILURE'>('SUCCESS');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const stages = demo === 'SUCCESS' ? STAGES : FAILURE_STAGES;

  const triggerDemo = async () => {
    setRunning(true);
    const scenario = demo === 'SUCCESS' ? 'SCENARIO_1' : 'SCENARIO_2';
    await fetch('/api/demo/trigger', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenario }) });
    setRunning(false);
    setRan(true);
  };

  const stageColor = (s: any) => s.status === 'done' ? s.color : s.status === 'blocked' ? '#ef4444' : s.status === 'escalated' ? '#f59e0b' : 'var(--text-muted)';

  return (
    <>
      <Topbar title="Recovery Engine" subtitle="Live 11-stage autonomous recovery pipeline" />
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16 }}>
        {/* Pipeline */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['SUCCESS','FAILURE'] as const).map(d => (
              <button key={d} onClick={() => { setDemo(d); setActive(null); setRan(false); }}
                style={{ flex: 1, padding: '6px 0', borderRadius: 6, border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: demo === d ? (d === 'SUCCESS' ? '#10b981' : '#ef4444') : 'transparent', color: demo === d ? 'white' : 'var(--text-secondary)' }}>
                {d === 'SUCCESS' ? '✓ Success Demo' : '✗ Failure Demo'}
              </button>
            ))}
          </div>

          {stages.map((stage, i) => (
            <div key={stage.key}>
              <div className={`pipeline-stage ${active === stage.key ? 'active' : ''}`}
                onClick={() => setActive(active === stage.key ? null : stage.key)}>
                <div className="pipeline-dot" style={{ background: stageColor(stage) }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{i + 1}. {stage.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {stage.status === 'blocked' ? '🚫 BLOCKED' : stage.status === 'escalated' ? '⚠ ESCALATED' : '✓ Complete'}
                  </div>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{active === stage.key ? '▲' : '▼'}</span>
              </div>
              {i < stages.length - 1 && (
                <div style={{ marginLeft: 20, width: 1, height: 8, background: 'var(--border)' }} />
              )}
            </div>
          ))}

          <button className="btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={running} onClick={triggerDemo}>
            {running ? 'Running Demo…' : `▶ Run ${demo === 'SUCCESS' ? 'Recovery' : 'Failure'} Demo`}
          </button>
          {ran && <div className="badge badge-success" style={{ marginTop: 8, display: 'block', textAlign: 'center' }}>Demo completed — check Audit Ledger</div>}
        </div>

        {/* Detail Panel */}
        <div>
          {active ? (
            <div className="card animate-in">
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                Stage: {stages.find(s => s.key === active)?.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {stages.find(s => s.key === active)?.detail}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Click any stage to inspect details</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                The 11-stage autonomous pipeline runs DETECT → DIAGNOSE → PREDICT → SIMULATE → DECIDE → POLICY CHECK → EXECUTE → OBSERVE → RECOVER → MEASURE → LEARN
              </div>
            </div>
          )}

          {/* Pipeline overview stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 12 }}>
            {[
              { label: 'Avg Pipeline Time', val: '4.2s', sub: 'From detect to execute' },
              { label: 'Policy Approval Rate', val: '91.4%', sub: 'Actions auto-approved' },
              { label: 'Execution Success Rate', val: '87.3%', sub: 'Razorpay API success' },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand)' }}>{s.val}</div>
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
