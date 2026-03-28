import { Ghost, Mail, Shield, RefreshCw, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Mail,
    title: 'Auto-detect applications',
    desc: 'Scans for confirmation emails — no manual entry.',
  },
  {
    icon: RefreshCw,
    title: '30-day ghosting alerts',
    desc: 'Auto-labels silence as ghosted after one month.',
  },
  {
    icon: Shield,
    title: 'Read-only Gmail access',
    desc: 'We never modify, delete, or send anything.',
  },
];

export function Login() {
  const { signIn, enterDemoMode } = useAuth();

  return (
    <div className="min-h-screen bg-bg flex overflow-hidden relative">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#4fffb0 1px, transparent 1px), linear-gradient(90deg, #4fffb0 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/3 size-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 size-64 rounded-full bg-ghost/5 blur-3xl pointer-events-none" />

      {/* Left panel */}
      <div className="flex-1 flex flex-col justify-center px-16 py-12 relative z-10 max-w-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16">
          <div className="size-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center">
            <Ghost size={22} className="text-accent" />
          </div>
          <span className="font-display font-semibold text-lg text-text-primary tracking-wide">
            GhostTracker
          </span>
        </div>

        {/* Headline */}
        <div className="mb-10">
          <h1 className="font-display font-semibold text-5xl text-text-primary leading-tight mb-4">
            Stop wondering
            <br />
            <span className="text-accent">who ghosted you.</span>
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Connect your Gmail once. We'll automatically track every job
            application and flag companies that have gone silent.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-5 mb-12">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="size-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon size={15} className="text-ghost" />
              </div>
              <div>
                <div className="font-medium text-text-primary text-sm">{title}</div>
                <div className="font-mono text-xs text-text-muted mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 max-w-sm">
          <button
            onClick={signIn}
            className="flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl bg-accent text-bg font-semibold text-sm hover:bg-accent/90 transition-all active:scale-[0.98] shadow-lg shadow-accent/20"
          >
            {/* Google G logo */}
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={enterDemoMode}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-surface border border-border text-text-secondary font-medium text-sm hover:text-text-primary hover:border-muted transition-all"
          >
            <Sparkles size={15} className="text-warn" />
            Try demo mode
          </button>
        </div>

        <p className="font-mono text-xs text-text-muted mt-6 max-w-xs leading-relaxed">
          Read-only Gmail access. We never store your emails. Auth token lives in your browser only.
        </p>
      </div>

      {/* Right panel — decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative p-12">
        <div className="relative w-full max-w-sm">
          {/* Mock app card stack */}
          {[
            { company: 'Stripe', role: 'Sr. Engineer', status: 'ghosted', days: 45, offset: '-rotate-3 scale-95 translate-y-4', z: 'z-0' },
            { company: 'Vercel', role: 'DevEx Engineer', status: 'ghosted', days: 38, offset: 'rotate-1 scale-97 translate-y-2', z: 'z-10' },
            { company: 'Linear', role: 'Product Eng.', status: 'interviewing', days: 3, offset: 'rotate-0', z: 'z-20' },
          ].map(({ company, role, status, days, offset, z }) => (
            <div
              key={company}
              className={`absolute inset-x-0 bg-surface border border-border rounded-2xl p-5 ${offset} ${z} transition-all`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-text-primary text-sm">{company}</div>
                  <div className="font-mono text-xs text-text-muted">{role}</div>
                </div>
                <span
                  className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
                    status === 'ghosted'
                      ? 'text-warn bg-warn/10 border-warn/20'
                      : 'text-accent bg-accent/10 border-accent/20'
                  }`}
                >
                  {status === 'ghosted' ? '👻 Ghosted' : '⚡ Interviewing'}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${status === 'ghosted' ? 'bg-warn' : 'bg-accent'}`}
                  style={{ width: status === 'ghosted' ? '100%' : '30%' }}
                />
              </div>
              <div className="font-mono text-xs text-text-muted mt-2">
                {days}d since last activity
              </div>
            </div>
          ))}
          {/* Spacer for card stack height */}
          <div className="h-44" />
        </div>
      </div>
    </div>
  );
}
