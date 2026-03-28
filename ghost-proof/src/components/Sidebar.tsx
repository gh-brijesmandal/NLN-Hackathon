import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Flame, List, Settings } from 'lucide-react';
import clsx from 'clsx';

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/parser', icon: Zap, label: 'Rejection Parser' },
  { to: '/heatmap', icon: Flame, label: 'Skill Heatmap' },
  { to: '/tracker', icon: List, label: 'Applications' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-56 min-w-[14rem] bg-brand-surface border-r border-white/[0.08] flex flex-col py-5 shrink-0">
      <div className="px-5 pb-6 border-b border-white/[0.08] mb-4">
        <div className="font-display text-[20px] font-black text-brand-accent tracking-tight leading-none">
          GHOST-PROOF
        </div>
        <div className="text-[10px] text-brand-muted uppercase tracking-widest mt-1">
          Application Intelligence
        </div>
      </div>

      <nav className="flex flex-col gap-0.5 px-2 flex-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-[12px] font-mono transition-all duration-150 border-l-2',
                isActive
                  ? 'text-brand-accent border-brand-accent bg-brand-accent/5'
                  : 'text-brand-muted border-transparent hover:text-white hover:bg-white/[0.03]'
              )
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 pt-4 border-t border-white/[0.08]">
        <div className="text-[10px] text-brand-muted">Spring 2025 Cycle</div>
        <div className="text-[10px] text-brand-muted/50 mt-0.5">24 applications tracked</div>
      </div>
    </aside>
  );
}
