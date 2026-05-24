import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '../ui/PageState';
import { TrendingUp } from 'lucide-react';

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(new Date(value));

export default function ReadinessProgressChart({ data = [] }) {
  if (!data.length) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No progress history yet"
        description="Your first score snapshot will appear here after calculation."
      />
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="readinessScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatDate} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
          <Tooltip
            labelFormatter={(value) => formatDate(value)}
            formatter={(value) => [`${Math.round(value)} / 100`, 'Score']}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={3}
            fill="url(#readinessScore)"
            dot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
