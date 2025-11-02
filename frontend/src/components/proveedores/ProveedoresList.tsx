import React, { useState, useEffect } from "react";
import { Table, Card, Button, Alert, Spinner } from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";
import { getProveedores, type Proveedor } from "../../services/apiService"; // Importar
const ProveedoresList: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedores desde la API
  useEffect(() => {
    const cargarProveedores = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getProveedores();
        setProveedores(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los proveedores");
      } finally {
        setIsLoading(false);
      }
    };
    cargarProveedores();
  }, []);

  return (
    <div>
      {/* Logo en la esquina superior derecha */}
      <div className="d-flex justify-content-end mb-3">
        <img
          src={logo}
          alt="Dietética San José"
          style={{ height: "80px", objectFit: "contain" }}
        />
      </div>

      <Card className="mt-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Lista de Proveedores</h5>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => navigate("/proveedores/pedidos/nuevo")}
            >
              🧾 Nuevo Pedido
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={() => navigate("/proveedores/nuevo")}
            >
              <PlusCircle className="me-1" />
              Agregar Proveedor
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando proveedores...</p>
            </div>
          ) : (
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
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProveedoresList;
