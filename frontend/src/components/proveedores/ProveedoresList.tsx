import React, { useState, useEffect } from "react";
import { Table, Card, Button, Alert, Spinner, Modal } from "react-bootstrap"; // <-- Añadido Modal
import { PlusCircle, Trash } from "react-bootstrap-icons"; // <-- Añadido Trash
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";
import { getProveedores, deleteProveedor, type Proveedor } from "../../services/apiService"; // <-- Añadido deleteProveedor

const ProveedoresList: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null); // <-- Añadido para feedback

  // --- NUEVOS ESTADOS PARA EL MODAL DE ELIMINACIÓN ---
  const [showModal, setShowModal] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] =
    useState<Proveedor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // ---

  // Cargar proveedores desde la API
  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setIsLoading(true);
    setError(null);
    setExito(null); // Limpiar éxito
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los proveedores");
    } finally {
      setIsLoading(false);
    }
  };

  // --- NUEVAS FUNCIONES PARA ELIMINAR ---

  // Abre el modal de confirmación
  const abrirModalEliminar = (proveedor: Proveedor) => {
    setProveedorAEliminar(proveedor);
    setShowModal(true);
    setError(null); // Limpiar error al abrir
  };

  // Cierra el modal
  const cancelarEliminacion = () => {
    setShowModal(false);
    setProveedorAEliminar(null);
  };

  // Llama a la API para eliminar
  const confirmarEliminacion = async () => {
    if (!proveedorAEliminar) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteProveedor(proveedorAEliminar.id);
      
      // Actualizar el estado local para quitar el proveedor
      setProveedores((prev) =>
        prev.filter((p) => p.id !== proveedorAEliminar.id),
      );
      
      setExito(`Proveedor "${proveedorAEliminar.nombre}" eliminado exitosamente.`);
      setShowModal(false);
      setProveedorAEliminar(null);
      
      setTimeout(() => setExito(null), 3000); // Limpiar mensaje de éxito

    } catch (apiError: any) {
      console.error("Error al eliminar proveedor:", apiError);
      setError(apiError.message || "No se pudo eliminar el proveedor.");
      // Mantenemos el modal abierto para mostrar el error
    } finally {
      setIsDeleting(false);
    }
  };

  // --- FIN DE NUEVAS FUNCIONES ---

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
          {error && !isDeleting && ( // No mostrar error general si es un error del modal
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          
          {exito && (
             <Alert variant="success" onClose={() => setExito(null)} dismissible>
              {exito}
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
                  <th>Acciones</th> {/* <-- NUEVA COLUMNA */}
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
                      {/* --- CELDA DE ACCIÓN (Comentario eliminado) --- */}
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => abrirModalEliminar(proveedor)}
                          title="Eliminar proveedor"
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center"> {/* <-- ColSpan a 6 */}
                      No hay proveedores disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* --- NUEVO MODAL DE CONFIRMACIÓN --- */}
      <Modal show={showModal} onHide={cancelarEliminacion} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#8f3d38", color: "white" }}
        >
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && isDeleting && (
            <Alert variant="danger">{error}</Alert>
          )}
          {proveedorAEliminar && (
            <>
              <p>¿Estás seguro de que deseas eliminar al proveedor?</p>
              <div className="alert alert-warning">
                <strong>{proveedorAEliminar.nombre}</strong>
                <br />
                Contacto: {proveedorAEliminar.contacto}
                <br />
                Email: {proveedorAEliminar.email}
              </div>
              <p className="text-danger">
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={cancelarEliminacion}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmarEliminacion}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProveedoresList;

