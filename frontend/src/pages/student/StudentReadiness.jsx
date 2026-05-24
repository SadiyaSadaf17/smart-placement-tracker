import { RefreshCw, Sparkles, Target, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { ChartSkeleton, CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/PageState';
import { Grid } from '../../components/ui/Divider';
import { useFetch } from '../../hooks/useFetch';
import MetricBreakdown from '../../components/readiness/MetricBreakdown';
import ReadinessProgressChart from '../../components/readiness/ReadinessProgressChart';
import ReadinessScoreRing from '../../components/readiness/ReadinessScoreRing';
import SuggestionList from '../../components/readiness/SuggestionList';
import WeakAreas from '../../components/readiness/WeakAreas';

export default function StudentReadiness() {
  const current = useFetch(() => api.get('/readiness-score/current').then((r) => r.data.data), []);
  const analytics = useFetch(() => api.get('/readiness-score/analytics').then((r) => r.data.data), []);

  const loading = current.loading || analytics.loading;
  const error = current.error || analytics.error;
  const score = current.data;
  const progress = analytics.data?.progress || [];
  const summary = analytics.data?.summary;

  const recalculate = async () => {
    await api.post('/readiness-score/calculate');
    await Promise.all([current.refetch(), analytics.refetch()]);
  };

  return (
    <section className="animate-fade-in space-y-8">
      <PageHeader
        title="Placement Readiness"
        description="Understand your preparedness score and the next actions that can improve it"
        action={
          <Button icon={RefreshCw} onClick={recalculate} disabled={loading}>
            Recalculate
          </Button>
        }
      />

      {error && (
        <ErrorState
          message={error}
          onRetry={() => {
            current.refetch();
            analytics.refetch();
          }}
        />
      )}

      {loading && (
        <>
          <Grid columns={3} gap={4}>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </Grid>
          <ChartSkeleton />
        </>
      )}

      {!loading && !error && score && (
        <>
          <Grid columns={3} gap={4}>
            <StatCard
              title="Current Score"
              value={`${Math.round(score.score)}%`}
              icon={Target}
              color="blue"
              subtitle={score.grade}
            />
            <StatCard
              title="Net Progress"
              value={`${summary?.netChange > 0 ? '+' : ''}${summary?.netChange ?? 0}`}
              icon={TrendingUp}
              color="green"
              subtitle={`${summary?.totalSnapshots ?? 0} score snapshots`}
            />
            <StatCard
              title="Weak Areas"
              value={score.weakAreas?.length ?? 0}
              icon={Sparkles}
              color="orange"
              subtitle="Priority improvements"
            />
          </Grid>

          <Grid columns={2} gap={6}>
            <Card title="Overall Score" subtitle="Weighted score across placement factors" hoverable={false}>
              <ReadinessScoreRing score={score.score} grade={score.grade} />
            </Card>
            <Card title="Metric Breakdown" subtitle="Raw category strength and scoring weight" hoverable={false}>
              <MetricBreakdown breakdown={score.breakdown} />
            </Card>
          </Grid>

          <Grid columns={2} gap={6}>
            <Card title="Weak Areas" subtitle="Lowest scoring readiness categories" hoverable={false}>
              <WeakAreas areas={score.weakAreas} />
            </Card>
            <Card title="Improvement Suggestions" subtitle="Personalized next steps" hoverable={false}>
              <SuggestionList suggestions={score.suggestions} />
            </Card>
          </Grid>

          <Card title="Progress Over Time" subtitle="Historical readiness score snapshots" hoverable={false}>
            <ReadinessProgressChart data={progress} />
          </Card>

          <Card title="Readiness Insights" hoverable={false}>
            <div className="grid gap-3 md:grid-cols-3">
              {(score.insights || []).map((insight) => (
                <div
                  key={insight}
                  className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-800/40 dark:text-slate-300"
                >
                  {insight}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </section>
  );
}
