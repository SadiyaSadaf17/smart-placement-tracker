export function Divider({ className = '', label = '' }) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700 dark:to-transparent" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-l from-slate-200 to-transparent dark:from-slate-700 dark:to-transparent" />
      </div>
    );
  }

  return <div className={`h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent dark:from-slate-700 dark:via-slate-700 dark:to-transparent ${className}`} />;
}

export function Grid({ columns = 3, gap = 4, children, className = '' }) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <div className={`grid ${colClasses[columns] || colClasses[3]} ${gapClasses[gap] || gapClasses[4]} ${className}`}>
      {children}
    </div>
  );
}