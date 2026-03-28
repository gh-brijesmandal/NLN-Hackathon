import { useState } from 'react';
import { Settings as SettingsIcon, Check, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export function Settings() {
  const { apiKey, setApiKey } = useStore();
  const [key, setKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);

  function save() {
    setApiKey(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-7 max-w-2xl animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <SettingsIcon size={16} className="text-brand-accent" />
        <h1 className="font-display text-lg font-bold text-white">Settings</h1>
      </div>
      <p className="text-[12px] text-brand-muted font-mono mb-8">Configure your Ghost-Proof workspace.</p>

      {/* API Key */}
      <div className="bg-brand-surface border border-white/[0.08] rounded-xl p-5 mb-5">
        <div className="text-[11px] uppercase tracking-widest text-brand-muted font-mono mb-1">
          Anthropic API Key
        </div>
        <p className="text-[12px] text-white/60 font-mono mb-4 leading-relaxed">
          Required for the AI-powered Rejection Parser. Your key is stored in memory only and never leaves the browser.
          Get a key at{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-brand-accent hover:opacity-70 transition-opacity">
            console.anthropic.com
          </a>
        </p>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              className="w-full bg-brand-surface2 border border-white/[0.08] rounded-lg px-3 py-2.5 text-[12px] text-white font-mono outline-none focus:border-brand-accent/40 transition-colors pr-10 placeholder:text-brand-muted/50"
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white transition-colors"
            >
              {show ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
          <button
            onClick={save}
            className="flex items-center gap-2 bg-brand-accent text-brand-bg text-[12px] font-mono font-medium px-5 py-2.5 rounded-lg hover:opacity-88 transition-opacity"
          >
            {saved ? <><Check size={13} /> Saved!</> : 'Save Key'}
          </button>
        </div>
        {apiKey && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
            <Check size={11} /> API key is active — Rejection Parser is live.
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-brand-surface border border-white/[0.08] rounded-xl p-5">
        <div className="text-[11px] uppercase tracking-widest text-brand-muted font-mono mb-4">About</div>
        <div className="space-y-2 text-[12px] font-mono text-white/60 leading-relaxed">
          <p><span className="text-white/80">Ghost-Proof</span> — AI-powered job application intelligence.</p>
          <p>Built with React + TypeScript + Tailwind CSS. Powered by Claude (claude-sonnet-4-20250514).</p>
          <p className="text-brand-muted">
            The Rejection Parser uses Claude to cross-reference job descriptions against rejection emails
            and extract hidden skill gaps — turning "not a fit" into an actionable roadmap.
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { label: 'Ghost Probability Engine', desc: 'Exponential decay model per stage' },
            { label: 'Skill Gap Heatmap', desc: 'Aggregated from all rejections' },
            { label: 'AI Rejection Parser', desc: 'Claude Sonnet 4 — live inference' },
            { label: 'Application Tracker', desc: 'Full CRUD with status filters' },
          ].map(({ label, desc }) => (
            <div key={label} className="bg-brand-surface2 rounded-lg p-3">
              <div className="text-[11px] text-brand-accent font-mono mb-0.5">{label}</div>
              <div className="text-[10px] text-brand-muted font-mono">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
