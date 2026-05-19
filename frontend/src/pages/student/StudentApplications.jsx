import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { useFetch } from '../../hooks/useFetch';
import { LoadingGrid, ErrorState, EmptyState } from '../../components/ui/PageState';
import { roundVariant } from '../../utils/roundHelpers';
import { FileText } from 'lucide-react';

export default function StudentApplications() {
  const { data: apps, loading, error, refetch } = useFetch(
    () => api.get('/applications/my').then((r) => r.data.data || []),
    []
  );

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="My Applications" description="Track your placement round progress" />

      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={3} />}

      {!loading && !error && apps?.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="Browse eligible companies and apply for placement drives."
        />
      )}

      {!loading && apps?.length > 0 && (
        <section className="space-y-4">
          {apps.map((a) => (
            <Card key={a._id} title={a.drive?.companyName} subtitle={a.drive?.role}>
              <section className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-slate-500">
                  {a.drive?.package} LPA · {a.drive?.location}
                </span>
                <Badge variant={roundVariant(a.currentRound)}>{a.currentRound}</Badge>
              </section>
              <p className="mt-2 text-xs text-slate-400">
                Applied {new Date(a.appliedAt).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </section>
      )}
    </section>
  );
}
