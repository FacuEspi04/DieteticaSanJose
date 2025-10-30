// src/components/proveedores/ProveedoresList.tsx
import React from "react";
import { Table, Card, Button } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";

const ProveedoresList: React.FC = () => {
  const navigate = useNavigate();
  
  // Datos de ejemplo
  const proveedores = [
    { id: 1, nombre: "Distribuidora Natural", contacto: "Juan Pérez", telefono: "261-4567890", email: "contacto@natural.com" },
    { id: 2, nombre: "Alimentos Orgánicos SA", contacto: "María González", telefono: "261-4567891", email: "ventas@organicos.com" },
    { id: 3, nombre: "Productos del Campo", contacto: "Carlos Rodríguez", telefono: "261-4567892", email: "info@campo.com" },
  ];

  return (
    <div>
      {/* Logo en la esquina superior derecha */}
      <div className="d-flex justify-content-end mb-3">
        <img 
          src={logo} 
          alt="Dietética San José" 
          style={{ height: '80px', objectFit: 'contain' }}
        />
      </div>

      <Card className="mt-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Lista de Proveedores</h5>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            size="sm"
            onClick={() => navigate('/proveedores/pedidos/nuevo')}
          >
            🧾 Nuevo Pedido
          </Button>
          <Button 
            variant="success" 
            size="sm"
            onClick={() => navigate('/proveedores/nuevo')}
          >
            <PlusCircle className="me-1" />
            Agregar Proveedor
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead style={{ backgroundColor: "#8f3d38", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {proveedores && proveedores.length > 0 ? (
              proveedores.map((proveedor) => (
                <tr key={proveedor.id}>
                  <td>{proveedor.id}</td>
                  <td>{proveedor.nombre}</td>
                  <td>{proveedor.contacto}</td>
                  <td>{proveedor.telefono}</td>
                  <td>{proveedor.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  No hay proveedores disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
    </div>
  );
};

export default ProveedoresList;