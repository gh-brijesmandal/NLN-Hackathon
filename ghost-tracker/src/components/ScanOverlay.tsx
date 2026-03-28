import { Ghost } from 'lucide-react';
import type { ScanState } from '../types';

interface Props {
  scan: ScanState;
}

export function ScanOverlay({ scan }: Props) {
  const pct = scan.total > 0 ? Math.round((scan.progress / scan.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-6">
        {/* Animated ghost */}
        <div className="animate-float">
          <div className="relative">
            <div className="size-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Ghost size={40} className="text-accent" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border border-accent/30 animate-ping opacity-30" />
          </div>
        </div>

        <div>
          <div className="font-display font-semibold text-xl text-text-primary mb-1">
            Scanning your inbox
          </div>
          <div className="font-mono text-sm text-text-secondary">{scan.currentLabel}</div>
        </div>

        {/* Progress bar */}
        <div className="w-full">
          <div className="h-1 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="font-mono text-xs text-text-muted mt-2 text-center">{pct}%</div>
        </div>
      </div>
    </div>
  );
}
