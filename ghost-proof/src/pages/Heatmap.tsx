import { mockSkillGaps } from '../lib/mockData';
import { useStore } from '../hooks/useStore';
import { Flame } from 'lucide-react';
import clsx from 'clsx';

const typeConfig = {
  resume: { label: 'Resume-screen gap', color: 'bg-red-500/20 border-red-500/40 text-red-400', dot: 'bg-red-500' },
  depth:  { label: 'Depth gap (post-interview)', color: 'bg-amber-500/20 border-amber-500/40 text-amber-400', dot: 'bg-amber-400' },
  soft:   { label: 'Soft skill gap', color: 'bg-zinc-500/20 border-zinc-500/40 text-zinc-400', dot: 'bg-zinc-500' },
};

const sizeMap = [80, 72, 64, 64, 58, 50, 50, 44, 40];

export function Heatmap() {
  const { applications } = useStore();

  // Merge mock + any extracted gaps from applications
  const allGaps = [...mockSkillGaps];
  applications.forEach(app => {
    app.skillGaps?.forEach(sg => {
      const existing = allGaps.find(g => g.name === sg);
      if (!existing) allGaps.push({ name: sg, count: 1, type: 'depth' });
    });
  });

  const sorted = [...allGaps].sort((a, b) => b.count - a.count);

  return (
    <div className="p-7 animate-fade-in">
      <div className="flex items-center gap-2 mb-1">
        <Flame size={16} className="text-brand-accent" />
        <h1 className="font-display text-lg font-bold text-white">Skill Gap Heatmap</h1>
      </div>
      <p className="text-[12px] text-brand-muted font-mono mb-6">
        Aggregated from all rejections. Bigger = more frequent. Red = resume-level gap, act now.
      </p>

      {/* Bubble grid */}
      <div className="bg-brand-surface border border-white/[0.08] rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end justify-start">
          {sorted.map((gap, i) => {
            const size = sizeMap[i] ?? 38;
            const cfg = typeConfig[gap.type];
            return (
              <div
                key={gap.name}
                className={clsx(
                  'rounded-xl border flex flex-col items-center justify-center p-3 transition-transform hover:scale-105 cursor-default',
                  cfg.color
                )}
                style={{ width: size * 1.8, height: size }}
                title={`${gap.count} rejections flagged this skill`}
              >
                <div
                  className="font-mono font-medium text-center leading-tight"
                  style={{ fontSize: Math.max(9, size / 7) }}
                >
                  {gap.name}
                </div>
                <div className="text-[9px] opacity-60 mt-0.5 font-mono">{gap.count}× flagged</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-5 mb-8">
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2 text-[11px] text-brand-muted font-mono">
            <span className={clsx('w-2.5 h-2.5 rounded-sm inline-block', cfg.dot)} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Table view */}
      <div className="bg-brand-surface border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/[0.08]">
          <span className="text-[11px] uppercase tracking-widest text-brand-muted font-mono">Detailed Breakdown</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {['Skill', 'Frequency', 'Gap Type', 'Priority Action'].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-[10px] uppercase tracking-widest text-brand-muted font-mono font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((gap, i) => (
              <tr key={gap.name} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 text-[12px] text-white font-mono">{gap.name}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-brand-surface2 rounded-full overflow-hidden">
                      <div
                        className={clsx('h-full rounded-full', typeConfig[gap.type].dot)}
                        style={{ width: `${(gap.count / sorted[0].count) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-brand-muted font-mono">{gap.count}×</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={clsx('text-[10px] px-2 py-1 rounded border font-mono uppercase tracking-wider', typeConfig[gap.type].color)}>
                    {gap.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-[11px] text-brand-muted font-mono">
                  {gap.type === 'resume' && 'Add to resume + build a project around it'}
                  {gap.type === 'depth' && 'Deep-dive course or open-source contribution'}
                  {gap.type === 'soft' && 'Mock interviews + behavioral prep'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
