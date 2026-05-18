import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../services/api';
import Card from '../../components/ui/Card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics').then((r) => setData(r.data.data));
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card title="Branch Placements">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.branchPlacements}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="placed" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Placement Trends">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.placementTrends}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Company Hiring">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.companyHiring} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="company" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="count" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card title="Package Distribution">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={data.packageDistribution} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label>
              {data.packageDistribution?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </section>
  );
}
