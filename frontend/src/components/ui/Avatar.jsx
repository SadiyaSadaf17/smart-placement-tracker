import { User } from 'lucide-react';
import { resolveAssetUrl } from '../../utils/assets';

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-14 w-14 text-xl',
    lg: 'h-24 w-24 text-3xl',
  };

  const imageUrl = resolveAssetUrl(src);
  const initial = (name || '?').charAt(0).toUpperCase();

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name ? `${name} profile` : 'Profile'}
        loading="lazy"
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${className}`}
      />
    );
  }

  return (
    <span
      className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-bold text-white ring-2 ring-white dark:ring-slate-800 ${className}`}
      aria-label={name ? `${name} profile` : 'Profile'}
    >
      {initial === '?' ? <User size={size === 'lg' ? 34 : 20} /> : initial}
    </span>
  );
}
