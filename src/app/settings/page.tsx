'use client';
import Topbar from '@/components/Topbar';
import { useState } from 'react';

export default function SettingsPage() {
  const [policy, setPolicy] = useState({ maxAmount: 10000, maxRetries: 2, maxContacts: 2, maxDiscount: 8 });
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <>
      <Topbar title="Settings" subtitle="Financial Guardian policy configuration" />
      <div style={{ marginTop: 8, maxWidth: 640 }}>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Financial Policy Rules</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Configure the bounds of autonomous AI action. The Financial Guardian will enforce these rules strictly.
          </div>
          {[
            { key: 'maxAmount', label: 'Max Autonomous Amount (₹)', desc: 'Actions above this require human approval', min: 1000, max: 50000, step: 1000 },
            { key: 'maxRetries', label: 'Max Retries per Transaction', desc: 'Exceeding this triggers an automatic policy block', min: 1, max: 5, step: 1 },
            { key: 'maxContacts', label: 'Max Customer Contacts / 24h', desc: 'Prevents over-messaging customers', min: 1, max: 5, step: 1 },
            { key: 'maxDiscount', label: 'Max Discount Allowed (%)', desc: 'Cap on discount-based recovery offers', min: 0, max: 20, step: 1 },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</label>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand)' }}>
                  {f.key === 'maxAmount' ? `₹${policy[f.key as keyof typeof policy].toLocaleString('en-IN')}` : `${policy[f.key as keyof typeof policy]}${f.key === 'maxDiscount' ? '%' : ''}`}
                </span>
              </div>
              <input type="range" min={f.min} max={f.max} step={f.step}
                value={policy[f.key as keyof typeof policy]}
                onChange={e => setPolicy(p => ({ ...p, [f.key]: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: 'var(--brand)' }} />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{f.desc}</div>
            </div>
          ))}
          <button className="btn-primary" onClick={save}>{saved ? '✓ Saved' : 'Save Policy'}</button>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Razorpay Integration</div>
          {[
            { label: 'Mode', val: '🟢 TEST MODE', note: '' },
            { label: 'API Status', val: 'Connected (Sandbox)', note: '' },
            { label: 'Webhook Endpoint', val: '/api/webhooks/razorpay', note: 'Validates x-razorpay-signature' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
              <span style={{ color: 'var(--text-muted)' }}>{r.label}</span>
              <span style={{ fontWeight: 600 }}>{r.val}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
