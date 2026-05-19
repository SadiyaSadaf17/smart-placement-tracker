export default function Card({ title, subtitle, children, className = '', action, variant = 'default', hoverable = true }) {
  const variantStyles = {
    default: 'border border-slate-200/60 dark:border-slate-700/40 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md',
    elevated: 'border border-slate-200/40 dark:border-slate-700/20 bg-white/40 dark:bg-slate-900/30 shadow-lg backdrop-blur-sm hover:shadow-xl',
    gradient: 'border border-slate-200/40 dark:border-slate-700/20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-900/30 shadow-md hover:shadow-lg',
  };

  const hoverClass = hoverable ? 'transition-all duration-300 hover:-translate-y-0.5' : '';
  
  return (
    <div className={`rounded-2xl ${variantStyles[variant]} p-6 ${hoverClass} ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex-1">
            {title && <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
