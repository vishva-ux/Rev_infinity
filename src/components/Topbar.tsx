'use client';

interface Props {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title }: Props) {
  return (
    <div className="topbar">
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      </div>
    </div>
  );
}
