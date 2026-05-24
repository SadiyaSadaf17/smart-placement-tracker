import { Gauge } from 'lucide-react';

const getTone = (score) => {
  if (score >= 85) return { stroke: '#10b981', text: 'text-emerald-600 dark:text-emerald-400' };
  if (score >= 70) return { stroke: '#2563eb', text: 'text-blue-600 dark:text-blue-400' };
  if (score >= 50) return { stroke: '#f59e0b', text: 'text-amber-600 dark:text-amber-400' };
  return { stroke: '#ef4444', text: 'text-red-600 dark:text-red-400' };
};

export default function ReadinessScoreRing({ score = 0, grade = 'Needs Work', size = 220 }) {
  const normalized = Math.min(Math.max(Number(score) || 0, 0), 100);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalized / 100) * circumference;
  const tone = getTone(normalized);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-200 dark:text-slate-800"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={tone.stroke}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Gauge size={24} className="mb-2 text-slate-400" />
          <span className={`text-5xl font-bold ${tone.text}`}>{Math.round(normalized)}</span>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">out of 100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-900 dark:text-white">{grade}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">Placement readiness</p>
      </div>
    </div>
  );
}
