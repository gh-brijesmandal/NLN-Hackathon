import { useState, useEffect } from 'react';
import { Briefcase, ExternalLink, RefreshCw, Sparkles, MapPin, DollarSign, Filter } from 'lucide-react';
import { loadProfile } from '../lib/storage';
import { fetchJobSuggestions } from '../lib/jobs';
import type { JobSuggestion, UserProfile } from '../types';

export function JobBoard() {
  const [jobs, setJobs] = useState<JobSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'remote' | 'h1b'>('all');

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
  }, []);

  const loadJobs = async (p?: UserProfile | null) => {
    const prof = p ?? profile;
    if (!prof) return;
    setLoading(true);
    try {
      const fetched = await fetchJobSuggestions(prof);
      setJobs(fetched);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) loadJobs(profile);
  }, [profile]);

  const filtered = jobs.filter(j => {
    const q = query.toLowerCase();
    const matchesQ = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q);
    const matchesFilter = filter === 'all' || (filter === 'remote' && j.location.toLowerCase().includes('remote')) || (filter === 'h1b' && j.sponsorsH1B);
    return matchesQ && matchesFilter;
  });

  const noProfile = !profile?.targetRoles?.length;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Briefcase size={20} className="text-accent" />
            <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">Job Board</h1>
          </div>
          <p className="font-mono text-xs text-text-muted">Live jobs matched to your profile via Remotive.</p>
        </div>
        <button onClick={() => loadJobs()} disabled={loading || noProfile}
          className="flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 text-accent rounded-xl hover:bg-accent/20 transition-all font-mono text-xs disabled:opacity-50 self-start sm:self-auto">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {noProfile && (
        <div className="mb-5 p-4 bg-surface border border-border rounded-xl flex items-center gap-3">
          <Sparkles size={15} className="text-accent flex-shrink-0" />
          <p className="font-mono text-xs text-text-muted">
            Add target roles in your <a href="/profile" className="text-accent underline">Profile</a> to get personalized job suggestions.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Filter by title, company, location..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl font-mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
        <div className="flex gap-2">
          {(['all', 'remote', 'h1b'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl font-mono text-xs transition-all border ${filter === f ? 'bg-accent/15 border-accent/30 text-accent' : 'bg-surface border-border text-text-muted hover:border-muted'}`}>
              {f === 'all' ? 'All' : f === 'remote' ? '🌐 Remote' : '🛂 H1B'}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="size-12 rounded-xl bg-border flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-border rounded w-1/3" />
                  <div className="h-3 bg-border rounded w-1/4" />
                  <div className="h-3 bg-border rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase size={32} className="text-text-muted mb-3" />
          <div className="font-semibold text-text-secondary text-sm">No jobs found</div>
          <div className="font-mono text-xs text-text-muted mt-1">Try adjusting filters or refreshing</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(job => <JobCard key={job.id} job={job} />)}
        </div>
      )}
    </div>
  );
}

function JobCard({ job }: { job: JobSuggestion }) {
  const initials = job.company.slice(0, 2).toUpperCase();
  const scoreColor = (job.matchScore ?? 0) >= 80 ? 'text-accent' : (job.matchScore ?? 0) >= 60 ? 'text-warn' : 'text-text-muted';

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-muted transition-colors group">
      <div className="flex items-start gap-4">
        <div className="size-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center font-mono text-sm font-medium text-accent flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
            <div>
              <div className="font-semibold text-text-primary text-sm">{job.title}</div>
              <div className="font-mono text-xs text-text-secondary">{job.company}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {job.matchScore && (
                <span className={`font-mono text-xs font-semibold ${scoreColor}`}>{job.matchScore}% match</span>
              )}
              {job.sponsorsH1B && (
                <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-full font-mono text-[10px]">H1B ✓</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mb-3">
            <span className="flex items-center gap-1 font-mono text-xs text-text-muted"><MapPin size={11} />{job.location}</span>
            {job.salary && <span className="flex items-center gap-1 font-mono text-xs text-text-muted"><DollarSign size={11} />{job.salary}</span>}
            <span className="font-mono text-xs text-text-muted">{job.type}</span>
            <span className="font-mono text-xs text-text-muted">{job.source}</span>
          </div>
          {job.description && (
            <p className="font-mono text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">{job.description}</p>
          )}
          <a href={job.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-bg rounded-lg font-mono text-xs font-semibold hover:bg-accent/90 transition-colors">
            Apply <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}
