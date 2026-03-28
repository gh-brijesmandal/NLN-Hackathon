import { calcGhostRisk, ghostBarColor, ghostRiskColor } from '../lib/ghostRisk';
import type { AppStage } from '../types';
import clsx from 'clsx';

interface Props {
  daysAgo: number;
  stage: AppStage;
  showLabel?: boolean;
}

export function GhostBar({ daysAgo, stage, showLabel = true }: Props) {
  const risk = calcGhostRisk(daysAgo, stage);
  const pct = Math.round(risk * 100);

  return (
    <div className="w-24">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-brand-muted">Ghost %</span>
          <span className={clsx('text-[10px] font-mono font-medium', ghostRiskColor(risk))}>
            {pct}%
          </span>
        </div>
      )}
      <div className="h-1 bg-brand-surface2 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', ghostBarColor(risk))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
