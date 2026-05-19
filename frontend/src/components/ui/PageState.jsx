import { AlertCircle, Inbox, CheckCircle, RefreshCw } from 'lucide-react';
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
    <section className="flex flex-col gap-4 rounded-2xl border-2 border-red-200/50 dark:border-red-900/30 bg-gradient-to-br from-red-50 to-red-50/50 dark:from-red-950/20 dark:to-red-950/10 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-3 text-red-600 dark:text-red-400">
          <AlertCircle size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-red-900 dark:text-red-200">{title}</p>
          {message && <p className="mt-1 text-sm text-red-800 dark:text-red-300">{message}</p>}
        </div>
      </div>
      {onRetry && (
        <div className="flex gap-2 pt-2">
          <Button variant="danger" size="sm" onClick={onRetry} icon={RefreshCw}>
            Try again
          </Button>
        </div>
      )}
    </section>
  );
}

export function SuccessState({ title = 'Success!', message, action }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/20 dark:to-emerald-950/10 p-6 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle size={24} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-emerald-900 dark:text-emerald-200">{title}</p>
          {message && <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-300">{message}</p>}
        </div>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </section>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <section className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-slate-50/50 dark:from-slate-900/30 dark:to-slate-900/10 px-6 py-16 text-center">
      <div className="rounded-full bg-slate-100 dark:bg-slate-800/50 p-4 text-slate-400 dark:text-slate-500">
        <Icon size={48} strokeWidth={1.2} />
      </div>
      <p className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      {description && <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{description}</p>}
      {action && <section className="mt-6">{action}</section>}
    </section>
  );
}
