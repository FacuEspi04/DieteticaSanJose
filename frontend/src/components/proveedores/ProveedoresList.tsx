import React, { useState, useEffect } from "react";
import { Table, Card, Button, Alert, Spinner, Modal } from "react-bootstrap";
// Imports actualizados de iconos
import { PlusCircle, Trash, PencilSquare } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";
import {
  getProveedores,
  deleteProveedor,
  type Proveedor,
} from "../../services/apiService";

const ProveedoresList: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  // Estados para el modal de eliminación
  const [showModal, setShowModal] = useState(false);
  const [proveedorAEliminar, setProveedorAEliminar] =
    useState<Proveedor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar proveedores desde la API
  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setIsLoading(true);
    setError(null);
    setExito(null);
    try {
      const data = await getProveedores();
      setProveedores(data);
    } catch (err: any) {
      setError(err.message || "Error al cargar los proveedores");
    } finally {
      setIsLoading(false);
    }
  };

  // --- NUEVA FUNCIÓN PARA EDITAR ---
  /**
   * Navega a la página de edición del proveedor.
   * Asume que la ruta es /proveedores/editar/:id
   */
  const handleEditar = (id: number) => {
    navigate(`/proveedores/editar/${id}`);
  };
  // --- FIN DE NUEVA FUNCIÓN ---

  // --- Funciones para Eliminar (existentes) ---

  // Abre el modal de confirmación
  const abrirModalEliminar = (proveedor: Proveedor) => {
    setProveedorAEliminar(proveedor);
    setShowModal(true);
    setError(null);
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

      setProveedores((prev) =>
        prev.filter((p) => p.id !== proveedorAEliminar.id),
      );

      setExito(
        `Proveedor "${proveedorAEliminar.nombre}" eliminado exitosamente.`,
      );
      setShowModal(false);
      setProveedorAEliminar(null);

      setTimeout(() => setExito(null), 3000);
    } catch (apiError: any) {
      console.error("Error al eliminar proveedor:", apiError);
      setError(apiError.message || "No se pudo eliminar el proveedor.");
    } finally {
      setIsDeleting(false);
    }
  };
  // --- Fin de funciones de eliminación ---

  return (
    <div>
      {/* Logo */}
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
          {error && !isDeleting && (
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
                  <th>Acciones</th> {/* Columna existente */}
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
                      
                      {/* --- CELDA DE ACCIONES ACTUALIZADA --- */}
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          {/* Botón Editar (NUEVO) */}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditar(proveedor.id)}
                            title="Editar proveedor"
                          >
                            <PencilSquare />
                          </Button>

                          {/* Botón Eliminar (Existente) */}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => abrirModalEliminar(proveedor)}
                            title="Eliminar proveedor"
                          >
                            <Trash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center">
                      {" "}
                      {/* ColSpan sigue siendo 6 */}
                      No hay proveedores disponibles.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* --- Modal de Confirmación (Existente) --- */}
      <Modal show={showModal} onHide={cancelarEliminacion} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#8f3d38", color: "white" }}
        >
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && isDeleting && <Alert variant="danger">{error}</Alert>}
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