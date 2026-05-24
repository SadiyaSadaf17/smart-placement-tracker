import { CalendarClock } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { useFetch } from '../../hooks/useFetch';

export default function StudentApplicationHistory() {
  const { data, loading, error, refetch } = useFetch(() => api.get('/applications/my/timeline').then((r) => r.data.data), []);
  return (
    <section className="space-y-6">
      <PageHeader title="Application History" description="Timeline of applications, rounds, selections, and feedback" />
      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={3} />}
      {!loading && !data?.events?.length && <EmptyState icon={CalendarClock} title="No timeline events yet" />}
      {data?.events?.length > 0 && (
        <Card hoverable={false}>
          <div className="space-y-4">
            {data.events.map((event, index) => (
              <div key={`${event.applicationId}-${index}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-slate-500">{new Date(event.date).toLocaleString()} {event.status ? `| ${event.status}` : ''}</p>
                {event.remarks && <p className="mt-2 text-sm">{event.remarks}</p>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </section>
  );
}
