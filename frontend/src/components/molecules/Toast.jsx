// Toast Component - Toast notifications
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  };

  const colors = {
    success: '#10B981',
    error: '#EF4444',
    info: '#3B82F6',
  };

  const Icon = icons[toast.type] || Info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className="flex items-center gap-3 shadow-soft-dark rounded-lg p-4 min-w-[300px] max-w-md"
      style={{ 
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)'
      }}
    >
      <div className="rounded-full p-1" style={{ backgroundColor: colors[toast.type] }}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="flex-1 text-sm" style={{ color: 'var(--color-text)' }}>
        {toast.message}
      </p>
      <button
        onClick={onClose}
        className="transition-colors"
        style={{ color: 'var(--color-text-secondary)' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
      >
        <X size={18} />
      </button>
    </motion.div>
  );
};
