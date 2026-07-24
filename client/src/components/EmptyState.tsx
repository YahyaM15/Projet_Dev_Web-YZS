import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-slate-300">{title}</h3>
      <p className="mb-4 max-w-xs text-xs text-slate-500">{description}</p>
      {action && (
        <button onClick={action.onClick} className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-medium text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">
          {action.label}
        </button>
      )}
    </div>
  );
}
