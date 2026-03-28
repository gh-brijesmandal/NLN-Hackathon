import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { GhostBar } from '../components/GhostBar';
import { mockSkillGaps } from '../lib/mockData';
import { calcGhostRisk } from '../lib/ghostRisk';
import clsx from 'clsx';

export function Dashboard() {
  const { applications } = useStore();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);

  const ghosted = applications.filter(a => calcGhostRisk(a.daysAgo, a.stage) > 0.7).length;
  const interviews = applications.filter(a => a.status === 'interview').length;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Stats bar */}
      <div className="flex gap-3 px-7 py-5 border-b border-white/[0.08]">
        <StatCard label="Applications" value={applications.length} valueClass="text-brand-accent" />
        <StatCard label="At Ghost Risk" value={ghosted} valueClass="text-red-400" sub="> 70% probability" />
        <StatCard label="Active Interviews" value={interviews} valueClass="text-emerald-400" />
        <StatCard label="Top Skill Gap" value="System Design" valueClass="text-amber-400 text-base mt-1" />
      </div>

      <div className="flex gap-6 p-7 flex-1 overflow-auto">
        {/* Left: Applications */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-widest text-brand-muted font-mono">
              Active Applications
            </span>
            <button
              onClick={() => navigate('/tracker')}
              className="text-[11px] text-brand-accent flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {applications.map(app => (
              <div
                key={app.id}
                onClick={() => setSelected(selected === app.id ? null : app.id)}
                className={clsx(
                  'bg-brand-surface border rounded-lg px-4 py-3 flex items-center gap-4 cursor-pointer transition-all duration-150',
                  selected === app.id
                    ? 'border-brand-accent/40 bg-brand-accent/[0.03]'
                    : 'border-white/[0.08] hover:border-white/[0.15]'
                )}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center text-sm font-display font-bold shrink-0"
                  style={{ background: app.bgColor, color: app.color }}
                >
                  {app.letter}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-white">{app.company}</div>
                  <div className="text-[11px] text-brand-muted truncate">{app.role}</div>
                </div>

                <div className="text-[11px] text-brand-muted shrink-0">{app.daysAgo}d ago</div>
                <GhostBar daysAgo={app.daysAgo} stage={app.stage} />
                <StatusBadge status={app.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Skill gaps + Ghost table */}
        <div className="w-64 flex flex-col gap-4 shrink-0">
          <div className="bg-brand-surface border border-white/[0.08] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={12} className="text-brand-accent" />
              <span className="text-[11px] uppercase tracking-widest text-brand-muted font-mono">
                Top Skill Gaps
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {mockSkillGaps.slice(0, 5).map(gap => (
                <div key={gap.name}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white/80">{gap.name}</span>
                    <span className={clsx(
                      gap.count >= 4 ? 'text-red-400' : gap.count >= 3 ? 'text-amber-400' : 'text-brand-muted'
                    )}>
                      {gap.count}x
                    </span>
                  </div>
                  <div className="h-1 bg-brand-surface2 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full',
                        gap.count >= 4 ? 'bg-red-500' : gap.count >= 3 ? 'bg-amber-400' : 'bg-brand-muted'
                      )}
                      style={{ width: `${(gap.count / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/heatmap')}
              className="mt-4 w-full text-[11px] text-brand-accent flex items-center justify-center gap-1 hover:opacity-70 transition-opacity"
            >
              Full heatmap <ArrowRight size={11} />
            </button>
          </div>

          <div className="bg-brand-surface border border-white/[0.08] rounded-lg p-4">
            <div className="text-[11px] uppercase tracking-widest text-brand-muted font-mono mb-3">
              Ghost Thresholds
            </div>
            {[
              { stage: 'Applied', days: '>14d', risk: '85%', color: 'text-red-400' },
              { stage: '1st Interview', days: '>7d', risk: '60%', color: 'text-amber-400' },
              { stage: 'Final Round', days: '>5d', risk: '40%', color: 'text-amber-400' },
              { stage: 'Offer Stage', days: '>2d', risk: '5%', color: 'text-emerald-400' },
            ].map(row => (
              <div key={row.stage} className="flex justify-between text-[11px] py-1.5 border-b border-white/[0.05] last:border-0">
                <span className="text-white/60">{row.stage} <span className="text-brand-muted">({row.days})</span></span>
                <span className={clsx('font-mono font-medium', row.color)}>{row.risk}</span>
              </div>
            ))}
            {ghosted > 0 && (
              <div className="mt-3 p-2.5 bg-red-500/5 border border-red-500/15 rounded text-[11px] text-red-400 leading-relaxed">
                {ghosted} app{ghosted > 1 ? 's' : ''} past ghost threshold. Archive and move on.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
