import type { LucideIcon } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'default' | 'accent' | 'warn' | 'danger';
  suffix?: string;
}

const accentMap = {
  default: 'text-ghost bg-ghost/10',
  accent: 'text-accent bg-accent/10',
  warn: 'text-warn bg-warn/10',
  danger: 'text-danger bg-danger/10',
};

export function StatCard({ label, value, icon: Icon, accent = 'default', suffix }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-muted transition-colors">
      <div className={clsx('p-2.5 rounded-lg', accentMap[accent])}>
        <Icon size={18} />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl sm:text-2xl font-display font-semibold text-text-primary">{value}</span>
          {suffix && <span className="font-mono text-xs text-text-muted">{suffix}</span>}
        </div>
        <div className="text-xs font-mono text-text-secondary mt-0.5">{label}</div>
      </div>
    </div>
  );
}
