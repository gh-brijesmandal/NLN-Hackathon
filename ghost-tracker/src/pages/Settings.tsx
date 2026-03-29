import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Ghost, Bot, Mail, Check, Eye, EyeOff, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loadAISettings, saveAISettings, loadGhostDays, saveGhostDays, clearAllData } from '../lib/storage';
import type { AISettings } from '../types';

const PROVIDERS: { value: AISettings['provider']; label: string; models: string[]; free?: boolean }[] = [
  { value: 'anthropic', label: 'Anthropic (Claude)', models: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'] },
];

export function Settings() {
  const { auth, signOut, isDemoMode } = useAuth();
  const [ghostDays, setGhostDays] = useState(30);
  const [aiSettings, setAISettings] = useState<Partial<AISettings>>({ provider: 'anthropic', model: 'claude-haiku-4-5-20251001', apiKey: '' });
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [claudeTestStatus, setClaudeTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [claudeTestMessage, setClaudeTestMessage] = useState<string>('');

  useEffect(() => {
    setGhostDays(loadGhostDays());
    const ai = loadAISettings();
    if (ai) {
      setAISettings({
        provider: 'anthropic',
        model: ai.model || 'claude-haiku-4-5-20251001',
        apiKey: ai.apiKey,
      });
    }
  }, []);

  const flash = (key: string) => { setSaved(key); setTimeout(() => setSaved(null), 2000); };

  const handleSaveGhost = () => { saveGhostDays(ghostDays); flash('ghost'); };
  const handleSaveAI = () => {
    if (!aiSettings.model) return;
    saveAISettings({
      provider: 'anthropic',
      model: aiSettings.model,
      apiKey: aiSettings.apiKey ?? '',
    } as AISettings);
    flash('ai');
  };

  const handleTestClaude = async () => {
    const envKey = (import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined)?.trim();
    const envModel = (import.meta.env.VITE_ANTHROPIC_MODEL as string | undefined)?.trim();
    const key = envKey || aiSettings.apiKey?.trim();
    const model = envModel || aiSettings.model || 'claude-haiku-4-5-20251001';

    if (!key) {
      setClaudeTestStatus('error');
      setClaudeTestMessage('No Anthropic key found. Set VITE_ANTHROPIC_API_KEY in .env or add API key below.');
      return;
    }

    setClaudeTestStatus('testing');
    setClaudeTestMessage('Testing Claude connection...');

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model,
          max_tokens: 16,
          system: 'Reply with OK only.',
          messages: [{ role: 'user', content: 'Health check' }],
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const details = typeof data?.error?.message === 'string'
          ? data.error.message
          : typeof data?.message === 'string'
            ? data.message
            : '';
        setClaudeTestStatus('error');
        setClaudeTestMessage(`Claude test failed (${res.status})${details ? `: ${details}` : ''}`);
        return;
      }

      setClaudeTestStatus('ok');
      setClaudeTestMessage('Claude connection succeeded. You should now see api.anthropic.com in Network logs.');
    } catch (error) {
      setClaudeTestStatus('error');
      setClaudeTestMessage(error instanceof Error
        ? `Claude test request failed: ${error.message}`
        : 'Claude test request failed.');
    }
  };
  const handleClearAll = () => { clearAllData(); setShowClearConfirm(false); window.location.reload(); };

  const selectedProvider = PROVIDERS.find(p => p.value === aiSettings.provider);

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <SettingsIcon size={20} className="text-accent" />
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary">Settings</h1>
        </div>
        <p className="font-mono text-xs text-text-muted">All settings are stored in your browser only.</p>
      </div>

      {/* Account */}
      <section className="mb-5">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Account</div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex items-center gap-4">
            {auth.userAvatar ? (
              <img src={auth.userAvatar} alt="" className="size-12 rounded-xl ring-1 ring-border flex-shrink-0" />
            ) : (
              <div className="size-12 rounded-xl bg-ghost/20 flex items-center justify-center font-display text-xl text-ghost flex-shrink-0">
                {(auth.userName ?? 'D').charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary truncate">{auth.userName ?? 'Demo User'}</div>
              <div className="font-mono text-xs text-text-muted truncate mt-0.5">{auth.userEmail ?? 'demo mode'}</div>
              {isDemoMode && <span className="inline-block mt-1.5 font-mono text-[10px] px-2 py-0.5 bg-accent/10 text-accent border border-accent/20 rounded-full">DEMO MODE</span>}
            </div>
            <button onClick={signOut} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-danger/10 text-danger border border-danger/20 font-mono text-xs hover:bg-danger/20 transition-all flex-shrink-0">
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </section>

      {/* AI Model */}
      <section className="mb-5">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">AI Model</div>
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-accent" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">Claude API Key</div>
              <div className="font-mono text-xs text-text-muted mt-0.5">GhostTracker is now configured for Claude-only AI and email parsing.</div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1.5">Provider</label>
              <select value={aiSettings.provider}
                onChange={e => { const p = e.target.value as AISettings['provider']; const prov = PROVIDERS.find(x => x.value === p); setAISettings(s => ({ ...s, provider: p, model: prov?.models[0] ?? '' })); }}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50">
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}{p.free ? ' 🆓' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1.5">Model</label>
              <select value={aiSettings.model}
                onChange={e => setAISettings(s => ({ ...s, model: e.target.value }))}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50">
                {selectedProvider?.models.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-text-muted mb-1.5">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={aiSettings.apiKey ?? ''}
                  onChange={e => setAISettings(s => ({ ...s, apiKey: e.target.value }))}
                  placeholder={`Paste your ${selectedProvider?.label} API key here`}
                  className="w-full pl-3 pr-10 py-2 bg-bg border border-border rounded-lg font-mono text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors"
                />
                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="p-3 bg-accent/8 border border-accent/20 rounded-lg font-mono text-xs text-accent/80">
              Claude key can come from Settings or from VITE_ANTHROPIC_API_KEY in .env (env takes precedence after restart).
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleTestClaude}
                disabled={claudeTestStatus === 'testing'}
                className="px-4 py-2 rounded-xl font-semibold text-sm bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-accent/40 transition-all disabled:opacity-60"
              >
                {claudeTestStatus === 'testing' ? 'Testing Claude...' : 'Test Claude Connection'}
              </button>
              {claudeTestStatus !== 'idle' && (
                <div className={`font-mono text-xs rounded-lg px-3 py-2 border ${claudeTestStatus === 'ok' ? 'text-accent bg-accent/10 border-accent/20' : claudeTestStatus === 'error' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-text-muted bg-bg border-border'}`}>
                  {claudeTestMessage}
                </div>
              )}
            </div>
          </div>

          <button onClick={handleSaveAI}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${saved === 'ai' ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-accent text-bg hover:bg-accent/90'}`}>
            {saved === 'ai' ? <><Check size={14} /> Saved!</> : 'Save AI Settings'}
          </button>
        </div>
      </section>

      {/* Ghost threshold */}
      <section className="mb-5">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Ghost Detection</div>
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-warn/10 flex items-center justify-center flex-shrink-0">
              <Ghost size={15} className="text-warn" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-text-primary text-sm">Ghosting threshold</div>
              <div className="font-mono text-xs text-text-muted mt-0.5">Mark as ghosted after this many days of no response</div>
              <div className="mt-3 flex items-center gap-4">
                <input type="range" min={7} max={60} step={7} value={ghostDays}
                  onChange={e => setGhostDays(Number(e.target.value))}
                  className="flex-1 accent-accent" />
                <div className="font-display font-semibold text-xl text-accent w-12 text-right">{ghostDays}d</div>
              </div>
            </div>
          </div>
          <button onClick={handleSaveGhost}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${saved === 'ghost' ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-accent text-bg hover:bg-accent/90'}`}>
            {saved === 'ghost' ? <><Check size={14} /> Saved!</> : 'Save Threshold'}
          </button>
        </div>
      </section>

      {/* Email integrations */}
      <section className="mb-5">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Email Integration</div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {[
            { icon: Mail, title: 'Gmail / Google', desc: 'Connect via OAuth to auto-detect application emails and status updates.', color: 'text-accent bg-accent/10' },
            { icon: Mail, title: 'Outlook / Microsoft', desc: 'Microsoft OAuth integration for Outlook email scanning. (Sign in from Login screen)', color: 'text-warn bg-warn/10' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-4 p-5">
              <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={15} /></div>
              <div>
                <div className="font-semibold text-text-primary text-sm">{title}</div>
                <div className="font-mono text-xs text-text-muted mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-5">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Privacy</div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {[
            { icon: Shield, title: 'Zero server storage', desc: 'Your profile, resume, applications, and API keys are stored only in your browser localStorage.', color: 'text-accent bg-accent/10' },
            { icon: Shield, title: 'Read-only email access', desc: 'GhostTracker can only read your emails — never send, modify, or delete.', color: 'text-accent bg-accent/10' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-4 p-5">
              <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}><Icon size={15} /></div>
              <div>
                <div className="font-semibold text-text-primary text-sm">{title}</div>
                <div className="font-mono text-xs text-text-muted mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger zone */}
      <section>
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Danger Zone</div>
        <div className="bg-surface border border-danger/20 rounded-2xl p-5">
          <div className="font-semibold text-text-primary text-sm mb-1">Clear all local data</div>
          <div className="font-mono text-xs text-text-muted mb-4">Deletes your profile, applications, AI key, and all settings from this browser.</div>
          {showClearConfirm ? (
            <div className="flex gap-3">
              <button onClick={handleClearAll} className="px-4 py-2 bg-danger text-white rounded-xl font-mono text-xs font-semibold hover:bg-danger/90 transition-all">
                Yes, delete everything
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 bg-surface border border-border text-text-muted rounded-xl font-mono text-xs hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-danger/10 border border-danger/20 text-danger rounded-xl font-mono text-xs hover:bg-danger/20 transition-all">
              <Trash2 size={13} /> Clear All Data
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
