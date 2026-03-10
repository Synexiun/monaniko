'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast as ToastType } from '@/store/toast';

const icons: Record<ToastType['type'], React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorClasses: Record<ToastType['type'], string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
};

const iconColorClasses: Record<ToastType['type'], string> = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-yellow-500',
};

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
  autoDismissMs?: number;
}

export default function Toast({
  toast,
  onDismiss,
  autoDismissMs = 4000,
}: ToastProps) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, autoDismissMs);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss, autoDismissMs]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 w-[360px] px-4 py-3 rounded-lg border shadow-lg',
        colorClasses[toast.type]
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColorClasses[toast.type])} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-0.5 rounded-md opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
