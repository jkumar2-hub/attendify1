'use client';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

// ─── Button ──────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', className = '', disabled, loading, onClick, type = 'button', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-green-500/30',
    secondary: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750',
    ghost: 'text-gray-600 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'border-2 border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', glass = false, hover = false, padding = 'p-6' }) {
  return (
    <div className={clsx(
      'rounded-2xl',
      glass
        ? 'glass'
        : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-card',
      hover && 'card-hover cursor-pointer',
      padding,
      className
    )}>
      {children}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx(
        'relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 animate-slide-up',
        sizes[size]
      )}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ status, label }) {
  const styles = {
    safe: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    risk: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  const labels = {
    safe: label || 'Safe ✓',
    risk: label || 'At Risk ⚠',
    critical: label || 'Critical ✗',
    info: label || 'Info',
  };

  return (
    <span className={clsx(
      'px-2.5 py-0.5 rounded-full text-xs font-semibold',
      styles[status] || styles.info
    )}>
      {labels[status]}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function Skeleton({ className = '', height = 'h-4', rounded = 'rounded-lg' }) {
  return <div className={clsx('skeleton', height, rounded, className)} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
      <Skeleton height="h-5" className="w-1/3 mb-4" />
      <Skeleton height="h-10" className="w-1/2 mb-2" />
      <Skeleton height="h-3" className="w-2/3" />
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────
export function ProgressRing({ percentage, size = 80, strokeWidth = 8, color = '#22c55e', bg = '#e5e7eb' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const ringColor = percentage >= 75 ? color : percentage >= 65 ? '#eab308' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={bg} strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius}
          fill="none" stroke={ringColor} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="progress-ring"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-gray-800 dark:text-white" style={{ fontSize: size * 0.18 }}>
        {percentage}%
      </span>
    </div>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input
        className={clsx(
          'input-field',
          error && 'border-red-400 focus:ring-red-400',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
      {hint && !error && <span className="text-xs text-gray-500">{hint}</span>}
    </div>
  );
}

// ─── Select ─────────────────────────────────────────────────────────────────────
export function Select({ label, error, options = [], className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select
        className={clsx('input-field', error && 'border-red-400', className)}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon || '📭'}</div>
      <h3 className="font-display font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
