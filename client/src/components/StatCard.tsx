import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: 'cyan' | 'amber' | 'rose';
}

export function StatCard({ icon: Icon, label, value, sublabel, accent }: StatCardProps) {
  const accentBorder = accent === 'cyan' ? 'border-cyan-500/20' : accent === 'amber' ? 'border-amber-500/20' : accent === 'rose' ? 'border-rose-500/20' : 'border-white/10';
  const accentBg = accent === 'cyan' ? 'bg-cyan-500/[0.04]' : accent === 'amber' ? 'bg-amber-500/[0.04]' : accent === 'rose' ? 'bg-rose-500/[0.04]' : 'bg-white/[0.04]';
  const iconColor = accent === 'cyan' ? 'text-cyan-400 bg-cyan-500/10' : accent === 'amber' ? 'text-amber-400 bg-amber-500/10' : accent === 'rose' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-white/5';

  return (
    <div className={`rounded-2xl border ${accentBorder} ${accentBg} backdrop-blur-md p-5`}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-slate-100">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}
