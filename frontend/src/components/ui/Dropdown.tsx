import React, { useState, useRef, useEffect } from 'react';

/* ─── Main Dropdown ─── */
interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> & {
  Toggle: typeof DropdownToggle;
  Menu: typeof DropdownMenu;
  Item: typeof DropdownItem;
  Divider: typeof DropdownDivider;
} = ({ children, className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        // Pass open/setOpen to Toggle and Menu
        return React.cloneElement(child as React.ReactElement<any>, { _open: open, _setOpen: setOpen });
      })}
    </div>
  );
};

/* ─── Toggle ─── */
interface ToggleProps {
  children: React.ReactNode;
  size?: 'sm' | 'md';
  variant?: string;
  className?: string;
  _open?: boolean;
  _setOpen?: (v: boolean) => void;
}

const DropdownToggle: React.FC<ToggleProps> = ({
  children,
  size = 'md',
  variant = 'outline-secondary',
  className = '',
  _open,
  _setOpen,
}) => {
  const sizeClass = size === 'sm' ? 'px-2.5 py-1.5 text-sm' : 'px-3 py-2 text-sm';

  const variantClasses: Record<string, string> = {
    'outline-secondary': 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  };

  return (
    <button
      onClick={() => _setOpen?.(!_open)}
      className={`${sizeClass} rounded-lg font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer ${variantClasses[variant] || variantClasses['outline-secondary']} ${className}`}
    >
      {children}
      <svg className={`w-3.5 h-3.5 transition-transform ${_open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
};

/* ─── Menu ─── */
interface MenuProps {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
  _open?: boolean;
  _setOpen?: (v: boolean) => void;
}

const DropdownMenu: React.FC<MenuProps> = ({ children, align = 'start', className = '', _open, _setOpen }) => {
  if (!_open) return null;

  return (
    <div
      className={`absolute z-[1060] mt-1 min-w-[180px] bg-white rounded-lg border border-slate-200 shadow-xl p-1 animate-fade-in ${
        align === 'end' ? 'right-0' : 'left-0'
      } ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, { _setOpen });
      })}
    </div>
  );
};

/* ─── Item ─── */
interface ItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  _setOpen?: (v: boolean) => void;
}

const DropdownItem: React.FC<ItemProps> = ({ children, onClick, disabled = false, className = '', _setOpen }) => {
  return (
    <button
      onClick={() => {
        if (disabled) return;
        onClick?.();
        _setOpen?.(false);
      }}
      disabled={disabled}
      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
        disabled
          ? 'text-slate-400 cursor-not-allowed'
          : 'text-slate-700 hover:bg-slate-100 cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
};

/* ─── Divider ─── */
const DropdownDivider: React.FC = () => (
  <div className="my-1 border-t border-slate-200" />
);

Dropdown.Toggle = DropdownToggle;
Dropdown.Menu = DropdownMenu;
Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;

export default Dropdown;
