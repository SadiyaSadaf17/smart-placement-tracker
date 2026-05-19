import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { useFetch } from '../../hooks/useFetch';
import { LoadingGrid, ErrorState } from '../../components/ui/PageState';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminAnalytics() {
  const { data, loading, error, refetch } = useFetch(
    () => api.get('/analytics').then((r) => r.data.data),
    []
  );

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader title="Analytics" description="Placement trends, hiring, and package distribution" />

      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={4} />}

      {data && !error && (
        <section className="grid gap-6 lg:grid-cols-2">
          <Card title="Branch Placements">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.branchPlacements || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="placed" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Monthly Placement Trends">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.placementTrends || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Company Hiring">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.companyHiring || []} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="company" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Package Distribution (LPA)">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.packageDistribution || []}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ _id, count }) => `${_id}: ${count}`}
                >
                  {(data.packageDistribution || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </section>
      )}
    </section>
  );
}
