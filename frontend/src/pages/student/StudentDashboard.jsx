import { Link } from 'react-router-dom';
import { FileText, Building2, TrendingUp, Award } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import { useFetch } from '../../hooks/useFetch';
import { LoadingGrid, ErrorState } from '../../components/ui/PageState';

export default function StudentDashboard() {
  const analytics = useFetch(() => api.get('/students/analytics').then((r) => r.data), []);
  const ai = useFetch(() => api.get('/students/ai-insights').then((r) => r.data.data), []);

  const loading = analytics.loading || ai.loading;
  const error = analytics.error || ai.error;
  const stats = analytics.data?.data;
  const insights = ai.data;

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader
        title="My Dashboard"
        description="Track applications, ATS score, and placement readiness"
      />

      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            analytics.refetch();
            ai.refetch();
          }}
        />
      )}

      {loading && <LoadingGrid count={4} />}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Applications" value={stats?.totalApplications ?? 0} icon={FileText} color="blue" />
            <StatCard title="In Progress" value={stats?.inProgress ?? 0} icon={Building2} color="purple" />
            <StatCard title="Selected" value={stats?.selected ?? 0} icon={Award} color="green" />
            <StatCard
              title="ATS Score"
              value={`${stats?.atsScore ?? insights?.atsScore ?? 0}%`}
              icon={TrendingUp}
              color="orange"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card title="Placement Prediction" subtitle="Heuristic model based on your profile">
              <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {insights?.placementPrediction?.probability ?? 0}%
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Factors: CGPA, skills, projects, backlogs, resume
              </p>
              <Link to="/student/resume" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
                Improve with Resume Analyzer →
              </Link>
            </Card>
            <Card
              title="Recommended Drives"
              action={<Link to="/student/companies" className="text-sm font-medium text-blue-600">View all</Link>}
            >
              <ul className="space-y-2">
                {(insights?.recommendations || []).slice(0, 4).map(({ drive }) => (
                  <li
                    key={drive._id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                  >
                    <span className="text-sm font-medium">{drive.companyName} — {drive.role}</span>
                    <Badge variant="info">{drive.package} LPA</Badge>
                  </li>
                ))}
                {!insights?.recommendations?.length && (
                  <p className="text-sm text-slate-500">Complete your profile to get recommendations.</p>
                )}
              </ul>
            </Card>
          </section>
        </>
      )}
    </section>
  );
}
