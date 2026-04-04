import React, { useEffect, useRef } from 'react';

/* ─── Main Modal ─── */
interface ModalProps {
  show: boolean;
  onHide?: () => void;
  centered?: boolean;
  size?: 'sm' | 'lg' | 'xl';
  fullscreen?: boolean;
  backdrop?: 'static' | boolean;
  keyboard?: boolean;
  dialogClassName?: string;
  children: React.ReactNode;
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const Modal: React.FC<ModalProps> & {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
} = ({
  show,
  onHide,
  centered = true,
  size,
  fullscreen = false,
  backdrop = true,
  keyboard = true,
  dialogClassName = '',
  children,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!show || !keyboard) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onHide) onHide();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, keyboard, onHide]);

  // Lock body scroll
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (backdrop !== 'static' && e.target === overlayRef.current && onHide) {
      onHide();
    }
  };

  const dialogSize = fullscreen
    ? 'w-full h-full'
    : `w-[95%] ${sizeClasses[size || ''] || 'max-w-lg'}`;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[1050] flex ${centered ? 'items-center' : 'items-start pt-12'} justify-center bg-black/40 backdrop-blur-[2px] animate-fade-in`}
    >
      <div
        className={`${dialogSize} ${fullscreen ? '' : 'rounded-xl'} bg-white shadow-2xl flex flex-col max-h-[90vh] animate-slide-up ${dialogClassName}`}
      >
        {children}
      </div>
    </div>
  );
};

/* ─── Header ─── */
interface ModalHeaderProps {
  closeButton?: boolean;
  onHide?: () => void;
  className?: string;
  children: React.ReactNode;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({
  closeButton = false,
  onHide,
  className = '',
  children,
}) => {
  // Detect "brand" header (dark bg) for white close button
  const isBrand = className.includes('modal-header-brand');

  return (
    <div
      className={`flex items-center justify-between px-5 py-3.5 border-b border-slate-200 shrink-0 ${
        isBrand ? 'bg-slate-800 text-white rounded-t-xl' : ''
      } ${className}`}
    >
      <div className="flex-1">{children}</div>
      {closeButton && onHide && (
        <button
          onClick={onHide}
          className={`ml-3 p-1 rounded-md transition-colors cursor-pointer ${
            isBrand
              ? 'text-white/70 hover:text-white hover:bg-white/10'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          aria-label="Cerrar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

/* ─── Title ─── */
const ModalTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h5 className={`text-lg font-semibold ${className}`}>{children}</h5>
);

/* ─── Body ─── */
const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-5 py-4 overflow-y-auto flex-1 ${className}`}>{children}</div>
);

/* ─── Footer ─── */
const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-200 shrink-0 ${className}`}>
    {children}
  </div>
);

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
