import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Award, Download, Filter, RefreshCw, Target, TrendingUp, Users } from 'lucide-react';
import api from '../../services/api';
import { connectSocket } from '../../services/socket';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import { Select } from '../../components/ui/Select';
import { EmptyState, ErrorState, LoadingGrid } from '../../components/ui/PageState';
import { Grid } from '../../components/ui/Divider';
import { BRANCHES } from '../../utils/constants';
import { useFetch } from '../../hooks/useFetch';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const download = async (url, filename) => {
  const res = await api.get(url, { responseType: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(res.data);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const toOptions = (items = [], allLabel = 'All') => [
  { label: allLabel, value: '' },
  ...items.map((item) => ({ label: String(item), value: String(item) })),
];

export default function AdminAnalytics() {
  const [filters, setFilters] = useState({ branch: '', department: '', year: '', company: '' });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [filters]);

  const { data, loading, error, refetch } = useFetch(
    () => api.get(`/analytics${query ? `?${query}` : ''}`).then((r) => r.data.data),
    [query]
  );

  useEffect(() => {
    const socket = connectSocket(true);
    if (!socket) return undefined;

    const refreshAnalytics = () => refetch().catch(() => {});
    socket.on('analytics-update', refreshAnalytics);
    return () => socket.off('analytics-update', refreshAnalytics);
  }, [refetch]);

  const options = data?.filterOptions || {};
  const overview = data?.overview || {};
  const hasAnalytics =
    overview.totalStudents > 0 ||
    (data?.branchPlacements || []).length > 0 ||
    (data?.placementTrends || []).length > 0;

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const resetFilters = () => setFilters({ branch: '', department: '', year: '', company: '' });

  const reportQuery = query ? `?${query}` : '';

  return (
    <section className="animate-fade-in space-y-8">
      <PageHeader
        title="Analytics"
        description="Placement performance, hiring trends, conversion funnel, and monthly reports"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" icon={RefreshCw} onClick={refetch} disabled={loading}>
              Refresh
            </Button>
            <Button
              icon={Download}
              onClick={() => download(`/reports/analytics/monthly/excel${reportQuery}`, 'monthly-placement-report.xlsx')}
            >
              Excel
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => download(`/reports/analytics/monthly/pdf${reportQuery}`, 'monthly-placement-report.pdf')}
            >
              PDF
            </Button>
          </div>
        }
      />

      <Card title="Filters" subtitle="Narrow analytics by branch, department, year, or company" hoverable={false}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Select
            label="Branch"
            value={filters.branch}
            onChange={(value) => setFilter('branch', value)}
            options={toOptions(options.branches || BRANCHES, 'All branches')}
          />
          <Select
            label="Department"
            value={filters.department}
            onChange={(value) => setFilter('department', value)}
            options={toOptions(options.departments || BRANCHES, 'All departments')}
          />
          <Select
            label="Year"
            value={filters.year}
            onChange={(value) => setFilter('year', value)}
            options={toOptions(options.years || [], 'All years')}
          />
          <Select
            label="Company"
            value={filters.company}
            onChange={(value) => setFilter('company', value)}
            options={toOptions(options.companies || [], 'All companies')}
          />
          <div className="flex items-end">
            <Button variant="outline" icon={Filter} onClick={resetFilters} className="w-full">
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={refetch} />}
      {loading && <LoadingGrid count={6} />}

      {!loading && !error && data && !hasAnalytics && (
        <EmptyState
          icon={TrendingUp}
          title="No analytics data found"
          description="Try clearing filters or add students, drives, and applications to generate analytics."
        />
      )}

      {!loading && !error && data && hasAnalytics && (
        <>
          <Grid columns={4} gap={4}>
            <StatCard
              title="Placement Rate"
              value={`${overview.placementPercentage ?? 0}%`}
              icon={TrendingUp}
              color="green"
              subtitle={`${overview.placedStudents ?? 0}/${overview.totalStudents ?? 0} students placed`}
            />
            <StatCard
              title="Highest Package"
              value={`${overview.highestPackage ?? 0} LPA`}
              icon={Award}
              color="purple"
              subtitle="Top offer tracked"
            />
            <StatCard
              title="Average Package"
              value={`${overview.averagePackage ?? 0} LPA`}
              icon={Target}
              color="blue"
              subtitle="Accepted offers"
            />
            <StatCard
              title="Offer Acceptance"
              value={`${data.offerAcceptance?.offerAcceptanceRatio ?? 0}%`}
              icon={Users}
              color="orange"
              subtitle={`${data.offerAcceptance?.offers ?? 0} selected applications`}
            />
          </Grid>

          <section className="grid gap-6 xl:grid-cols-2">
            <Card title="Branch-wise Placement Statistics" hoverable={false}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.branchPlacements || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Monthly Placement Reports" hoverable={false}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.placementTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="placements" stroke="#10b981" strokeWidth={3} dot />
                  <Line type="monotone" dataKey="avgPackage" stroke="#8b5cf6" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Company Hiring Trends" hoverable={false}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.companyHiring || []} layout="vertical" margin={{ left: 24 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="company" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Application Conversion Funnel" hoverable={false}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.applicationFunnel || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="round" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Student Eligibility vs Placement Ratio" hoverable={false}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.eligibilityPlacementRatio?.drives || []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="company" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="eligible" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Package Distribution" hoverable={false}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={data.packageDistribution || []}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
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

          <Card title="Analytics Summary" subtitle="Operational placement health indicators" hoverable={false}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <p className="text-sm text-slate-500 dark:text-slate-400">Eligibility placement ratio</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {data.eligibilityPlacementRatio?.totals?.ratio ?? 0}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <p className="text-sm text-slate-500 dark:text-slate-400">Average ATS score</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {data.studentPerformance?.avgATS ?? 0}%
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40">
                <p className="text-sm text-slate-500 dark:text-slate-400">Hiring companies</p>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {(data.companyHiring || []).length}
                </p>
              </div>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}
