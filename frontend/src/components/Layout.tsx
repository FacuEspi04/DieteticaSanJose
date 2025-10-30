import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Navbar, Nav, Button, Container, NavDropdown } from 'react-bootstrap';
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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Nav className="flex-column">
          {navLinks.map((link, index) => {
            if (link.name === 'Ventas') {
              return (
                <NavDropdown 
                  title={<span style={{ color: 'white' }}>Ventas</span>} 
                  id="ventas-dropdown" 
                  key={index} 
                  className="sidebar-link"
                  menuVariant="white"
                  style={{ color: 'white' }}
                >
                  <NavDropdown.Item as={Link} to="/ventas" onClick={() => setSidebarOpen(false)}>
                    Lista de Ventas
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/ventas/cuentas-corrientes" onClick={() => setSidebarOpen(false)}>
                    Cuentas Corrientes
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/ventas/nueva" onClick={() => setSidebarOpen(false)}>
                    Nueva Venta
                  </NavDropdown.Item>
                </NavDropdown>
              );
            }
            if (link.name === 'Proveedores') {
              return (
                <NavDropdown title={<span style={{ color: 'white' }}>Proveedores</span>} id="proveedores-dropdown" key={index} className="sidebar-link" menuVariant="white" style={{ color: 'white' }}>
                  <NavDropdown.Item as={Link} to="/proveedores/pedidos/nuevo" onClick={() => setSidebarOpen(false)}>
                    Nuevo Pedido
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/proveedores/pedidos/lista" onClick={() => setSidebarOpen(false)}>
                    Lista de Pedidos
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/proveedores" onClick={() => setSidebarOpen(false)}>
                    Lista de Proveedores
                  </NavDropdown.Item>
                </NavDropdown>
              );
            }
            return (
              <Nav.Link
                as={Link}
                key={index}
                to={link.path}
                className="sidebar-link"
                onClick={() => setSidebarOpen(false)}
              >
                {link.name}
              </Nav.Link>
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