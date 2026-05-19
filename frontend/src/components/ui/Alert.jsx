import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const alertIcons = {
  error: AlertCircle,
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
};

const alertStyles = {
  error: 'border-red-200/50 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/20',
  success: 'border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20',
  info: 'border-blue-200/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20',
  warning: 'border-amber-200/50 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/20',
};

const alertTextStyles = {
  error: 'text-red-900 dark:text-red-200',
  success: 'text-emerald-900 dark:text-emerald-200',
  info: 'text-blue-900 dark:text-blue-200',
  warning: 'text-amber-900 dark:text-amber-200',
};

const iconStyles = {
  error: 'text-red-600 dark:text-red-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  info: 'text-blue-600 dark:text-blue-400',
  warning: 'text-amber-600 dark:text-amber-400',
};

export function Alert({ variant = 'info', title, description, closeable = true, onClose }) {
  const [closed, setClosed] = useState(false);
  const Icon = alertIcons[variant] || alertIcons.info;

  if (closed) return null;

  const handleClose = () => {
    setClosed(true);
    onClose?.();
  };

  return (
    <div className={`flex gap-3 rounded-xl border-2 p-4 backdrop-blur-sm transition-all duration-200 ${alertStyles[variant]}`}>
      <Icon size={20} className={`shrink-0 mt-0.5 ${iconStyles[variant]}`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`font-semibold ${alertTextStyles[variant]}`}>{title}</p>}
        {description && (
          <p className={`mt-1 text-sm opacity-90 ${alertTextStyles[variant]}`}>{description}</p>
        )}
      </div>
      {closeable && (
        <button
          onClick={handleClose}
          className={`shrink-0 p-1 rounded hover:bg-white/30 dark:hover:bg-black/20 transition-colors`}
        >
          <X size={18} className={iconStyles[variant]} />
        </button>
      )}
    </div>
  );
}