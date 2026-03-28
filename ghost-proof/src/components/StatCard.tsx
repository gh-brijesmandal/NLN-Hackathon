import clsx from 'clsx';

interface Props {
  label: string;
  value: string | number;
  valueClass?: string;
  sub?: string;
}

export function StatCard({ label, value, valueClass, sub }: Props) {
  return (
    <div className="bg-brand-surface border border-white/[0.08] rounded-lg px-4 py-3 flex-1">
      <div className="text-[10px] text-brand-muted uppercase tracking-widest mb-1.5 font-mono">
        {label}
      </div>
      <div className={clsx('text-2xl font-display font-bold', valueClass ?? 'text-white')}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-brand-muted mt-0.5">{sub}</div>}
    </div>
  );
}
