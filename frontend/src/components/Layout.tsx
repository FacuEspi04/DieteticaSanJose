import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Dropdown } from 'react-bootstrap';
import { List } from 'react-bootstrap-icons';

interface LayoutProps {
  brand?: string;
  image?: string;
  logo?: string;
  navLinks?: { name: string; path: string }[];
}



const Layout: React.FC<LayoutProps> = ({
  brand = 'Mi Empresa',
  image,
  navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Articulos', path: '/articulos' },
    { name: 'Proveedores', path: '/proveedores' },
    { name: 'Ventas', path: '/ventas' },
  ],
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Helper function para verificar la ruta activa en Dropdown.Item
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
    <Nav className="flex-column">
      {navLinks.map((link, index) => {
        
        // --- Refactorizado: 'Ventas' usa Dropdown ---
        if (link.name === 'Ventas') {
          return (
            <Dropdown className="mb-1" key={index}>
              <Dropdown.Toggle
                variant="link"
                // Clases del ejemplo para que parezca un NavLink
                className="nav-link p-2 rounded mb-1 custom-navlink w-100"
              >
                Ventas
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  as={Link}
                  to="/ventas"
                  // Clase activa del ejemplo
                  className={isActive("/ventas") ? "bg-secondary" : ""}
                  onClick={() => setSidebarOpen(false)}
                >
                  Resumen de Caja
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  to="/ventas/cuentas-corrientes"
                  className={isActive("/ventas/cuentas-corrientes") ? "bg-secondary" : ""}
                  onClick={() => setSidebarOpen(false)}
                >
                  Cuentas Corrientes
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  to="/ventas/nueva"
                  className={isActive("/ventas/nueva") ? "bg-secondary" : ""}
                  onClick={() => setSidebarOpen(false)}
                >
                  Nueva Venta
                </Dropdown.Item>
                
                <Dropdown.Divider />
                
                <Dropdown.Item
                  as={Link}
                  to="/ventas/nuevo-retiro"
                  // Combina la clase activa y la clase de peligro
                  className={`${isActive("/ventas/nuevo-retiro") ? "bg-secondary" : ""} text-danger`}
                  onClick={() => setSidebarOpen(false)}
                >
                  Registrar Retiro
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          );
        }

        // --- Refactorizado: 'Proveedores' usa Dropdown ---
        if (link.name === 'Proveedores') {
          return (
            <Dropdown className="mb-1" key={index}>
              <Dropdown.Toggle
                variant="link"
                className="nav-link p-2 rounded mb-1 custom-navlink w-100"
              >
                Proveedores
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  as={Link}
                  to="/proveedores/pedidos/nuevo"
                  className={isActive("/proveedores/pedidos/nuevo") ? "bg-secondary" : ""}
                  onClick={() => setSidebarOpen(false)}
                >
                  Nuevo Pedido
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  to="/proveedores/pedidos/lista"
                  className={isActive("/proveedores/pedidos/lista") ? "bg-secondary" : ""}
                  onClick={() => setSidebarOpen(false)}
                >
                  Lista de Pedidos
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  to="/proveedores"
                  className={isActive("/proveedores") ? "bg-secondary" : ""}
                  onClick={() => setSidebarOpen(false)}
                >
                  Lista de Proveedores
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          );
        }

        // --- Refactorizado: Enlaces normales usan NavLink ---
        return (
          <NavLink
            key={index}
            to={link.path}
            // Lógica de clase activa de tu ejemplo
            className={({ isActive }) =>
              `nav-link p-2 rounded mb-1 custom-navlink ${
                isActive ? "bg-secondary" : ""
              }`
            }
            onClick={() => setSidebarOpen(false)}
          >
            {link.name}
          </NavLink>
        );
      })}
    </Nav>
  </div>

      {/* Header fijo */}
      <Navbar variant="dark" expand="lg" className="main-navbar">
        <Container fluid>
          <Button
            variant="dark"
            onClick={toggleSidebar}
            className="me-2 menu-toggle-btn"
          >
            <List size={24} />
          </Button>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            {image && (
              <img
                src={image}
                alt="Logo"
                height="40"
                className="me-2"
                style={{ objectFit: 'contain' }}
              />
            )}
            {brand}
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* Contenido principal */}
      <div className={`main-content ${sidebarOpen ? 'main-content-shifted' : 'main-content-normal'}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
