export default function StatCard({ title, value, icon: Icon, trend, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-violet-500 to-violet-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          {trend && <p className="mt-1 text-xs text-emerald-600">{trend}</p>}
        </div>
        {Icon && (
          <div className={`rounded-lg bg-gradient-to-br ${colors[color]} p-2.5 text-white`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
