'use client';

import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { ToastContainer, ToastData, ToastType } from './Toast';

interface ToastContextValue {
  showToast: (type: ToastType, message: string, description?: string) => void;
  dismissToast: (id: string) => void;
  success: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 4000; // 4 seconds auto-dismiss

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, description?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newToast: ToastData = {
      id,
      type,
      message,
      description,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after TOAST_DURATION
    const timeout = setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION);

    timeoutRefs.current.set(id, timeout);
  }, [dismissToast]);

  const success = useCallback((message: string, description?: string) => {
    showToast('success', message, description);
  }, [showToast]);

  const error = useCallback((message: string, description?: string) => {
    showToast('error', message, description);
  }, [showToast]);

  const warning = useCallback((message: string, description?: string) => {
    showToast('warning', message, description);
  }, [showToast]);

  const info = useCallback((message: string, description?: string) => {
    showToast('info', message, description);
  }, [showToast]);

  const value: ToastContextValue = {
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
