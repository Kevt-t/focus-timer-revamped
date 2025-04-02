import React, { useState, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastManagerProps {
  toasts: Toast[];
}

const ToastManager: React.FC<ToastManagerProps> = ({ toasts }) => {
  const [visibleToasts, setVisibleToasts] = useState<Toast[]>([]);

  useEffect(() => {
    setVisibleToasts(toasts);
    const interval = setInterval(() => {
      setVisibleToasts((prevToasts) => prevToasts.slice(1));
    }, 5000);
    return () => clearInterval(interval);
  }, [toasts]);

  return (
    <div className="toast-manager fixed top-4 right-4 space-y-2">
      {visibleToasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type} p-4 rounded shadow-md text-white relative`} style={{ backgroundColor: toast.type === 'success' ? '#4caf50' : toast.type === 'error' ? '#f44336' : toast.type === 'info' ? '#fbbf24' : '#2196f3', animation: 'pop 5s linear forwards' }}>
          <span className="font-bold">{toast.type.toUpperCase()}</span>: {toast.message}
          <div className="absolute bottom-0 left-0 h-1 bg-white" style={{ width: '100%', animation: 'progress 5s linear forwards' }}></div>
        </div>
      ))}
    </div>
  );
};

export default ToastManager;
