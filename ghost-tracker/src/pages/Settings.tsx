import { useState } from 'react';
import { Ghost, Shield, Bell, LogOut, Info, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { auth, signOut, isDemoMode } = useAuth();
  const [ghostDays, setGhostDays] = useState(30);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-8 animate-fade-in">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display font-semibold text-2xl sm:text-3xl text-text-primary mb-1">Settings</h1>
        <p className="font-mono text-xs text-text-muted">Manage your account and preferences</p>
      </div>

      {/* Account */}
      <section className="mb-6">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Account</div>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {auth.userAvatar ? (
              <img src={auth.userAvatar} alt="" className="size-12 rounded-xl ring-1 ring-border" />
            ) : (
              <div className="size-12 rounded-xl bg-ghost/20 flex items-center justify-center font-display text-xl text-ghost">
                {(auth.userName ?? 'D').charAt(0)}
              </div>
            )}
            <div>
              <div className="font-semibold text-text-primary">
                {auth.userName ?? 'Demo User'}
              </div>
              <div className="font-mono text-xs text-text-muted mt-0.5">
                {auth.userEmail ?? 'demo mode'}
              </div>
              {isDemoMode && (
                <span className="inline-block mt-1.5 font-mono text-[10px] px-2 py-0.5 bg-warn/10 text-warn border border-warn/20 rounded-full">
                  DEMO MODE
                </span>
              )}
            </div>
            <button
              onClick={signOut}
              className="w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-danger/10 text-danger border border-danger/20 font-mono text-xs hover:bg-danger/20 transition-all"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </section>

      {/* Ghosting threshold */}
      <section className="mb-6">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">
          Ghost Detection
        </div>
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-lg bg-warn/10 flex items-center justify-center flex-shrink-0">
              <Ghost size={15} className="text-warn" />
            </div>
            <div>
              <div className="font-semibold text-text-primary text-sm">Ghosting threshold</div>
              <div className="font-mono text-xs text-text-muted mt-0.5">
                Mark as ghosted after this many days of no response
              </div>
            </div>
          </div>

          <div className="pl-0 sm:pl-11">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <input
                type="range"
                min={7}
                max={60}
                step={7}
                value={ghostDays}
                onChange={e => setGhostDays(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <div className="font-display font-semibold text-2xl text-accent w-full sm:w-16 text-left sm:text-right">
                {ghostDays}d
              </div>
            </div>
            <div className="flex justify-between font-mono text-xs text-text-muted mt-1">
              <span>1 week</span>
              <span>2 months</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="mb-6">
        <div className="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Privacy</div>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {[
            {
              icon: Shield,
              title: 'Read-only Gmail access',
              desc: 'GhostTracker can only read your emails — never send, modify, or delete.',
              color: 'text-accent bg-accent/10',
            },
            {
              icon: Info,
              title: 'No email storage',
              desc: 'Email content is never stored on our servers. Everything stays in your browser.',
              color: 'text-ghost bg-ghost/10',
            },
            {
              icon: Bell,
              title: 'Token stays local',
              desc: 'Your Google OAuth token lives in memory and is cleared when you sign out.',
              color: 'text-ghost bg-ghost/10',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-4 p-5">
              <div className={`size-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={15} />
              </div>
              <div>
                <div className="font-semibold text-text-primary text-sm">{title}</div>
                <div className="font-mono text-xs text-text-muted mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
          saved
            ? 'bg-accent/20 text-accent border border-accent/30'
            : 'bg-accent text-bg hover:bg-accent/90 shadow-lg shadow-accent/20'
        }`}
      >
        {saved ? (
          <>
            <Check size={15} /> Saved!
          </>
        ) : (
          'Save preferences'
        )}
      </button>
    </div>
  );
}
