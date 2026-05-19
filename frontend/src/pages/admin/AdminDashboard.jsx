import { Users, Award, Building2, Percent, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { useFetch } from '../../hooks/useFetch';
import { LoadingGrid, ErrorState } from '../../components/ui/PageState';

export default function AdminDashboard() {
  const { data: stats, loading, error, refetch } = useFetch(
    () => api.get('/admin/dashboard').then((r) => r.data.data),
    []
  );

  return (
    <section className="animate-fade-in space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="Placement cell overview and branch-wise performance"
      />

      {error && <ErrorState message={error} onRetry={refetch} />}

      {loading && <LoadingGrid count={6} />}

      {stats && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard title="Total Students" value={stats.totalStudents ?? 0} icon={Users} color="blue" />
            <StatCard title="Placements" value={stats.totalPlacements ?? 0} icon={Award} color="green" />
            <StatCard title="Placement %" value={`${stats.placementPercentage ?? 0}%`} icon={Percent} color="purple" />
            <StatCard title="Highest Package" value={`${stats.highestPackage ?? 0} LPA`} icon={TrendingUp} color="orange" />
            <StatCard title="Avg Package" value={`${stats.averagePackage ?? 0} LPA`} icon={Award} color="blue" />
            <StatCard title="Active Drives" value={stats.activeDrives ?? 0} icon={Building2} color="green" />
          </section>
          <Card title="Branch-wise Placements" subtitle="Placed vs total students per branch">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.branchWise || []}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    background: 'var(--tooltip-bg, #fff)',
                  }}
                />
                <Bar dataKey="placed" fill="#2563eb" name="Placed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#94a3b8" name="Total" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </section>
  );
}
