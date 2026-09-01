'use client';
import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { AlertTriangle, TrendingUp, CheckCircle, Percent, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';
const RevenueGlobe = dynamic(() => import('@/components/RevenueGlobe'), { ssr: false });

const fmt = (n: number) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const TREND_DATA = [
  { d: 'Mon', risk: 8.2, rec: 3.1 }, { d: 'Tue', risk: 9.4, rec: 3.8 },
  { d: 'Wed', risk: 11.2, rec: 4.2 }, { d: 'Thu', risk: 10.8, rec: 4.5 },
  { d: 'Fri', risk: 12.1, rec: 4.9 }, { d: 'Sat', risk: 10.4, rec: 4.7 },
  { d: 'Sun', risk: 10.24, rec: 4.87 },
];

const RISK_CLUSTERS = [
  { name: 'UPI Failures — Bank XYZ', amount: '₹1.28L', level: 'High', color: '#ef4444' },
  { name: 'Card Declines — ICICI',   amount: '₹98.6K', level: 'Medium', color: '#f59e0b' },
  { name: 'Checkout Drop-off',        amount: '₹74.2K', level: 'Medium', color: '#f59e0b' },
  { name: 'Subscription Expiry',      amount: '₹63.1K', level: 'Low',    color: '#10b981' },
  { name: 'Netbanking Failures',      amount: '₹52.7K', level: 'Low',    color: '#10b981' },
];

const SIM_DATA = [
  { name: 'Do Nothing',   val: 1.24, conf: 8,  color: '#94a3b8' },
  { name: 'Retry',        val: 2.81, conf: 35, color: '#f59e0b' },
  { name: 'Payment Link', val: 4.21, conf: 72, color: '#0066ff', rec: true },
  { name: 'Smart Rec.',   val: 5.02, conf: 85, color: '#10b981' },
];

const PIE_DATA = [
  { name: 'Payment Link', value: 42, color: '#0066ff' },
  { name: 'Retry',        value: 25, color: '#f59e0b' },
  { name: 'Reminder',     value: 18, color: '#10b981' },
  { name: 'Alt. Payment', value: 10, color: '#8b5cf6' },
  { name: 'Escalated',    value: 5,  color: '#ef4444' },
];

const BADGE_MAP: Record<string, string> = {
  SUCCESS: 'badge badge-success', BLOCKED: 'badge badge-blocked',
  DETECTED: 'badge badge-warning', SENT: 'badge badge-info',
  'IN PROGRESS': 'badge badge-purple',
};

const LIVE_FEED = [
  { time: '15:42', msg: 'Payment Link Sent', sub: '₹9,999 recovered · TXN_92817', tag: 'SUCCESS' },
  { time: '15:41', msg: 'Retry Attempt Initiated', sub: '₹4,599 · TXN_92816', tag: 'IN PROGRESS' },
  { time: '15:41', msg: 'High Risk Detected', sub: '₹14,999 at risk · TXN_92815', tag: 'DETECTED' },
  { time: '15:40', msg: 'Intervention Blocked', sub: 'Policy limit exceeded · TXN_92814', tag: 'BLOCKED' },
  { time: '15:39', msg: 'Recovery Reminder Sent', sub: '₹2,199 · TXN_92813', tag: 'SENT' },
];

const AT_RISK = [
  { id: 'TXN_92817', cust: 'CUST_12981', amt: 9999,  risk: 92, issue: 'UPI: Failure — Bank XYZ', action: 'Send Payment Link',  impact: 9999  },
  { id: 'TXN_92816', cust: 'CUST_68211', amt: 4599,  risk: 78, issue: 'Card Declined — ICICI',    action: 'Retry with Alternate', impact: 4199  },
  { id: 'TXN_92815', cust: 'CUST_77521', amt: 14999, risk: 95, issue: 'Checkout Abandoned',       action: 'Recovery Reminder',   impact: 14999 },
  { id: 'TXN_92814', cust: 'CUST_44219', amt: 2199,  risk: 65, issue: 'Payment Timeout',          action: 'Smart Retry',         impact: 2199  },
  { id: 'TXN_92813', cust: 'CUST_11871', amt: 7499,  risk: 81, issue: 'Netbanking Failure',       action: 'Alternate Payment',   impact: 7499  },
];

function RiskBar({ score }: { score: number }) {
  const color = score > 80 ? '#ef4444' : score > 60 ? '#f59e0b' : '#10b981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div className="risk-bar" style={{ width: 60 }}>
        <div className="risk-bar-fill" style={{ width: `${score}%`, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{score}</span>
    </div>
  );
}

export default function CommandCenter() {
  const [summary, setSummary] = useState<any>(null);
  const [executing, setExecuting] = useState<string | null>(null);
  const [recovered, setRecovered] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/api/dashboard/summary').then(r => r.json()).then(setSummary);
  }, []);

  const handleAction = async (txnId: string) => {
    setExecuting(txnId);
    const res = await fetch('/api/recovery/execute', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: txnId })
    });
    const data = await res.json();
    setExecuting(null);
    if (data.policyCheck?.status === 'APPROVED') {
      setRecovered(r => ({ ...r, [txnId]: true }));
      setSummary((s: any) => s ? { ...s, recoveredRevenue: (s.recoveredRevenue || 0) + (data.decision?.amount || 0) } : s);
    } else {
      alert(`🚫 BLOCKED: ${data.policyCheck?.rationale}`);
    }
  };

  const [globeZoom, setGlobeZoom] = useState(1.0);
  const [globeMode, setGlobeMode] = useState<'2D' | '3D'>('3D');

  const S = summary;

  return (
    <>
      <Topbar title="Command Center" subtitle="Autonomous Revenue Intelligence" />

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginTop: 8 }}>
        {[
          { label: 'Revenue at Risk',     value: S ? fmt(S.revenueAtRisk)     : '₹10.24L', trend: '+18.6%', up: false, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Recoverable Revenue', value: S ? fmt(S.recoverableRevenue) : '₹6.42L',  trend: '+24.3%', up: true,  icon: TrendingUp,    color: '#0066ff' },
          { label: 'Recovered Revenue',   value: S ? fmt(S.recoveredRevenue)   : '₹4.87L',  trend: '+31.8%', up: true,  icon: CheckCircle,   color: '#10b981' },
          { label: 'Recovery Rate',       value: S ? `${S.recoveryRate}%`      : '75.8%',   trend: '+12.4%', up: true,  icon: Percent,       color: '#f59e0b' },
          { label: 'Interventions',       value: S ? String(S.interventionsCount) : '532',  trend: '+27.1%', up: true,  icon: Activity,      color: '#8b5cf6' },
        ].map(kpi => (
          <div className="kpi-card" key={kpi.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-label">{kpi.label}</div>
              <kpi.icon size={15} color={kpi.color} />
            </div>
            <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className={`kpi-trend ${kpi.up ? 'kpi-up' : 'kpi-down'}`}>
              {kpi.up ? '↑' : '↑'} {kpi.trend} vs last 7 days
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Universe — Globe Section */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Revenue Universe <span style={{ fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}>ⓘ</span></div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time view of revenue ecosystem</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 24, alignItems: 'center' }}>
          {/* Stats column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '👤', label: 'Transactions Analyzed', val: S ? S.transactionsAnalyzed.toLocaleString('en-IN') : '1,02,389', color: '#0066ff' },
              { icon: '🎯', label: 'High Risk Customers', val: S ? S.highRiskCustomersCount.toLocaleString('en-IN') : '2,341', color: '#f59e0b' },
              { icon: '🚨', label: 'Payment Failures', val: S ? S.paymentFailuresCount.toLocaleString('en-IN') : '4,892', color: '#ef4444' },
              { icon: '🛒', label: 'Abandoned Checkouts', val: S ? S.abandonedCheckoutsCount.toLocaleString('en-IN') : '3,102', color: '#8b5cf6' },
              { icon: '🔄', label: 'Subscription Failures', val: S ? S.subscriptionFailuresCount.toLocaleString('en-IN') : '1,848', color: '#0066ff' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, opacity: 0.9 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 1 }}>{s.val}</div>
                </div>
              </div>
            ))}
            <a href="/universe" style={{ fontSize: 12, fontWeight: 600, color: 'var(--brand)', marginTop: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Explore Universe →
            </a>
          </div>

          {/* Globe Center */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ position: 'relative', width: 320, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RevenueGlobe zoomLevel={globeZoom} mode={globeMode} />

              {/* Floating Overlay Metric 1: Top Right */}
              <div style={{ position: 'absolute', top: 15, right: -15, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Payment Failures</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>₹4.21L</div>
                <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></span> 232 txns
                </div>
              </div>

              {/* Floating Overlay Metric 2: Bottom Left */}
              <div style={{ position: 'absolute', bottom: 35, left: -25, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Abandoned Checkouts</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>₹ 2.18L</div>
                <div style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }}></span> 461 txns
                </div>
              </div>

              {/* Floating Overlay Metric 3: Bottom Right */}
              <div style={{ position: 'absolute', bottom: 20, right: -25, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Subscription Failures</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>₹ 1.84L</div>
                <div style={{ fontSize: 10, color: '#0066ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0066ff' }}></span> 132 txns
                </div>
              </div>

              {/* Bottom Controls Pill */}
              <div style={{ position: 'absolute', bottom: -10, display: 'flex', gap: 8, alignItems: 'center', zIndex: 10 }}>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '3px 10px', fontSize: 12, color: 'var(--text-primary)', display: 'flex', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <span onClick={() => setGlobeZoom(z => Math.max(0.6, z - 0.2))} style={{ padding: '0 4px', cursor: 'pointer', fontWeight: 700 }} title="Zoom Out">-</span>
                  <span onClick={() => setGlobeZoom(z => Math.min(1.8, z + 0.2))} style={{ padding: '0 4px', cursor: 'pointer', fontWeight: 700 }} title="Zoom In">+</span>
                </div>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '3px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                  <span onClick={() => setGlobeMode('2D')} style={{ color: globeMode === '2D' ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer' }}>2D</span>
                  <span onClick={() => setGlobeMode('3D')} style={{ color: globeMode === '3D' ? 'var(--brand)' : 'var(--text-muted)', cursor: 'pointer' }}>3D</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Risk Clusters column */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Top Risk Clusters</div>
              <a href="/radar" style={{ fontSize: 11, color: 'var(--text-muted)', textDecoration: 'none' }}>View All</a>
            </div>
            {RISK_CLUSTERS.map(c => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.amount}</div>
                </div>
                <span className="badge" style={{ background: c.color + '22', color: c.color }}>{c.level}</span>
              </div>
            ))}
            <div style={{ marginTop: 10 }}>
              <a href="/radar" style={{ fontSize: 11, color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>Explore All →</a>
            </div>
          </div>
        </div>
      </div>

      {/* Future Simulator Preview + Live Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontWeight: 600 }}>Future Simulator</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Simulate strategies and compare predicted outcomes</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {SIM_DATA.map(s => (
              <div key={s.name} className={`sim-card ${s.rec ? 'recommended' : ''}`}>
                {s.rec && <div className="rec-tag">RECOMMENDED</div>}
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: s.rec ? 8 : 0 }}>{s.name}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color, margin: '6px 0' }}>₹{s.val}L</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Expected Recovery</div>
                <div className="risk-bar" style={{ marginTop: 8 }}>
                  <div className="risk-bar-fill" style={{ width: `${s.conf}%`, background: s.color }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{s.conf}% Confidence</div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>Live Activity Feed</div>
            <div className="live-dot" />
          </div>
          {LIVE_FEED.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 36, paddingTop: 2 }}>{item.time}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{item.msg}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0' }}>{item.sub}</div>
                <span className={BADGE_MAP[item.tag] || 'badge badge-info'}>{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At Risk Pipeline Table */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>At-Risk Pipeline</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Transactions that need attention</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Transaction</th><th>Customer</th><th>Amount</th><th>Risk Score</th>
                <th>Issue</th><th>Recommended Action</th><th>Impact</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {AT_RISK.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600, color: 'var(--brand)', fontFamily: 'monospace', fontSize: 12 }}>{row.id}</td>
                  <td style={{ fontSize: 12 }}>{row.cust}</td>
                  <td style={{ fontWeight: 600 }}>₹{row.amt.toLocaleString('en-IN')}</td>
                  <td><RiskBar score={row.risk} /></td>
                  <td style={{ fontSize: 12 }}>{row.issue}</td>
                  <td style={{ fontSize: 12 }}>{row.action}</td>
                  <td style={{ fontWeight: 600, color: '#0066ff' }}>₹{row.impact.toLocaleString('en-IN')}</td>
                  <td>
                    {recovered[row.id]
                      ? <span className="badge badge-success">RECOVERED</span>
                      : <button className="btn-primary" style={{ fontSize: 11, padding: '5px 10px' }}
                          disabled={executing === row.id}
                          onClick={() => handleAction(row.id)}>
                          {executing === row.id ? 'Running…' : 'Take Action'}
                        </button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Grid: Interventions Overview + Revenue Impact */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14 }}>Interventions Overview</div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <PieChart width={100} height={100}>
              <Pie data={PIE_DATA} cx={50} cy={50} innerRadius={28} outerRadius={45} dataKey="value" strokeWidth={0}>
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ flex: 1 }}>
              {PIE_DATA.map(p => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, background: p.color, borderRadius: 2 }} />
                    <span style={{ fontSize: 12 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Revenue Impact Analysis</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Track your recovery performance</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue Recovered</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{S ? fmt(S.recoveredRevenue) : '₹4.87L'}</div>
            <div style={{ fontSize: 11, color: '#10b981' }}>↑ 31.8% vs last 7 days</div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={TREND_DATA}>
              <Bar dataKey="rec" fill="#0066ff" radius={[3, 3, 0, 0]} />
              <Tooltip formatter={(v: any) => `₹${v}L`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
