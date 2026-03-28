import clsx from 'clsx';
import type { AppStatus } from '../types';

const config: Record<AppStatus, { label: string; className: string }> = {
  ghosted:  { label: 'Ghosted',   className: 'bg-red-500/10 text-red-400 border border-red-500/20' },
  rejected: { label: 'Rejected',  className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
  pending:  { label: 'Pending',   className: 'bg-sky-500/10 text-sky-400 border border-sky-500/20' },
  interview:{ label: 'Interview', className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
  offer:    { label: 'Offer 🎉',  className: 'bg-brand-accent/10 text-brand-accent border border-brand-accent/20' },
};

export function StatusBadge({ status }: { status: AppStatus }) {
  const { label, className } = config[status];
  return (
    <span className={clsx('text-[10px] px-2 py-1 rounded uppercase tracking-wider font-mono font-medium', className)}>
      {label}
    </span>
  );
}
