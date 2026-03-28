import clsx from 'clsx';

interface Props {
  daysSinceActivity: number;
  isGhosted: boolean;
  className?: string;
}

const GHOSTED_THRESHOLD = 30;

export function GhostMeter({ daysSinceActivity, isGhosted, className }: Props) {
  const pct = Math.min((daysSinceActivity / GHOSTED_THRESHOLD) * 100, 100);

  const color =
    pct >= 100
      ? 'bg-warn'
      : pct >= 66
      ? 'bg-warn/60'
      : pct >= 33
      ? 'bg-ghost/80'
      : 'bg-accent/60';

  const label =
    isGhosted
      ? 'Ghosted'
      : daysSinceActivity === 0
      ? 'Today'
      : `${daysSinceActivity}d silent`;

  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <div className="relative h-1.5 flex-1 rounded-full bg-border overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-700', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={clsx(
          'font-mono text-[11px] sm:text-xs w-auto sm:w-16 text-left sm:text-right flex-shrink-0',
          isGhosted ? 'text-warn' : 'text-text-muted'
        )}
      >
        {label}
      </span>
    </div>
  );
}
