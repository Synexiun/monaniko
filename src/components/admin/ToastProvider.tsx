'use client';

import { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/toast';
import Toast from './Toast';

export default function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  const handleDismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={handleDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
