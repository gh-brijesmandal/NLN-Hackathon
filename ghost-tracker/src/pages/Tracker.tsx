import { useState, useMemo } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Search, Ghost, Filter, Plus, X, Pencil, Trash2, Check, ExternalLink } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { GhostMeter } from '../components/GhostMeter';
import type { Application, ApplicationStatus } from '../types';

interface Props {
  applications: Application[];
  hasLoaded: boolean;
  onAdd?: (app: any) => void;
  onUpdate?: (id: string, updates: Partial<Application>) => void;
  onDelete?: (id: string) => void;
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

const EMPTY_FORM = { company: '', role: '', appliedDate: format(new Date(), 'yyyy-MM-dd'), status: 'applied' as ApplicationStatus, location: '', salary: '', jobUrl: '', notes: '' };

export function Tracker({ applications, hasLoaded, onAdd, onUpdate, onDelete }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'activity' | 'company'>('date');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...applications];
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(a => a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.domain?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      if (sortBy === 'date') return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
      if (sortBy === 'activity') return b.daysSinceActivity - a.daysSinceActivity;
      return a.company.localeCompare(b.company);
    });
    return list;
  }, [applications, statusFilter, query, sortBy]);

  const handleSubmit = () => {
    if (!form.company || !form.role) return;
    const now = new Date().toISOString();
    if (editId && onUpdate) {
      onUpdate(editId, { ...form, lastActivityDate: now });
      setEditId(null);
    } else if (onAdd) {
      onAdd({ ...form, lastActivityDate: form.appliedDate, emailSnippet: '' });
    }
    setForm(EMPTY_FORM);
    setShowAddForm(false);
  };

  const startEdit = (app: Application) => {
    setForm({ company: app.company, role: app.role, appliedDate: app.appliedDate.slice(0, 10), status: app.status, location: app.location ?? '', salary: app.salary ?? '', jobUrl: app.jobUrl ?? '', notes: app.notes ?? '' });
    setEditId(app.id);
    setShowAddForm(true);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary mb-0.5">Applications</h1>
          <p className="font-mono text-xs text-text-muted">{applications.length} total · {applications.filter(a => a.status === 'ghosted').length} ghosted</p>
        </div>
        <button onClick={() => { setShowAddForm(!showAddForm); setEditId(null); setForm(EMPTY_FORM); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-bg rounded-xl font-mono text-xs font-semibold hover:bg-accent/90 transition-all self-start sm:self-auto">
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          {showAddForm ? 'Cancel' : 'Add Application'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-surface border border-accent/20 rounded-2xl p-5 mb-5 animate-slide-up">
          <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-4">{editId ? 'Edit Application' : 'Add New Application'}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {[['company', 'Company *'], ['role', 'Job Title *'], ['location', 'Location'], ['salary', 'Salary Range'], ['jobUrl', 'Job URL']].map(([k, label]) => (
              <div key={k} className={k === 'jobUrl' ? 'sm:col-span-2' : ''}>
                <label className="block font-mono text-xs text-text-muted mb-1">{label}</label>
                <input type="text" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors" />
              </div>
            ))}
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Applied Date</label>
              <input type="date" value={form.appliedDate} onChange={e => setForm(f => ({ ...f, appliedDate: e.target.value }))}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors" />
            </div>
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ApplicationStatus }))}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors">
                {STATUS_FILTERS.filter(s => s.value !== 'all').map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-mono text-xs text-text-muted mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-xs text-text-primary focus:outline-none focus:border-accent/50 transition-colors resize-none" />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={!form.company || !form.role}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-bg rounded-xl font-mono text-xs font-semibold hover:bg-accent/90 transition-all disabled:opacity-50">
            <Check size={14} /> {editId ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search company or role…" value={query} onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl font-mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-muted transition-colors" />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={13} className="text-text-muted flex-shrink-0" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-surface border border-border rounded-xl px-3 py-2.5 font-mono text-xs text-text-secondary focus:outline-none focus:border-muted transition-colors">
            <option value="date">Sort: Applied date</option>
            <option value="activity">Sort: Longest silent</option>
            <option value="company">Sort: Company A→Z</option>
          </select>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count = value === 'all' ? applications.length : applications.filter(a => a.status === value).length;
          const isActive = statusFilter === value;
          return (
            <button key={value} onClick={() => setStatusFilter(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-xs transition-all ${isActive ? 'bg-accent/15 border-accent/30 text-accent' : 'bg-surface border-border text-text-muted hover:border-muted hover:text-text-secondary'}`}>
              {label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-accent/20 text-accent' : 'bg-border text-text-muted'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile card view */}
      <div className="sm:hidden space-y-3">
        {!hasLoaded ? (
          [...Array(4)].map((_, i) => <div key={i} className="bg-surface border border-border rounded-xl p-4 h-24 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Ghost size={32} className="text-text-muted mb-3" />
            <div className="font-semibold text-text-secondary text-sm">No applications found</div>
          </div>
        ) : filtered.map(app => (
          <div key={app.id} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="font-medium text-text-primary text-sm">{app.company}</div>
                <div className="font-mono text-xs text-text-muted">{app.role}</div>
              </div>
              <StatusBadge status={app.status} size="sm" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-xs text-text-muted">{format(new Date(app.appliedDate), 'MMM d, yyyy')}</div>
              <div className="flex gap-1.5">
                {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-muted hover:text-accent transition-colors"><ExternalLink size={13} /></a>}
                <button onClick={() => startEdit(app)} className="p-1.5 text-text-muted hover:text-accent transition-colors"><Pencil size={13} /></button>
                {onDelete && <button onClick={() => onDelete(app.id)} className="p-1.5 text-text-muted hover:text-danger transition-colors"><Trash2 size={13} /></button>}
              </div>
            </div>
            <GhostMeter daysSinceActivity={app.daysSinceActivity} isGhosted={app.isGhosted} />
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface border border-border rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_80px] gap-4 px-6 py-3 border-b border-border">
          {['Company / Role', 'Status', 'Applied', 'Ghost Meter', ''].map(h => (
            <div key={h} className="font-mono text-xs text-text-muted">{h}</div>
          ))}
        </div>
        {!hasLoaded ? (
          <div className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1.5fr_80px] gap-4 animate-pulse">
                <div className="space-y-2"><div className="h-3 bg-border rounded w-1/2" /><div className="h-2 bg-border rounded w-3/4" /></div>
                <div className="h-6 bg-border rounded-full w-20" />
                <div className="h-3 bg-border rounded w-16" />
                <div className="h-2 bg-border rounded" />
                <div />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Ghost size={32} className="text-text-muted mb-3" />
            <div className="font-semibold text-text-secondary text-sm">No applications found</div>
            <div className="font-mono text-xs text-text-muted mt-1">{query ? `No results for "${query}"` : 'Try a different filter'}</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(app => (
              <div key={app.id} className="grid grid-cols-[2fr_1fr_1fr_1.5fr_80px] gap-4 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg flex items-center justify-center font-mono text-xs font-medium flex-shrink-0 bg-accent/10 text-accent">
                    {app.company.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-text-primary text-sm truncate">{app.company}</div>
                    <div className="font-mono text-xs text-text-muted truncate">{app.role}</div>
                  </div>
                </div>
                <div><StatusBadge status={app.status} size="sm" /></div>
                <div>
                  <div className="font-mono text-xs text-text-secondary">{format(new Date(app.appliedDate), 'MMM d')}</div>
                  <div className="font-mono text-[10px] text-text-muted mt-0.5">{formatDistanceToNow(new Date(app.appliedDate), { addSuffix: true })}</div>
                </div>
                <GhostMeter daysSinceActivity={app.daysSinceActivity} isGhosted={app.isGhosted} />
                <div className="flex items-center gap-1.5">
                  {app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 text-text-muted hover:text-accent transition-colors"><ExternalLink size={13} /></a>}
                  <button onClick={() => startEdit(app)} className="p-1.5 text-text-muted hover:text-accent transition-colors"><Pencil size={13} /></button>
                  {onDelete && <button onClick={() => onDelete(app.id)} className="p-1.5 text-text-muted hover:text-danger transition-colors"><Trash2 size={13} /></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
