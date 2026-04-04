import React from 'react';

interface ToastProps {
  show: boolean;
  onClose: () => void;
  variant?: 'warning' | 'success' | 'danger' | 'info';
  title: React.ReactNode;
  children: React.ReactNode;
  position?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
}

const positionClasses: Record<string, string> = {
  'top-end': 'top-4 right-4',
  'top-start': 'top-4 left-4',
  'bottom-end': 'bottom-4 right-4',
  'bottom-start': 'bottom-4 left-4',
};

const variantClasses: Record<string, string> = {
  warning: 'border-amber-400 bg-amber-50',
  success: 'border-emerald-400 bg-emerald-50',
  danger: 'border-red-400 bg-red-50',
  info: 'border-blue-400 bg-blue-50',
};

const variantHeaderClasses: Record<string, string> = {
  warning: 'border-amber-200',
  success: 'border-emerald-200',
  danger: 'border-red-200',
  info: 'border-blue-200',
};

const Toast: React.FC<ToastProps> = ({
  show,
  onClose,
  variant = 'warning',
  title,
  children,
  position = 'top-end',
}) => {
  if (!show) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-[9999] animate-fade-in`}>
      <div
        className={`w-80 rounded-lg border shadow-lg overflow-hidden ${variantClasses[variant]}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-3 py-2 border-b ${variantHeaderClasses[variant]}`}>
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
            aria-label="Cerrar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <div className="px-3 py-2.5 text-sm font-medium text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Toast;
