const formatMetricValue = (metric) => {
  if (metric?.maxValue === undefined || metric?.maxValue === 100) return `${Math.round(metric?.raw || 0)}%`;
  return `${metric.value ?? 0}/${metric.maxValue}`;
};

export default function MetricBreakdown({ breakdown = {} }) {
  const metrics = Object.entries(breakdown);

  return (
    <div className="space-y-4">
      {metrics.map(([key, metric]) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{metric.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {Math.round((metric.weight || 0) * 100)}% weight
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-slate-900 dark:text-white">
              {formatMetricValue(metric)}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(Math.max(metric.raw || 0, 0), 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
