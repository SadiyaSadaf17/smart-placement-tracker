import { AlertCircle, Inbox } from 'lucide-react';
import Button from './Button';
import { CardSkeleton } from './Skeleton';

export function LoadingGrid({ count = 3 }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </section>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <section className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
      <AlertCircle className="mt-0.5 shrink-0" size={22} />
      <section>
        <p className="font-semibold">{title}</p>
        {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Try again
          </Button>
        )}
      </section>
    </section>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <section className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/30">
      <Icon className="mb-4 text-slate-400" size={44} strokeWidth={1.5} />
      <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {action && <section className="mt-4">{action}</section>}
    </section>
  );
}
