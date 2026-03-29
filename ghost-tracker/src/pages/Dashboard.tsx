import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ghost, TrendingUp, Inbox, AlertTriangle, CheckCircle2, ArrowRight, Briefcase, Bot, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { GhostMeter } from '../components/GhostMeter';
import type { Application, StatsSnapshot } from '../types';

interface Props {
  applications: Application[];
  stats: StatsSnapshot;
  onScan: () => void;
  hasLoaded: boolean;
}

export function Dashboard({ applications, stats, onScan, hasLoaded }: Props) {
  const { auth } = useAuth();

  useEffect(() => { if (!hasLoaded) onScan(); }, [hasLoaded, onScan]);

  const ghosted = applications.filter(a => a.status === 'ghosted');
  const active = applications.filter(a => ['applied', 'screening', 'interviewing'].includes(a.status));
  const recent = applications.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="font-mono text-xs text-text-muted mb-1">{greeting()}, {auth.userName?.split(' ')[0] ?? 'there'} —</div>
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">Your job search, tracked.</h1>
        {auth.scannedAt && (
          <p className="font-mono text-xs text-text-muted mt-1">Last synced {formatDistanceToNow(new Date(auth.scannedAt), { addSuffix: true })}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatCard label="Total applications" value={stats.total} icon={Inbox} />
        <StatCard label="Active" value={stats.active} icon={TrendingUp} accent="accent" />
        <StatCard label="Ghosted" value={stats.ghosted} icon={Ghost} accent="warn" />
        <StatCard label="Response rate" value={stats.responseRate} icon={CheckCircle2} accent="accent" suffix="%" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        {/* Recent applications */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
            <span className="font-semibold text-text-primary text-sm">Recent Applications</span>
            <Link to="/tracker" className="flex items-center gap-1 font-mono text-xs text-text-muted hover:text-accent transition-colors">
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
              <div className="font-semibold text-text-secondary text-sm">No applications yet</div>
              <div className="font-mono text-xs text-text-muted mt-1">Connect your email or add applications manually in the Tracker.</div>
              <Link to="/tracker" className="mt-4 px-4 py-2 bg-accent text-bg rounded-lg font-mono text-xs font-semibold hover:bg-accent/90 transition-all">
                Add Application
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recent.map(app => <AppRow key={app.id} app={app} />)}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Ghosted */}
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <AlertTriangle size={15} className="text-warn" />
              <span className="font-semibold text-text-primary text-sm">Ghosted</span>
              {ghosted.length > 0 && (
                <span className="ml-auto font-mono text-xs bg-warn/10 text-warn px-2 py-0.5 rounded-full">{ghosted.length}</span>
              )}
            </div>
            {ghosted.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <div className="font-mono text-xs text-text-muted">No ghosted applications yet</div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {ghosted.slice(0, 4).map(app => (
                  <div key={app.id} className="px-5 py-3.5">
                    <div className="font-medium text-sm text-text-primary">{app.company}</div>
                    <div className="font-mono text-xs text-text-muted truncate mt-0.5">{app.role}</div>
                    <div className="font-mono text-xs text-warn mt-1.5">Silent for {app.daysSinceActivity}d</div>
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
                      <span className="font-medium text-sm text-text-primary truncate mr-2">{app.company}</span>
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

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { to: '/jobs', icon: Briefcase, label: 'Browse Job Board', desc: 'Live jobs matched to your profile' },
          { to: '/resume', icon: FileText, label: 'Resume Helper', desc: 'AI-tailor your resume per job' },
          { to: '/ai', icon: Bot, label: 'AI Assistant', desc: 'Ask anything about your job search' },
        ].map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:border-accent/30 hover:bg-accent/5 transition-all group">
            <div className="size-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
              <Icon size={16} className="text-accent" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-text-primary text-sm">{label}</div>
              <div className="font-mono text-xs text-text-muted truncate">{desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AppRow({ app }: { app: Application }) {
  const initials = app.company.slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 hover:bg-white/[0.02] transition-colors">
      <div className="size-9 sm:size-10 rounded-xl flex items-center justify-center font-mono text-xs font-medium flex-shrink-0 bg-accent/10 text-accent">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <span className="font-medium text-text-primary text-sm">{app.company}</span>
          <StatusBadge status={app.status} size="sm" />
        </div>
        <div className="font-mono text-xs text-text-muted truncate">{app.role}</div>
        <GhostMeter daysSinceActivity={app.daysSinceActivity} isGhosted={app.isGhosted} className="mt-2 max-w-xs" />
      </div>
      <div className="text-right flex-shrink-0 hidden sm:block">
        <div className="font-mono text-xs text-text-muted">{formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}</div>
      </div>
    </div>
  );
}
