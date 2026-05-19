export function Table({ children, className = '' }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <thead className={`border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 ${className}`}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={`divide-y divide-slate-200 dark:divide-slate-700 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, hover = true, className = '' }) {
  return (
    <tr className={`transition-colors duration-200 ${hover ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : ''} ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, header = false, align = 'left', className = '' }) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[align];

  if (header) {
    return (
      <th className={`px-4 py-3 font-semibold text-slate-900 dark:text-white ${alignClass} ${className}`}>
        {children}
      </th>
    );
  }

  return (
    <td className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${alignClass} ${className}`}>
      {children}
    </td>
  );
}