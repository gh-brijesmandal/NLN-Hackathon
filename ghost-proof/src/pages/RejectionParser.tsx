import { useState } from 'react';
import { Zap, AlertTriangle, CheckCircle, ChevronRight, Info } from 'lucide-react';
import { useRejectionParser } from '../hooks/useRejectionParser';
import { useStore } from '../hooks/useStore';
import clsx from 'clsx';

const DEMO = {
  jd: `We are looking for a Software Engineer Intern with strong knowledge of distributed systems, Go or C++, Kubernetes, system design principles, and large-scale infrastructure. Experience with Docker, gRPC, and cloud platforms (GCP/AWS) is highly preferred.`,
  rejection: `Thank you for your interest in joining our team. After carefully reviewing your application and speaking with our team, we've decided to move forward with candidates whose experience more closely aligns with our current technical needs. We were impressed by your enthusiasm and encourage you to apply again in the future.`,
  resume: `Python, JavaScript, React, Node.js, basic AWS, 2 side projects (a todo app and a weather widget), no internship experience yet. Familiar with SQL and REST APIs.`,
};

export function RejectionParser() {
  const { apiKey } = useStore();
  const [jd, setJd] = useState('');
  const [rejection, setRejection] = useState('');
  const [resume, setResume] = useState('');
  const [localKey, setLocalKey] = useState(apiKey);
  const { analyze, loading, result, error } = useRejectionParser();

  function loadDemo() {
    setJd(DEMO.jd);
    setRejection(DEMO.rejection);
    setResume(DEMO.resume);
  }

  const ghostPct = result ? Math.round(result.ghosting_risk * 100) : null;

  return (
    <div className="p-7 max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={16} className="text-brand-accent" />
            <h1 className="font-display text-lg font-bold text-white">Rejection Parser</h1>
          </div>
          <p className="text-[12px] text-brand-muted font-mono">
            Claude reads between the lines and extracts hidden skill gaps from rejection emails.
          </p>
        </div>
        <button
          onClick={loadDemo}
          className="text-[11px] text-brand-accent border border-brand-accent/30 px-3 py-1.5 rounded hover:bg-brand-accent/5 transition-colors font-mono"
        >
          Load demo data
        </button>
      </div>

      {/* API Key input if not set */}
      {!apiKey && (
        <div className="mb-5 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg flex items-start gap-3">
          <Info size={14} className="text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="text-[12px] text-amber-400 font-mono mb-2">
              Enter your Anthropic API key to enable live analysis. Or use demo mode — it still works with mock responses.
            </div>
            <input
              type="password"
              value={localKey}
              onChange={e => setLocalKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-brand-surface2 border border-white/[0.08] rounded px-3 py-2 text-[12px] text-white font-mono outline-none focus:border-brand-accent/50 transition-colors placeholder:text-brand-muted"
            />
            <p className="text-[10px] text-brand-muted mt-1">
              Your key is stored in memory only. Go to Settings to save it. Get a key at console.anthropic.com
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-2">
            Job Description
          </label>
          <textarea
            value={jd}
            onChange={e => setJd(e.target.value)}
            rows={8}
            placeholder="Paste the job description here..."
            className="w-full bg-brand-surface border border-white/[0.08] rounded-lg px-3 py-2.5 text-[12px] text-white font-mono outline-none focus:border-brand-accent/40 transition-colors resize-none placeholder:text-brand-muted/50"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-2">
            Rejection Email
          </label>
          <textarea
            value={rejection}
            onChange={e => setRejection(e.target.value)}
            rows={8}
            placeholder="Paste the rejection email here..."
            className="w-full bg-brand-surface border border-white/[0.08] rounded-lg px-3 py-2.5 text-[12px] text-white font-mono outline-none focus:border-brand-accent/40 transition-colors resize-none placeholder:text-brand-muted/50"
          />
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-2">
          Resume Summary <span className="text-brand-muted/50 normal-case tracking-normal">(optional but improves accuracy)</span>
        </label>
        <textarea
          value={resume}
          onChange={e => setResume(e.target.value)}
          rows={3}
          placeholder="Paste your key skills / resume summary..."
          className="w-full bg-brand-surface border border-white/[0.08] rounded-lg px-3 py-2.5 text-[12px] text-white font-mono outline-none focus:border-brand-accent/40 transition-colors resize-none placeholder:text-brand-muted/50"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          disabled={loading || (!jd && !rejection)}
          onClick={() => analyze(jd, rejection, resume, localKey || apiKey)}
          className="flex items-center gap-2 bg-brand-accent text-brand-bg text-[12px] font-mono font-medium px-5 py-2.5 rounded-lg hover:opacity-88 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap size={13} />
          {loading ? 'Analyzing...' : 'Analyze Rejection'}
        </button>
        {loading && (
          <span className="text-[12px] text-brand-muted font-mono animate-pulse">
            Claude is reading between the lines...
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 p-4 bg-red-500/5 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <div className="text-[12px] text-red-400 font-mono">{error}</div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="mt-6 bg-brand-surface border border-white/[0.08] rounded-xl p-5 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-brand-accent" />
              <span className="text-[11px] uppercase tracking-widest text-brand-muted font-mono">Analysis Results</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-brand-muted font-mono">Ghost Risk:</span>
              <span className={clsx(
                'text-2xl font-display font-bold',
                ghostPct! >= 70 ? 'text-red-400' : ghostPct! >= 40 ? 'text-amber-400' : 'text-emerald-400'
              )}>
                {ghostPct}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-2">
                Technical Gaps
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.technical_gaps.map(gap => (
                  <span key={gap} className="text-[11px] px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-mono">
                    ⚠ {gap}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-2">
                Soft Skill Flags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.soft_skill_flags.length ? result.soft_skill_flags.map(flag => (
                  <span key={flag} className="text-[11px] px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono">
                    ◈ {flag}
                  </span>
                )) : <span className="text-[11px] text-brand-muted">None detected</span>}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-2">
                Recommended Action
              </div>
              <span className="text-[11px] px-2.5 py-1 bg-brand-accent/10 text-brand-accent border border-brand-accent/20 rounded font-mono">
                → {result.top_cert_recommendation}
              </span>
            </div>
          </div>

          <div className="border-l-2 border-brand-accent pl-4 py-1">
            <div className="text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-1">Next Move</div>
            <div className="flex items-start gap-2 text-[12px] text-white font-mono leading-relaxed">
              <ChevronRight size={13} className="text-brand-accent mt-0.5 shrink-0" />
              {result.next_move}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
