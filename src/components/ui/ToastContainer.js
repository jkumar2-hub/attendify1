'use client';
import { useApp } from '@/contexts/AppContext';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
};

const colors = {
  success: 'border-green-200 dark:border-green-800',
  error: 'border-red-200 dark:border-red-800',
  warning: 'border-yellow-200 dark:border-yellow-800',
  info: 'border-blue-200 dark:border-blue-800',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`glass rounded-xl px-4 py-3 flex items-center gap-3 border ${colors[toast.type] || colors.success} shadow-lg animate-slide-up pointer-events-auto`}
        >
          {icons[toast.type] || icons.success}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100 flex-1">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
