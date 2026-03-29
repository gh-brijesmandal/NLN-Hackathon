import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ListChecks, Settings, LogOut, Ghost,
  RefreshCw, User, FileText, Briefcase, Globe, HelpCircle, Bot
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

interface Props {
  onRefresh?: () => void;
  isScanning?: boolean;
}

const NAV_TOP = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tracker', label: 'Applications', icon: ListChecks },
  { to: '/profile', label: 'My Profile', icon: User },
  { to: '/resume', label: 'Resume Helper', icon: FileText },
];

const NAV_DISCOVER = [
  { to: '/jobs', label: 'Job Board', icon: Briefcase },
  { to: '/h1b', label: 'H1B Sponsors', icon: Globe },
  { to: '/help', label: 'Job Tips', icon: HelpCircle },
  { to: '/ai', label: 'AI Assistant', icon: Bot },
];

export function Sidebar({ onRefresh, isScanning }: Props) {
  const { auth, signOut, isDemoMode } = useAuth();

  return (
    <aside className="flex flex-col w-56 bg-surface border-r border-border h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="size-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
          <Ghost size={17} className="text-accent" />
        </div>
        <div>
          <div className="font-display font-semibold text-text-primary text-sm tracking-wide">GhostTracker</div>
          {isDemoMode && <div className="font-mono text-[9px] text-accent">DEMO MODE</div>}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5">
        <div className="font-mono text-[9px] text-text-muted uppercase tracking-widest px-2 mb-1 mt-1">Tracking</div>
        {NAV_TOP.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => clsx(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}

        <div className="font-mono text-[9px] text-text-muted uppercase tracking-widest px-2 mb-1 mt-4">Discover</div>
        {NAV_DISCOVER.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
            )}>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}

        <div className="font-mono text-[9px] text-text-muted uppercase tracking-widest px-2 mb-1 mt-4">System</div>
        <NavLink to="/settings"
          className={({ isActive }) => clsx(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
            isActive ? 'bg-accent/10 text-accent' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
          )}>
          <Settings size={15} />
          Settings
        </NavLink>
      </nav>

      {/* Refresh */}
      {onRefresh && (
        <div className="px-2.5 pb-2">
          <button onClick={onRefresh} disabled={isScanning}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-accent hover:bg-accent/5 transition-all disabled:opacity-40">
            <RefreshCw size={15} className={clsx(isScanning && 'animate-spin')} />
            {isScanning ? 'Scanning…' : 'Sync Emails'}
          </button>
        </div>
      )}

      {/* User */}
      <div className="px-2.5 pb-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          {auth.userAvatar ? (
            <img src={auth.userAvatar} alt="" className="size-7 rounded-full ring-1 ring-border flex-shrink-0" />
          ) : (
            <div className="size-7 rounded-full bg-ghost/20 flex items-center justify-center text-ghost text-xs font-mono font-medium flex-shrink-0">
              {(auth.userName ?? 'D').charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text-primary truncate">{auth.userName ?? 'Demo User'}</div>
            <div className="text-[10px] font-mono text-text-muted truncate">{auth.userEmail ?? 'demo mode'}</div>
          </div>
          <button onClick={signOut} className="text-text-muted hover:text-danger transition-colors" title="Sign out">
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
