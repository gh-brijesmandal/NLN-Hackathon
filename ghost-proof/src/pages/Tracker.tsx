import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { StatusBadge } from '../components/StatusBadge';
import { GhostBar } from '../components/GhostBar';
import { calcGhostRisk, ghostRiskLabel } from '../lib/ghostRisk';
import type { Application, AppStatus, AppStage } from '../types';
import clsx from 'clsx';

function AddModal({ onClose }: { onClose: () => void }) {
  const { addApplication } = useStore();
  const [form, setForm] = useState({ company: '', role: '', stage: 'applied' as AppStage, daysAgo: '0' });

  const colors = ['#6bc5ff','#ff6b6b','#c8f55a','#44cc88','#ffaa33','#c084fc'];
  const bgs   = ['rgba(107,197,255,0.15)','rgba(255,107,107,0.15)','rgba(200,245,90,0.15)',
                  'rgba(68,204,136,0.15)','rgba(255,170,51,0.15)','rgba(192,132,252,0.15)'];
  const pick = Math.floor(Math.random() * colors.length);

  function submit() {
    if (!form.company || !form.role) return;
    const app: Application = {
      id: Date.now().toString(),
      company: form.company,
      role: form.role,
      stage: form.stage,
      status: 'pending' as AppStatus,
      appliedDate: new Date().toISOString().split('T')[0],
      daysAgo: parseInt(form.daysAgo) || 0,
      color: colors[pick],
      bgColor: bgs[pick],
      letter: form.company[0].toUpperCase(),
    };
    addApplication(app);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-brand-surface border border-white/[0.12] rounded-xl p-6 w-[420px] animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <span className="font-display font-bold text-white text-base">Add Application</span>
          <button onClick={onClose} className="text-brand-muted hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {[
          { label: 'Company', key: 'company', placeholder: 'e.g. Stripe' },
          { label: 'Role', key: 'role', placeholder: 'e.g. Full Stack Intern' },
        ].map(({ label, key, placeholder }) => (
          <div key={key} className="mb-4">
            <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-1.5">{label}</label>
            <input
              value={(form as Record<string, string>)[key]}
              onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full bg-brand-surface2 border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white font-mono outline-none focus:border-brand-accent/40 transition-colors placeholder:text-brand-muted/50"
            />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-1.5">Stage</label>
            <select
              value={form.stage}
              onChange={e => setForm(f => ({ ...f, stage: e.target.value as AppStage }))}
              className="w-full bg-brand-surface2 border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white font-mono outline-none focus:border-brand-accent/40 transition-colors"
            >
              <option value="applied">Applied</option>
              <option value="interviewed">Interviewed</option>
              <option value="final_round">Final Round</option>
              <option value="offer">Offer</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-brand-muted font-mono mb-1.5">Days Since Applied</label>
            <input
              type="number" min="0"
              value={form.daysAgo}
              onChange={e => setForm(f => ({ ...f, daysAgo: e.target.value }))}
              className="w-full bg-brand-surface2 border border-white/[0.08] rounded-lg px-3 py-2 text-[12px] text-white font-mono outline-none focus:border-brand-accent/40 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={submit}
          className="w-full bg-brand-accent text-brand-bg text-[12px] font-mono font-medium py-2.5 rounded-lg hover:opacity-88 transition-opacity"
        >
          Add Application
        </button>
      </div>
    </div>
  );
}

export function Tracker() {
  const { applications } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<AppStatus | 'all'>('all');

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.status === filter);

  return (
    <div className="p-7 animate-fade-in">
      {showModal && <AddModal onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-lg font-bold text-white mb-1">Applications</h1>
          <p className="text-[12px] text-brand-muted font-mono">{applications.length} total tracked</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-accent text-brand-bg text-[12px] font-mono font-medium px-4 py-2 rounded-lg hover:opacity-88 transition-opacity"
        >
          <Plus size={13} /> Add Application
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'interview', 'rejected', 'ghosted', 'offer'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'text-[11px] font-mono px-3 py-1.5 rounded border transition-all',
              filter === f
                ? 'border-brand-accent/40 bg-brand-accent/10 text-brand-accent'
                : 'border-white/[0.08] text-brand-muted hover:border-white/[0.15] hover:text-white'
            )}
          >
            {f === 'all' ? `All (${applications.length})` : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-brand-surface border border-white/[0.08] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              {['Company', 'Role', 'Applied', 'Stage', 'Ghost Risk', 'Status', 'Action'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] uppercase tracking-widest text-brand-muted font-mono font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(app => {
              const risk = calcGhostRisk(app.daysAgo, app.stage);
              return (
                <tr key={app.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-display font-bold shrink-0"
                        style={{ background: app.bgColor, color: app.color }}
                      >
                        {app.letter}
                      </div>
                      <span className="text-[12px] text-white font-mono">{app.company}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-brand-muted font-mono">{app.role}</td>
                  <td className="px-5 py-3 text-[12px] text-brand-muted font-mono">{app.daysAgo}d ago</td>
                  <td className="px-5 py-3">
                    <span className="text-[10px] text-brand-muted bg-brand-surface2 px-2 py-1 rounded font-mono uppercase tracking-wider">
                      {app.stage}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <GhostBar daysAgo={app.daysAgo} stage={app.stage} />
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={app.status} /></td>
                  <td className="px-5 py-3 text-[11px] text-brand-muted font-mono">
                    {risk > 0.7
                      ? <span className="text-red-400">Archive</span>
                      : risk > 0.4
                      ? <span className="text-amber-400">Follow up</span>
                      : <span className="text-emerald-400">Wait</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-brand-muted font-mono text-[12px]">
            No applications match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
