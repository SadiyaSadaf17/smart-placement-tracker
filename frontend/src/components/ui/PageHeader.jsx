export default function PageHeader({ title, description, action, breadcrumb }) {
  return (
    <div className="mb-8 space-y-4">
      {breadcrumb && (
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumb.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <span className="text-slate-400 dark:text-slate-600">/</span>}
              <a href={item.href} className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                {item.label}
              </a>
            </div>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">{title}</h1>
          {description && (
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
