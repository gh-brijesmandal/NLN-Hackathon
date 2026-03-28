import type { ApplicationStatus } from '../types';
import clsx from 'clsx';

const CONFIG: Record<ApplicationStatus, { label: string; classes: string; dot: string }> = {
  applied: {
    label: 'Applied',
    classes: 'bg-ghost/10 text-ghost border-ghost/20',
    dot: 'bg-ghost',
  },
  screening: {
    label: 'Screening',
    classes: 'bg-accent/10 text-accent border-accent/20',
    dot: 'bg-accent animate-pulse',
  },
  interviewing: {
    label: 'Interviewing',
    classes: 'bg-accent/15 text-accent border-accent/30',
    dot: 'bg-accent',
  },
  offer: {
    label: 'Offer 🎉',
    classes: 'bg-accent/20 text-accent border-accent/40',
    dot: 'bg-accent',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-danger/10 text-danger border-danger/20',
    dot: 'bg-danger',
  },
  ghosted: {
    label: 'Ghosted 👻',
    classes: 'bg-warn/10 text-warn border-warn/20',
    dot: 'bg-warn animate-pulse',
  },
  withdrawn: {
    label: 'Withdrawn',
    classes: 'bg-muted/20 text-text-secondary border-border',
    dot: 'bg-muted',
  },
};

interface Props {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const { label, classes, dot } = CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-mono font-medium',
        classes,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
      )}
    >
      <span className={clsx('size-1.5 rounded-full flex-shrink-0', dot)} />
      {label}
    </span>
  );
}
