import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface ToastContainerProps {
  notifications: AppNotification[];
  removeNotification: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <Toast 
          key={notification.id} 
          notification={notification} 
          onClose={() => removeNotification(notification.id)} 
        />
      ))}
    </div>
  );
};

const Toast: React.FC<{ notification: AppNotification; onClose: () => void }> = ({ notification, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-slate-900 border-green-500/50 text-green-400',
    error: 'bg-slate-900 border-red-500/50 text-red-400',
    info: 'bg-slate-900 border-indigo-500/50 text-indigo-400',
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-xl shadow-black/50 min-w-[300px] animate-[slide-in-right_0.3s_ease-out] ${styles[notification.type]}`}>
      <div className="mt-0.5">{icons[notification.type]}</div>
      <p className="flex-1 text-sm font-medium text-slate-200">{notification.message}</p>
      <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
        <X size={16} />
      </button>
    </div>
  );
};