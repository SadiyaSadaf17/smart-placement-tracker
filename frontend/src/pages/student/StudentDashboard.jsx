import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Building2, TrendingUp, Award } from 'lucide-react';
import api from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { CardSkeleton } from '../../components/ui/Skeleton';
import Badge from '../../components/ui/Badge';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [ai, setAi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/students/analytics'),
      api.get('/students/ai-insights'),
    ]).then(([a, b]) => {
      setStats(a.data.data);
      setAi(b.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1,2,3,4].map((i) => <CardSkeleton key={i} />)}</section>;

  return (
    <section className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Applications" value={stats?.totalApplications || 0} icon={FileText} color="blue" />
        <StatCard title="In Progress" value={stats?.inProgress || 0} icon={Building2} color="purple" />
        <StatCard title="Selected" value={stats?.selected || 0} icon={Award} color="green" />
        <StatCard title="ATS Score" value={`${stats?.atsScore || ai?.atsScore || 0}%`} icon={TrendingUp} color="orange" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card title="Placement Prediction" subtitle="AI-based estimate">
          <p className="text-4xl font-bold text-primary-600">{ai?.placementPrediction?.probability || 0}%</p>
          <p className="mt-2 text-sm text-slate-500">Based on CGPA, skills, projects & resume</p>
        </Card>
        <Card title="Recommended Drives" action={<Link to="/student/companies" className="text-sm text-primary-600">View all</Link>}>
          <ul className="space-y-2">
            {(ai?.recommendations || []).slice(0, 3).map(({ drive }) => (
              <li key={drive._id} className="flex justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <span>{drive.companyName} - {drive.role}</span>
                <Badge variant="info">{drive.package} LPA</Badge>
              </li>
            ))}
            {!ai?.recommendations?.length && <p className="text-sm text-slate-500">Complete profile for recommendations</p>}
          </ul>
        </Card>
      </section>
    </section>
  );
}
