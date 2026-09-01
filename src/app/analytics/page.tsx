'use client';
import Topbar from '@/components/Topbar';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const WEEKLY = [
  { d: 'Mon', risk: 8.2, rec: 3.1, rate: 72 }, { d: 'Tue', risk: 9.4, rec: 3.8, rate: 74 },
  { d: 'Wed', risk: 11.2, rec: 4.2, rate: 73 }, { d: 'Thu', risk: 10.8, rec: 4.5, rate: 75 },
  { d: 'Fri', risk: 12.1, rec: 4.9, rate: 77 }, { d: 'Sat', risk: 10.4, rec: 4.7, rate: 76 },
  { d: 'Sun', risk: 10.2, rec: 4.87, rate: 75.8 },
];

const STRATEGY_PERF = [
  { name: 'Payment Link', success: 79, attempts: 223 },
  { name: 'Smart Recovery', success: 85, attempts: 134 },
  { name: 'Reminder', success: 61, attempts: 95 },
  { name: 'Retry', success: 34, attempts: 133 },
  { name: 'Alternate', success: 68, attempts: 54 },
];

const PRED_ACCURACY = [
  { d: 'Mon', predicted: 3.2, actual: 3.1 }, { d: 'Tue', predicted: 3.9, actual: 3.8 },
  { d: 'Wed', predicted: 4.0, actual: 4.2 }, { d: 'Thu', predicted: 4.4, actual: 4.5 },
  { d: 'Fri', predicted: 4.7, actual: 4.9 }, { d: 'Sat', predicted: 4.8, actual: 4.7 },
  { d: 'Sun', predicted: 5.0, actual: 4.87 },
];

const tt = { contentStyle: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 } };

export default function AnalyticsPage() {
  return (
    <>
      <Topbar title="Analytics" subtitle="Revenue recovery performance and AI model metrics" />
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 16 }}>
          {[
            { label: 'Revenue Saved (7d)', val: '₹4.87L', color: '#10b981', sub: '↑ 31.8%' },
            { label: 'Avg Recovery Rate', val: '75.8%', color: '#0066ff', sub: '↑ 12.4%' },
            { label: 'Prediction Accuracy', val: '91.3%', color: '#8b5cf6', sub: '↑ 4.2%' },
            { label: 'Policy Blocks', val: '37', color: '#ef4444', sub: '7.0% of actions' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Revenue at Risk vs Recovered</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={WEEKLY}>
                <defs>
                  <linearGradient id="aRisk" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ef4444" stopOpacity={0.15} /><stop offset="1" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
                  <linearGradient id="aRec"  x1="0" y1="0" x2="0" y2="1"><stop stopColor="#10b981" stopOpacity={0.15} /><stop offset="1" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit="L" />
                <Tooltip {...tt} formatter={(v: any) => `₹${v}L`} />
                <Legend />
                <Area type="monotone" dataKey="risk" name="At Risk" stroke="#ef4444" fill="url(#aRisk)" strokeWidth={2} />
                <Area type="monotone" dataKey="rec"  name="Recovered" stroke="#10b981" fill="url(#aRec)"  strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Prediction Accuracy (Predicted vs Actual)</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={PRED_ACCURACY}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit="L" />
                <Tooltip {...tt} formatter={(v: any) => `₹${v}L`} />
                <Legend />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="#0066ff" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                <Line type="monotone" dataKey="actual" name="Actual" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Strategy Success Rate</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={STRATEGY_PERF} layout="vertical">
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip {...tt} formatter={(v: any) => `${v}%`} />
              <Bar dataKey="success" fill="#0066ff" radius={[0, 4, 4, 0]} name="Success Rate"
                label={{ position: 'right', fontSize: 10, fill: 'var(--text-muted)', formatter: (v: any) => `${v}%` }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
