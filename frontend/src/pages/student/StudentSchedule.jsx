import { CalendarDays } from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { useFetch } from '../../hooks/useFetch';

export default function StudentSchedule() {
  const { data, loading, error, refetch } = useFetch(() => api.get('/schedules/my').then((r) => r.data.data || []), []);
  return (
    <section className="space-y-6">
      <PageHeader title="Upcoming Rounds" description="Tests, interviews, meeting links, and venues" />
      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={3} />}
      {!loading && !data?.length && <EmptyState icon={CalendarDays} title="No scheduled rounds" />}
      {data?.map((schedule) => (
        <Card key={schedule._id} title={schedule.title} subtitle={`${schedule.drive?.companyName || ''} | ${schedule.roundType}`} hoverable={false}>
          <div className="space-y-3">
            {schedule.slots.map((slot) => (
              <div key={slot._id} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <p className="font-medium">{new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleTimeString()}</p>
                <p className="text-sm text-slate-500">{slot.venue || 'Online'} {slot.meetingLink && `| ${slot.meetingLink}`}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </section>
  );
}
