import { Lightbulb } from 'lucide-react';
import Badge from '../ui/Badge';
import { EmptyState } from '../ui/PageState';

const variantByPriority = {
  high: 'danger',
  medium: 'warning',
  low: 'info',
};

export default function SuggestionList({ suggestions = [] }) {
  if (!suggestions.length) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No urgent suggestions"
        description="Keep your profile fresh as your applications and interviews progress."
      />
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => (
        <div
          key={suggestion.key}
          className="rounded-xl border border-slate-200/70 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-900/40"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="mt-0.5 rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <Lightbulb size={18} />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{suggestion.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{suggestion.description}</p>
              </div>
            </div>
            <Badge variant={variantByPriority[suggestion.priority] || 'info'}>{suggestion.priority}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
