export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-4 w-4 border',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-blue-600 border-t-transparent ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingOverlay({ fullScreen = false, text = 'Loading...' }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${fullScreen ? 'fixed inset-0 z-50 bg-black/20 backdrop-blur-sm' : 'p-8'}`}>
      <Spinner size="md" />
      {text && <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{text}</span>}
    </div>
  );
}
