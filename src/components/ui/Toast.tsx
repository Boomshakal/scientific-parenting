'use client';

import React, { useEffect } from 'react';
import { useToastStore } from '@/stores/toastStore';

type ToastType = 'error' | 'success' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const COLORS: Record<ToastType, string> = {
  error: 'bg-red-500',
  success: 'bg-green-500',
  info: 'bg-blue-500',
};

const EMOJIS: Record<ToastType, string> = {
  error: '❌',
  success: '✅',
  info: 'ℹ️',
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return (
    <div
      className={`${COLORS[toast.type]} text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-slide-in max-w-sm`}
    >
      <span className="text-lg shrink-0">{EMOJIS[toast.type]}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => dismiss(toast.id)}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
