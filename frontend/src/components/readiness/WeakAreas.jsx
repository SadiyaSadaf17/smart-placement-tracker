import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { EmptyState } from '../ui/PageState';

const variantBySeverity = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

export default function WeakAreas({ areas = [] }) {
  if (!areas.length) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No major weak areas"
        description="Your measured readiness categories are balanced right now."
      />
    );
  }

  return (
    <div className="space-y-3">
      {areas.map((area) => (
        <div
          key={area.key}
          className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700/50 dark:bg-slate-800/30"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{area.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{Math.round(area.score)}% current strength</p>
            </div>
          </div>
          <Badge variant={variantBySeverity[area.severity] || 'info'}>{area.severity}</Badge>
        </div>
      ))}
    </div>
  );
}
