import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Table,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";
// --- 1. AÑADIDO: Imports para PDF e íconos ---
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileEarmarkPdf, ClipboardPlus } from "react-bootstrap-icons";
// ---------------------------------------------
import {
  createPedido,
  getArticulos,
  getProveedores,
  type Articulo,
  type CreatePedidoDto,
  type Pedido,
  type Proveedor,
} from "../../services/apiService";

interface ItemPedido {
  articulo: Articulo; // Usaremos el tipo 'Articulo' completo
  cantidad: number;
}

// Interfaz para el pedido guardado (la respuesta de la API)
type PedidoGuardado = Pedido;

const CrearPedido: React.FC = () => {
  const navigate = useNavigate();

  // Estados de datos
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [catalogoArticulos, setCatalogoArticulos] = useState<Articulo[]>([]);

  // Estados del formulario
  const [proveedorId, setProveedorId] = useState<string>("");
  const [articuloId, setArticuloId] = useState<string>("");
  const [cantidad, setCantidad] = useState<number>(1);
  const [itemsPedido, setItemsPedido] = useState<ItemPedido[]>([]);
  const [observaciones, setObservaciones] = useState<string>("");

  // Estados de UI
  const [showConfirm, setShowConfirm] = useState(false);
  const [exito, setExito] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [pedidoConfirmado, setPedidoConfirmado] =
    useState<PedidoGuardado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carga inicial de datos
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [provData, artData] = await Promise.all([
          getProveedores(),
          getArticulos(),
        ]);

        const articulosMapeados = artData.map((a) => ({
          ...a,
          id: Number(a.id),
          precio: Number(a.precio),
        }));

        setProveedores(provData);
        setCatalogoArticulos(articulosMapeados);
      } catch (err: any) {
        setError(err.message || "Error al cargar datos iniciales");
      } finally {
        setIsLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const agregarItem = () => {
    setError("");
    const idBuscado = Number(articuloId);
    const art = catalogoArticulos.find((a) => a.id === idBuscado);

    if (!art) {
      setError("Selecciona un artículo válido");
      return;
    }
    if (cantidad <= 0) {
      setError("La cantidad debe ser mayor a 0");
      return;
    }

    const existente = itemsPedido.find((i) => i.articulo.id === art.id);
    if (existente) {
      setItemsPedido(
        itemsPedido.map((i) =>
          i.articulo.id === art.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i,
        ),
      );
    } else {
      setItemsPedido([...itemsPedido, { articulo: art, cantidad }]);
    }
    setArticuloId("");
    setCantidad(1);
  };

  const eliminarItem = (id: number) => {
    setItemsPedido(itemsPedido.filter((i) => i.articulo.id !== id));
  };

  const abrirConfirmacion = () => {
    setError("");
    if (!proveedorId) {
      setError("Selecciona un proveedor");
      return;
    }
    if (itemsPedido.length === 0) {
      setError("Agrega al menos un artículo al pedido");
      return;
    }
    setShowConfirm(true);
  };

  const confirmarPedido = async () => {
    setIsSubmitting(true);
    setError("");

    const pedidoDto: CreatePedidoDto = {
      proveedorId: Number(proveedorId),
      notas: observaciones || undefined,
      items: itemsPedido.map((item) => ({
        articuloId: item.articulo.id,
        cantidad: item.cantidad,
      })),
    };

    try {
      const pedidoGuardado = await createPedido(pedidoDto);

      setPedidoConfirmado(pedidoGuardado);
      setShowConfirm(false);
      setExito("¡Pedido creado exitosamente!");

      setItemsPedido([]);
      setProveedorId("");
      setObservaciones("");
      setArticuloId("");
      setCantidad(1);

      setTimeout(() => setExito(""), 3000);
    } catch (err: any) {
      console.error("Error al confirmar pedido:", err);
      setError(err.message || "Error al confirmar el pedido");
      setShowConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNuevoPedido = () => {
    setPedidoConfirmado(null);
    setExito("");
    setError("");
    setItemsPedido([]);
    setProveedorId("");
    setObservaciones("");
    setArticuloId("");
    setCantidad(1);
  };

  // --- 2. FUNCIÓN DE IMPRESIÓN REEMPLAZADA POR JSPDF ---
  const imprimirPedido = (pedido: PedidoGuardado) => {
    const doc = new jsPDF();
    const margin = 14;
    const fechaFormateada = new Date(pedido.fechaPedido).toLocaleDateString(
      "es-AR",
    );

    // Título
    doc.setFontSize(18);
    doc.text(`Pedido a Proveedor`, margin, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha Pedido: ${fechaFormateada}`, margin, 28);
    doc.text(
      `Estado: ${pedido.estado}`,
      margin,
      34
    );

    // Sección Proveedor (como texto simple)
    doc.setFontSize(14);
    doc.text("Proveedor", margin, 46);
    doc.setFontSize(11);
    doc.setTextColor(0); // Reset text color
    let startY = 52;
    doc.text(`Nombre: ${pedido.proveedor.nombre}`, margin, startY);
    if (pedido.proveedor.contacto) {
      startY += 6;
      doc.text(`Contacto: ${pedido.proveedor.contacto}`, margin, startY);
    }
    if (pedido.proveedor.telefono) {
      startY += 6;
      doc.text(`Teléfono: ${pedido.proveedor.telefono}`, margin, startY);
    }
    if (pedido.proveedor.email) {
      startY += 6;
      doc.text(`Email: ${pedido.proveedor.email}`, margin, startY);
    }
    
    // Observaciones
    if (pedido.notas) {
      startY += 8; // Extra space
      doc.setFontSize(12);
      doc.text("Observaciones:", margin, startY);
      doc.setFontSize(11);
      startY += 6;
      // Usar splitTextToSize para notas largas
      const notes = doc.splitTextToSize(pedido.notas, 180); // 180mm width
      doc.text(notes, margin, startY);
      startY += notes.length * 6; // Ajustar Y
    }

    // Sección Artículos (Tabla)
    startY += 10;
    doc.setFontSize(14);
    doc.text("Artículos Pedidos", margin, startY);

    autoTable(doc, {
      startY: startY + 4,
      head: [["Artículo", "Cantidad Pedida"]],
      body: pedido.items.map((i) => [
        i.articulo.nombre, 
        i.cantidad
      ]),
      theme: "striped",
      headStyles: { fillColor: [143, 61, 56] }, // Color principal
    });

    // Guardar el archivo
    doc.save(
      `pedido_${pedido.proveedor.nombre.replace(/ /g, "_")}_${fechaFormateada}.pdf`,
    );
  };
  // --- FIN DE LA FUNCIÓN MODIFICADA ---

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
        <Card.Header>
          <h5 className="mb-0">Nuevo Pedido a Proveedor</h5>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {exito && (
            <Alert variant="success" dismissible onClose={() => setExito("")}>
              {exito}
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando datos...</p>
            </div>
          ) : (
            <>
              {!pedidoConfirmado && (
                <>
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Proveedor</Form.Label>
                        <Form.Select
                          value={proveedorId}
                          onChange={(e) => setProveedorId(e.target.value)}
                        >
                          <option value="">Selecciona un proveedor...</option>
                          {proveedores.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Observaciones</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Notas del pedido (opcional)"
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={7}>
                      <Form.Group>
                        <Form.Label>Artículo</Form.Label>
                        <Form.Select
                          value={articuloId}
                          onChange={(e) => setArticuloId(e.target.value)}
                        >
                          <option value="">Selecciona un artículo...</option>
                          {catalogoArticulos.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nombre}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Cantidad</Form.Label>
                        <Form.Control
                          type="number"
                          min={1}
                          value={cantidad}
                          onChange={(e) =>
                            setCantidad(parseInt(e.target.value || "0", 10))
                          }
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2} className="d-flex align-items-end">
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={agregarItem}
                      >
                        Agregar
                      </Button>
                    </Col>
                  </Row>

                  <Table striped bordered hover responsive>
                    <thead
                      style={{ backgroundColor: "#8f3d38", color: "white" }}
                    >
                      <tr>
                        <th>Artículo</th>
                        <th style={{ width: 120 }}>Cantidad</th>
                        <th style={{ width: 120 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsPedido.length > 0 ? (
                        itemsPedido.map((item) => (
                          <tr key={item.articulo.id}>
                            <td>{item.articulo.nombre}</td>
                            <td>
                              <Form.Control
                                type="number"
                                min={1}
                                value={item.cantidad}
                                onChange={(e) => {
                                  const val = parseInt(
                                    e.target.value || "0",
                                    10,
                                  );
                                  setItemsPedido(
                                    itemsPedido.map((i) =>
                                      i.articulo.id === item.articulo.id
                                        ? { ...i, cantidad: val }
                                        : i,
                                    ),
                                  );
                                }}
                              />
                            </td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => eliminarItem(item.articulo.id)}
                              >
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center">
                            Sin artículos agregados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </>
              )}

              {/* --- 3. MODIFICACIÓN: Iconos en botones --- */}
              <div className="d-flex justify-content-end gap-2">
                {!pedidoConfirmado ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => navigate("/proveedores")}
                    >
                      Volver
                    </Button>
                    <Button variant="success" onClick={abrirConfirmacion}>
                      Confirmar Pedido
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="success" onClick={handleNuevoPedido}>
                      <ClipboardPlus className="me-1" />
                      Hacer Nuevo Pedido
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => imprimirPedido(pedidoConfirmado)}
                    >
                      <FileEarmarkPdf className="me-1" />
                      Descargar PDF
                    </Button>
                  </>
                )}
              </div>
              {/* --- FIN DE LA MODIFICACIÓN --- */}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal de confirmación */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Pedido</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && isSubmitting && <Alert variant="danger">{error}</Alert>}
          {!proveedorId ? (
            <Alert variant="danger">Selecciona un proveedor</Alert>
          ) : (
            <>
              <p>
                <strong>Proveedor:</strong>{" "}
                {
                  proveedores.find((p) => p.id === Number(proveedorId))
                    ?.nombre
                }
              </p>
              <p>
                <strong>Artículos:</strong>
              </p>
              <ul>
                {itemsPedido.map((i) => (
                  <li key={i.articulo.id}>
                    {i.articulo.nombre} x{i.cantidad}
                  </li>
                ))}
              </ul>
              {observaciones && (
                <p>
                  <strong>Observaciones:</strong> {observaciones}
                </p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirm(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={confirmarPedido}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Confirmando...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CrearPedido;