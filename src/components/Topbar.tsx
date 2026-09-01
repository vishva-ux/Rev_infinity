'use client';
import { Bell } from 'lucide-react';

interface Props {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: Props) {
  return (
    <div className="topbar">
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', padding: '3px 8px', borderRadius: 4, fontWeight: 600 }}>
          ● TEST MODE
        </span>
        <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <Bell size={14} />
        </button>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg)', padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)', fontWeight: 500 }}>
          Last 7 Days
        </span>
      </div>
    </div>
  );
}
