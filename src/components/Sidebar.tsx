'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import {
  LayoutDashboard, Globe, Radar, GitBranch, Zap,
  List, Users, BarChart2, FileText, Settings, Sun, Moon
} from 'lucide-react';

const NAV = [
  { href: '/',               icon: LayoutDashboard, label: 'Command Center' },
  { href: '/universe',       icon: Globe,           label: 'Revenue Universe' },
  { href: '/radar',          icon: Radar,           label: 'Risk Radar' },
  { href: '/simulator',      icon: GitBranch,       label: 'Future Simulator' },
  { href: '/pipeline',       icon: Zap,             label: 'Recovery Engine' },
  { href: '/interventions',  icon: List,            label: 'Interventions' },
  { href: '/customer-dna',   icon: Users,           label: 'Customer DNA' },
  { href: '/analytics',      icon: BarChart2,       label: 'Analytics' },
  { href: '/audit',          icon: FileText,        label: 'Audit Ledger' },
  { href: '/settings',       icon: Settings,        label: 'Settings' },
];

export default function Sidebar() {
  const path = usePathname();
  const { dark, toggle } = useTheme();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">REV∞</div>
        <div className="logo-sub">Autonomous Revenue Intelligence</div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`nav-item ${path === href ? 'active' : ''}`}>
            <Icon size={15} />
            {label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div className="live-dot" />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>All Systems Operational</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sun size={13} color="var(--text-muted)" />
          <button className={`theme-toggle ${dark ? 'on' : ''}`} onClick={toggle} title="Toggle theme" />
          <Moon size={13} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
}
