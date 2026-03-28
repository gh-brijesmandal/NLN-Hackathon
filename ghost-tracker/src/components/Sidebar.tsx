import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListChecks,
  Settings,
  LogOut,
  Ghost,
  RefreshCw,
  Menu,
  X,
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
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
      isActive
        ? 'bg-accent/10 text-accent'
        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
    );

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="size-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <Ghost size={16} className="text-accent" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-semibold tracking-wide text-text-primary">
              GhostTracker
            </div>
            {isDemoMode && <div className="font-mono text-[10px] text-warn">DEMO MODE</div>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isScanning}
              className="rounded-lg border border-border bg-bg/60 p-2 text-text-secondary transition-colors hover:text-accent disabled:opacity-40"
              aria-label="Refresh applications"
            >
              <RefreshCw size={15} className={clsx(isScanning && 'animate-spin')} />
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg border border-border bg-bg/60 p-2 text-text-secondary transition-colors hover:text-text-primary"
            aria-label="Open navigation menu"
          >
            <Menu size={16} />
          </button>
        </div>
      </header>

      <div
        className={clsx(
          'fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm transition-opacity md:hidden',
          isMobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-surface transition-transform md:sticky md:top-0 md:z-auto md:h-screen md:w-60',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <Ghost size={18} className="text-accent" />
            </div>
            <div>
              <div className="font-display font-semibold text-text-primary text-sm tracking-wide">
                GhostTracker
              </div>
              {isDemoMode && <div className="font-mono text-[10px] text-warn">DEMO MODE</div>}
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:text-text-primary md:hidden"
            aria-label="Close navigation menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 px-3 py-4">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navItemClass}>
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
        <div className="border-t border-border px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 md:pb-4">
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
    </>
  );
}
