import { Link } from 'react-router-dom';
import { FileText, Building2, Gauge, Award, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import { useFetch } from '../../hooks/useFetch';
import { LoadingGrid, ErrorState } from '../../components/ui/PageState';
import { Grid } from '../../components/ui/Divider';
import ReadinessScoreRing from '../../components/readiness/ReadinessScoreRing';

export default function StudentDashboard() {
  const analytics = useFetch(() => api.get('/students/analytics').then((r) => r.data), []);
  const ai = useFetch(() => api.get('/students/ai-insights').then((r) => r.data.data), []);
  const readiness = useFetch(() => api.get('/readiness-score/current').then((r) => r.data.data), []);

  const loading = analytics.loading || ai.loading || readiness.loading;
  const error = analytics.error || ai.error || readiness.error;
  const stats = analytics.data?.data;
  const insights = ai.data;
  const readinessScore = readiness.data;

  return (
    <section className="animate-fade-in space-y-8">
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
            readiness.refetch();
          }}
        />
      )}

      {loading && <LoadingGrid count={4} />}

      {!loading && !error && (
        <>
          {/* Key Stats */}
          <Grid columns={4} gap={4}>
            <StatCard 
              title="Applications" 
              value={stats?.totalApplications ?? 0} 
              icon={FileText} 
              color="blue"
              subtitle="Total applied"
            />
            <StatCard 
              title="In Progress" 
              value={stats?.inProgress ?? 0} 
              icon={Building2} 
              color="purple"
              subtitle="Under review"
            />
            <StatCard 
              title="Selected" 
              value={stats?.selected ?? 0} 
              icon={Award} 
              color="green"
              subtitle="Offers received"
            />
            <StatCard
              title="Readiness"
              value={`${Math.round(readinessScore?.score ?? 0)}%`}
              icon={Gauge}
              color="orange"
              subtitle={readinessScore?.grade || 'Placement score'}
            />
          </Grid>

          {/* Main Cards */}
          <Grid columns={2} gap={6}>
            <Card
              title="Placement Readiness"
              subtitle="Weighted score across your placement signals"
              action={
                <Link to="/student/readiness" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  Details
                </Link>
              }
            >
              <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
                <ReadinessScoreRing score={readinessScore?.score} grade={readinessScore?.grade} size={150} />
                <div className="space-y-3">
                  {(readinessScore?.insights || []).slice(0, 2).map((insight) => (
                    <p key={insight} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/40 dark:text-slate-300">
                      {insight}
                    </p>
                  ))}
                </div>
              </div>
            </Card>

            {/* Placement Prediction */}
            <Card variant="gradient" title="Placement Prediction" subtitle="AI-powered probability model">
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {insights?.placementPrediction?.probability ?? 0}%
                    </p>
                    <span className="text-sm text-slate-500">probability</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                    Based on CGPA, skills, projects, backlogs, and resume quality
                  </p>
                </div>
                <Link to="/student/resume" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:dark:text-blue-300 transition-colors">
                  Improve with Resume Analyzer <ArrowRight size={16} />
                </Link>
              </div>
            </Card>

            {/* Recommended Drives */}
            <Card 
              title="Recommended Drives" 
              subtitle="Best match for your profile"
              action={
                <Link to="/student/companies" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  View all
                </Link>
              }
            >
              <div className="space-y-3">
                {(insights?.recommendations || []).slice(0, 4).map(({ drive }) => (
                  <div
                    key={drive._id}
                    className="flex items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/20 p-4 transition-all duration-200 hover:shadow-md hover:from-slate-100 dark:hover:from-slate-800/60"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{drive.companyName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{drive.role}</p>
                    </div>
                    <Badge variant="info" size="md">{drive.package} LPA</Badge>
                  </div>
                ))}
                {!insights?.recommendations?.length && (
                  <div className="rounded-xl bg-slate-50/50 dark:bg-slate-800/20 p-4 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Complete your profile to get recommendations.
                    </p>
                    <Link to="/student/profile">
                      <Button variant="outline" size="sm" className="mt-3">
                        Update Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </Grid>

          {/* Action Section */}
          <Card variant="elevated" title="Next Steps" subtitle="What you should do now">
            <div className="grid gap-3 sm:grid-cols-2">
              <Link to="/student/resume">
                <Button variant="secondary" className="w-full">
                  📄 Upload Resume
                </Button>
              </Link>
              <Link to="/student/companies">
                <Button className="w-full">
                  🔍 Browse Drives
                </Button>
              </Link>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}
