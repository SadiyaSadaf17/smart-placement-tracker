const colors = {
  success: 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/30',
  warning: 'bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/30',
  danger: 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/30',
  info: 'bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/30',
  purple: 'bg-violet-100/80 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800/30',
  default: 'bg-slate-100/80 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
};

export default function Badge({ children, variant = 'default', size = 'md' }) {
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium backdrop-blur-sm transition-all duration-200 ${colors[variant] || colors.default} ${sizes[size]}`}>
      {children}
    </span>
  );
}
