export default function StatCard({ title, value, icon: Icon, trend, color = 'blue', subtitle }) {
  const colors = {
    blue: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
    green: { gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
    purple: { gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400' },
    orange: { gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400' },
    pink: { gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400' },
    cyan: { gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400' },
  };

  const colorScheme = colors[color] || colors.blue;

  return (
    <div className="group relative rounded-2xl border border-slate-200/60 dark:border-slate-700/40 bg-white/80 dark:bg-slate-900/50 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 truncate text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
          {trend && (
            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl bg-gradient-to-br ${colorScheme.gradient} p-3 text-white shadow-lg shadow-blue-500/20 transition-transform duration-300 group-hover:scale-110`}>
            <Icon size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </div>
  );
}
