import { useState } from 'react';
import { Globe, Search, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { fetchH1BCompanies } from '../lib/jobs';
import type { H1BCompany } from '../types';

export function H1BExplorer() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<H1BCompany[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [industry, setIndustry] = useState('all');

  const handleSearch = async () => {
    const data = await fetchH1BCompanies(query);
    setResults(data);
    setLoaded(true);
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  const industries = ['all', ...Array.from(new Set(results.map(r => r.industry ?? 'Other'))).sort()];
  const filtered = industry === 'all' ? results : results.filter(r => (r.industry ?? 'Other') === industry);

  const getCompanyLink = (company: H1BCompany) => company.website
    ?? `https://www.google.com/search?q=${encodeURIComponent(`${company.employer} official website`)}`;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Globe size={20} className="text-accent" />
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">H1B Sponsor Explorer</h1>
        </div>
        <p className="font-mono text-xs text-text-muted">Companies with strong history of sponsoring H1B visas. Data sourced from 2024-25 estimated petition filings.</p>
      </div>

      {/* Info banner */}
      <div className="mb-5 p-4 bg-surface border border-border rounded-xl flex items-start gap-3">
        <AlertCircle size={15} className="text-accent flex-shrink-0 mt-0.5" />
        <div className="font-mono text-xs text-text-muted leading-relaxed">
          These numbers reflect historical H1B approvals. Always verify current sponsorship policies directly with companies. Approval counts include renewals and transfers.
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder="Search company name (e.g. Google, Stripe)..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface border border-border rounded-xl font-mono text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
        <button onClick={handleSearch}
          className="px-5 py-2.5 bg-accent text-bg font-semibold text-sm rounded-xl hover:bg-accent/90 transition-all font-mono">
          Search
        </button>
      </div>

      {/* Quick buttons */}
      {!loaded && (
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="font-mono text-xs text-text-muted self-center">Browse by sector:</span>
          {['Tech', 'Consulting', 'IT Services', 'Fintech', 'Semiconductor', 'Finance'].map(s => (
            <button key={s} onClick={() => { setQuery(s); setTimeout(handleSearch, 50); }}
              className="px-3 py-1.5 bg-surface border border-border text-text-muted rounded-full font-mono text-xs hover:border-accent/30 hover:text-accent transition-colors">
              {s}
            </button>
          ))}
          <button onClick={() => { setQuery(''); setTimeout(handleSearch, 50); }}
            className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full font-mono text-xs hover:bg-accent/20 transition-colors">
            Show All
          </button>
        </div>
      )}

      {/* Industry filter tabs */}
      {loaded && filtered.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {industries.map(ind => (
            <button key={ind} onClick={() => setIndustry(ind)}
              className={`px-3 py-1.5 rounded-full font-mono text-xs border transition-all ${industry === ind ? 'bg-accent/15 border-accent/30 text-accent' : 'bg-surface border-border text-text-muted hover:border-muted'}`}>
              {ind === 'all' ? `All (${results.length})` : ind}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loaded && (
        <div>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Globe size={32} className="text-text-muted mb-3" />
              <div className="font-semibold text-text-secondary text-sm">No companies found</div>
              <div className="font-mono text-xs text-text-muted mt-1">Try a different search term</div>
            </div>
          ) : (
            <>
              <div className="font-mono text-xs text-text-muted mb-3">{filtered.length} companies found</div>
              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[2.2fr_1.4fr_1fr_0.8fr] gap-4 px-5 py-2.5 border-b border-border mb-1">
                {['Company', 'Industry', 'Approvals', 'Year'].map(h => (
                  <div key={h} className="font-mono text-xs text-text-muted">{h}</div>
                ))}
              </div>
              <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {filtered.map((company, i) => {
                  return (
                    <a
                      key={`${company.employer}-${company.year}-${i}`}
                      href={getCompanyLink(company)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid grid-cols-1 sm:grid-cols-[2.2fr_1.4fr_1fr_0.8fr] gap-2 sm:gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center font-mono text-xs text-accent font-medium flex-shrink-0">
                          {company.employer.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-text-primary text-sm inline-flex items-center gap-1.5">
                          {company.employer}
                          <ExternalLink size={12} className="text-text-muted" />
                        </span>
                      </div>
                      <div className="font-mono text-xs text-text-muted sm:self-center">
                        <span className="sm:hidden text-text-muted">Industry: </span>{company.industry ?? 'N/A'}
                      </div>
                      <div className="flex items-center gap-1 sm:self-center">
                        <TrendingUp size={12} className="text-accent" />
                        <span className="font-mono text-xs text-text-secondary">{company.approvals.toLocaleString()}</span>
                      </div>
                      <div className="font-mono text-xs text-text-muted sm:self-center">{company.year}</div>
                    </a>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
