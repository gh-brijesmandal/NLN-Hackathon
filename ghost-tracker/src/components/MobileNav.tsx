import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Briefcase, Bot, Settings } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  onRefresh?: () => void;
  isScanning?: boolean;
}

const NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/tracker', label: 'Tracker', icon: ListChecks },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/ai', label: 'AI', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav({ }: Props) {
  return (
    <nav className="bg-surface/95 border-t border-border backdrop-blur-md flex items-center justify-around px-2 py-2 safe-area-bottom">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end}
          className={({ isActive }) => clsx(
            'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[56px]',
            isActive ? 'text-accent' : 'text-text-muted'
          )}>
          <Icon size={20} />
          <span className="text-[10px] font-mono">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
