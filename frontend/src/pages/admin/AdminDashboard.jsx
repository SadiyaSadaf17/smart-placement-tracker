import { useEffect, useState } from 'react';
import { Users, Award, Building2, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { CardSkeleton } from '../../components/ui/Skeleton';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then((r) => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map((i) => <CardSkeleton key={i} />)}</section>;

  return (
    <section className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" />
        <StatCard title="Placements" value={stats.totalPlacements} icon={Award} color="green" />
        <StatCard title="Placement %" value={`${stats.placementPercentage}%`} icon={Percent} color="purple" />
        <StatCard title="Highest Package" value={`${stats.highestPackage} LPA`} icon={Award} color="orange" />
        <StatCard title="Avg Package" value={`${stats.averagePackage} LPA`} icon={Award} color="blue" />
        <StatCard title="Active Drives" value={stats.activeDrives} icon={Building2} color="green" />
      </section>
      <Card title="Branch-wise Placements">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.branchWise || []}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="branch" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="placed" fill="#3b82f6" name="Placed" />
            <Bar dataKey="total" fill="#94a3b8" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </section>
  );
}
