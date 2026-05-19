import { Users, Award, Building2, Percent, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import { useFetch } from '../../hooks/useFetch';
import { LoadingGrid, ErrorState } from '../../components/ui/PageState';
import { Grid } from '../../components/ui/Divider';

export default function AdminDashboard() {
  const { data: stats, loading, error, refetch } = useFetch(
    () => api.get('/admin/dashboard').then((r) => r.data.data),
    []
  );

  return (
    <section className="animate-fade-in space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Placement cell overview and performance metrics"
      />

      {error && <ErrorState message={error} onRetry={refetch} />}

      {loading && <LoadingGrid count={6} />}

      {stats && !error && (
        <>
          {/* Key Stats */}
          <Grid columns={3} gap={4}>
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents ?? 0} 
              icon={Users} 
              color="blue"
              subtitle="Registered"
            />
            <StatCard 
              title="Placements" 
              value={stats.totalPlacements ?? 0} 
              icon={Award} 
              color="green"
              subtitle="Placed students"
            />
            <StatCard 
              title="Placement %" 
              value={`${stats.placementPercentage ?? 0}%`} 
              icon={Percent} 
              color="purple"
              subtitle="Success rate"
            />
            <StatCard 
              title="Highest Package" 
              value={`${stats.highestPackage ?? 0} LPA`} 
              icon={TrendingUp} 
              color="orange"
              subtitle="Best offer"
            />
            <StatCard 
              title="Avg Package" 
              value={`${stats.averagePackage ?? 0} LPA`} 
              icon={Award} 
              color="blue"
              subtitle="Average"
            />
            <StatCard 
              title="Active Drives" 
              value={stats.activeDrives ?? 0} 
              icon={Building2} 
              color="green"
              subtitle="Running"
            />
          </Grid>

          {/* Charts */}
          <Grid columns={1} gap={6}>
            {/* Branch Placements */}
            <Card 
              title="Branch-wise Placements" 
              subtitle="Placed vs total students per branch"
              variant="elevated"
            >
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={stats.branchWise || []}>
                  <defs>
                    <linearGradient id="colorPlaced" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
                  <XAxis 
                    dataKey="branch" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.1 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.1 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: 'var(--tooltip-bg, #fff)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="placed" fill="url(#colorPlaced)" name="Placed" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="total" fill="url(#colorTotal)" name="Total" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Placement Trends */}
            <Card 
              title="Placement Trends" 
              subtitle="Monthly placement rate"
              variant="elevated"
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.placementTrends || []}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" stroke="currentColor" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.1 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: 'currentColor' }}
                    tickLine={{ stroke: 'currentColor', opacity: 0.1 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: 'var(--tooltip-bg, #fff)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 5 }}
                    activeDot={{ r: 7 }}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    name="Placements"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Top Hiring Companies */}
            <Card 
              title="Top Hiring Companies" 
              subtitle="Companies with most placements"
              variant="elevated"
            >
              <div className="space-y-3">
                {(stats.companyHiring || []).slice(0, 8).map((company, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/20 p-4">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">{company.company}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Avg: {company.avgPackage} LPA</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-600">{company.count}</span>
                        <span className="text-sm text-slate-500">placements</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Grid>
        </>
      )}
    </section>
  );
}
