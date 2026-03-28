import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ghost, TrendingUp, Inbox, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { GhostMeter } from '../components/GhostMeter';
import type { Application } from '../types';
import type { StatsSnapshot } from '../types';

interface Props {
  applications: Application[];
  stats: StatsSnapshot;
  onScan: () => void;
  hasLoaded: boolean;
}

export function Dashboard({ applications, stats, onScan, hasLoaded }: Props) {
  const { auth } = useAuth();

  useEffect(() => {
    if (!hasLoaded) onScan();
  }, [hasLoaded, onScan]);

  const ghosted = applications.filter(a => a.status === 'ghosted');
  const active = applications.filter(a =>
    ['applied', 'screening', 'interviewing'].includes(a.status)
  );
  const recent = applications.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="font-mono text-xs text-text-muted mb-1">
          {greeting()}, {auth.userName?.split(' ')[0] ?? 'there'} —
        </div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">
          Your job search, tracked.
        </h1>
        {auth.scannedAt && (
          <p className="font-mono text-xs text-text-muted mt-1">
            Last synced {formatDistanceToNow(new Date(auth.scannedAt), { addSuffix: true })}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard label="Total applications" value={stats.total} icon={Inbox} />
        <StatCard label="Active" value={stats.active} icon={TrendingUp} accent="accent" />
        <StatCard label="Ghosted" value={stats.ghosted} icon={Ghost} accent="warn" />
        <StatCard
          label="Response rate"
          value={stats.responseRate}
          icon={CheckCircle2}
          accent="accent"
          suffix="%"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent applications */}
        <div className="xl:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6 border-b border-border">
            <span className="font-semibold text-text-primary text-sm">Recent Applications</span>
            <Link
              to="/tracker"
              className="flex items-center gap-1 font-mono text-xs text-text-muted hover:text-accent transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {!hasLoaded ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="size-10 rounded-xl bg-border flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-border rounded w-1/3" />
                    <div className="h-2 bg-border rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <Ghost size={36} className="text-text-muted mb-3" />
              <div className="font-semibold text-text-secondary text-sm">No applications found</div>
              <div className="font-mono text-xs text-text-muted mt-1">
                We couldn't detect any job application emails.
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map(app => (
                <AppRow key={app.id} app={app} />
              ))}
            </div>
          )}
        </div>

        {/* Ghost alert panel */}
        <div className="space-y-4">
          {/* Ghosted companies */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <AlertTriangle size={15} className="text-warn" />
              <span className="font-semibold text-text-primary text-sm">Ghosted</span>
              {ghosted.length > 0 && (
                <span className="ml-auto font-mono text-xs bg-warn/10 text-warn px-2 py-0.5 rounded-full">
                  {ghosted.length}
                </span>
              )}
            </div>

            {ghosted.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-mono text-xs text-text-muted">
                  No ghosted applications yet
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {ghosted.slice(0, 4).map(app => (
                  <div key={app.id} className="px-5 py-3.5">
                    <div className="font-medium text-sm text-text-primary">{app.company}</div>
                    <div className="font-mono text-xs text-text-muted truncate mt-0.5">
                      {app.role}
                    </div>
                    <div className="font-mono text-xs text-warn mt-1.5">
                      Silent for {app.daysSinceActivity} days
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active pipeline */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <TrendingUp size={15} className="text-accent" />
              <span className="font-semibold text-text-primary text-sm">Active Pipeline</span>
            </div>
            {active.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <div className="font-mono text-xs text-text-muted">No active applications</div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {active.slice(0, 4).map(app => (
                  <div key={app.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-text-primary">{app.company}</span>
                      <StatusBadge status={app.status} size="sm" />
                    </div>
                    <div className="font-mono text-xs text-text-muted truncate">{app.role}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AppRow({ app }: { app: Application }) {
  const initials = app.company.slice(0, 2).toUpperCase();
  const colors = [
    'bg-accent/10 text-accent',
    'bg-ghost/10 text-ghost',
    'bg-warn/10 text-warn',
    'bg-danger/10 text-danger',
  ];
  const color = colors[app.company.charCodeAt(0) % colors.length];

  return (
    <div className="px-4 py-4 sm:px-6 hover:bg-white/[0.02] transition-colors">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`size-10 rounded-xl flex items-center justify-center font-mono text-xs font-medium flex-shrink-0 ${color}`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="font-medium text-text-primary text-sm">{app.company}</span>
              <StatusBadge status={app.status} size="sm" />
            </div>
            <div className="font-mono text-xs text-text-muted truncate">{app.role}</div>
            <GhostMeter
              daysSinceActivity={app.daysSinceActivity}
              isGhosted={app.isGhosted}
              className="mt-2 max-w-sm"
            />
          </div>
        </div>

        <div className="font-mono text-[11px] sm:text-xs text-text-muted sm:text-right sm:flex-shrink-0">
          {formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
