import type { AppStage } from '../types';

const BENCHMARKS: Record<AppStage, number> = {
  applied: 14,
  interviewed: 7,
  final_round: 4,
  offer: 2,
};

export function calcGhostRisk(daysAgo: number, stage: AppStage): number {
  const limit = BENCHMARKS[stage] ?? 10;
  return Math.min(daysAgo / (limit * 1.5), 1.0);
}

export function ghostRiskLabel(risk: number): string {
  if (risk >= 0.85) return 'Archive and move on.';
  if (risk >= 0.6) return 'Send a value follow-up.';
  if (risk >= 0.4) return 'High-stakes check-in advised.';
  return 'Still within response window.';
}

export function ghostRiskColor(risk: number): string {
  if (risk >= 0.7) return 'text-red-400';
  if (risk >= 0.4) return 'text-amber-400';
  return 'text-emerald-400';
}

export function ghostBarColor(risk: number): string {
  if (risk >= 0.7) return 'bg-red-500';
  if (risk >= 0.4) return 'bg-amber-400';
  return 'bg-emerald-400';
}
