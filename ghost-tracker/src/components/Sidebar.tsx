import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Settings,
  LogOut,
  Ghost,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

interface Props {
  onRefresh?: () => void;
  isScanning?: boolean;
}

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tracker', label: 'Applications', icon: ListChecks },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ onRefresh, isScanning }: Props) {
  const { auth, signOut, isDemoMode } = useAuth();

  return (
    <aside className="flex flex-col w-60 bg-surface border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="size-8 rounded-lg bg-accent/15 flex items-center justify-center">
          <Ghost size={18} className="text-accent" />
        </div>
        <div>
          <div className="font-display font-semibold text-text-primary text-sm tracking-wide">
            GhostTracker
          </div>
          {isDemoMode && (
            <div className="font-mono text-[10px] text-warn">DEMO MODE</div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Refresh */}
      {onRefresh && (
        <div className="px-3 pb-2">
          <button
            onClick={onRefresh}
            disabled={isScanning}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-40"
          >
            <RefreshCw size={16} className={clsx(isScanning && 'animate-spin')} />
            {isScanning ? 'Scanning…' : 'Refresh'}
          </button>
        </div>
      )}

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2.5">
          {auth.userAvatar ? (
            <img
              src={auth.userAvatar}
              alt={auth.userName ?? ''}
              className="size-7 rounded-full ring-1 ring-border"
            />
          ) : (
            <div className="size-7 rounded-full bg-ghost/20 flex items-center justify-center text-ghost text-xs font-mono font-medium">
              {(auth.userName ?? 'D').charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text-primary truncate">
              {auth.userName ?? 'Demo User'}
            </div>
            <div className="text-[10px] font-mono text-text-muted truncate">
              {auth.userEmail ?? 'demo mode'}
            </div>
          </div>
          <button
            onClick={signOut}
            className="text-text-muted hover:text-danger transition-colors"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
