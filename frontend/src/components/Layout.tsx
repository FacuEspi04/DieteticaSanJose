import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  Menu,
  X,
} from 'lucide-react';
import LicenseStatusBadge from './common/LicenseStatusBadge';

interface LayoutProps {
  navLinks?: { name: string; path: string }[];
}

const Layout: React.FC<LayoutProps> = ({
  navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Articulos', path: '/articulos' },
    { name: 'Pedidos', path: '/proveedores/pedidos/lista' },
    { name: 'Ventas', path: '/ventas' },
  ],
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navIcons: Record<string, React.ReactNode> = {
    'Inicio': <Home size={18} />,
    'Articulos': <Package size={18} />,
    'Pedidos': <ClipboardList size={18} />,
    'Ventas': <ShoppingCart size={18} />,
  };

  return (
    <div className="layout-container">
      {/* Navbar */}
      <nav className="main-navbar">
        <div className="flex items-center justify-between px-4 min-h-[64px] max-w-[1280px] w-full mx-auto relative">
          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden p-2 text-white/70 hover:text-white cursor-pointer z-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Nav links (Centered visually) */}
          <div
            className={`${
              mobileOpen ? 'flex' : 'hidden'
            } md:flex absolute md:static top-[64px] left-0 w-full md:w-auto bg-slate-900 md:bg-transparent flex-col md:flex-row items-center justify-center flex-1 gap-2 md:gap-6 py-4 md:py-0 shadow-md md:shadow-none z-40 transition-all`}
          >
            {navLinks.map((link, index) => (
              <NavLink
                key={index}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `custom-navlink p-2 rounded ${isActive ? 'active' : ''}`
                }
              >
                {navIcons[link.name] || <Home size={18} />}
                <span className="ml-2">{link.name}</span>
              </NavLink>
            ))}
          </div>

          {/* Right Section (License Badge) */}
          <div className="flex items-center justify-end z-50">
            <LicenseStatusBadge />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="main-content mx-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
