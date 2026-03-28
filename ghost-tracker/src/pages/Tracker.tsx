import { useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Search, Ghost, Filter } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { GhostMeter } from '../components/GhostMeter';
import type { Application, ApplicationStatus } from '../types';

interface Props {
  applications: Application[];
  hasLoaded: boolean;
}

const STATUS_FILTERS: Array<{ value: ApplicationStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offers' },
  { value: 'ghosted', label: 'Ghosted' },
  { value: 'rejected', label: 'Rejected' },
];

export function Tracker({ applications, hasLoaded }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'activity' | 'company'>('date');

  const filtered = useMemo(() => {
    let list = [...applications];

    if (statusFilter !== 'all') {
      list = list.filter(a => a.status === statusFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        a =>
          a.company.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.domain?.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'date')
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      if (sortBy === 'activity')
        return b.daysSinceActivity - a.daysSinceActivity;
      return a.company.localeCompare(b.company);
    });

    return list;
  }, [applications, statusFilter, query, sortBy]);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-semibold text-3xl text-text-primary mb-1">
          Applications
        </h1>
        <p className="font-mono text-xs text-text-muted">
          {applications.length} total · {applications.filter(a => a.status === 'ghosted').length} ghosted
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search company or role…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl font-mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-muted transition-colors"
          />
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-text-muted flex-shrink-0" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-surface border border-border rounded-xl px-3 py-2.5 font-mono text-xs text-text-secondary focus:outline-none focus:border-muted transition-colors"
          >
            <option value="date">Sort: Applied date</option>
            <option value="activity">Sort: Longest silent</option>
            <option value="company">Sort: Company A→Z</option>
          </select>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count =
            value === 'all'
              ? applications.length
              : applications.filter(a => a.status === value).length;
          const isActive = statusFilter === value;
          return (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-mono text-xs transition-all ${
                isActive
                  ? 'bg-accent/15 border-accent/30 text-accent'
                  : 'bg-surface border-border text-text-muted hover:border-muted hover:text-text-secondary'
              }`}
            >
              {label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-accent/20 text-accent' : 'bg-border text-text-muted'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Table head */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-4 px-6 py-3 border-b border-border">
          {['Company / Role', 'Status', 'Applied', 'Ghost Meter'].map(h => (
            <div key={h} className="font-mono text-xs text-text-muted">
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {!hasLoaded ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 bg-border rounded w-1/2" />
                  <div className="h-2 bg-border rounded w-3/4" />
                </div>
                <div className="h-6 bg-border rounded-full w-20" />
                <div className="h-3 bg-border rounded w-16" />
                <div className="h-2 bg-border rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Ghost size={32} className="text-text-muted mb-3" />
            <div className="font-semibold text-text-secondary text-sm">No applications found</div>
            <div className="font-mono text-xs text-text-muted mt-1">
              {query ? `No results for "${query}"` : 'Try a different filter'}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(app => (
              <TrackerRow key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TrackerRow({ app }: { app: Application }) {
  const initials = app.company.slice(0, 2).toUpperCase();
  const colors = [
    'bg-accent/10 text-accent',
    'bg-ghost/10 text-ghost',
    'bg-warn/10 text-warn',
    'bg-danger/10 text-danger',
  ];
  const color = colors[app.company.charCodeAt(0) % colors.length];

  return (
    <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors">
      {/* Company / Role */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`size-9 rounded-lg flex items-center justify-center font-mono text-xs font-medium flex-shrink-0 ${color}`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-text-primary text-sm truncate">{app.company}</div>
          <div className="font-mono text-xs text-text-muted truncate">{app.role}</div>
        </div>
      </div>

      {/* Status */}
      <div>
        <StatusBadge status={app.status} size="sm" />
      </div>

      {/* Applied */}
      <div>
        <div className="font-mono text-xs text-text-secondary">
          {format(new Date(app.appliedDate), 'MMM d')}
        </div>
        <div className="font-mono text-[10px] text-text-muted mt-0.5">
          {formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}
        </div>
      </div>

      {/* Ghost meter */}
      <GhostMeter
        daysSinceActivity={app.daysSinceActivity}
        isGhosted={app.isGhosted}
      />
    </div>
  );
}
