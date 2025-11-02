import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import { CashCoin, CheckCircle } from "react-bootstrap-icons";
import logo from "../../assets/dietSanJose.png";
import {
  getVentasPendientes,
  registrarPagoVenta,
  type Venta,
  type FormaPago, // <-- 1. IMPORTAMOS EL TIPO
  type VentaDetalle, // Importamos para la lógica
} from "../../services/apiService";

const CuentasCorrientes: React.FC = () => {
  const [ventasPendientes, setVentasPendientes] = useState<Venta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  
  // --- 2. CORRECCIÓN DE ESTADO INICIAL ---
  // Usamos el TIPO string, pero con el valor inicial correcto
  const [formaPagoPago, setFormaPagoPago] = useState<FormaPago>("efectivo");
  
  const [interesPorcentajePago, setInteresPorcentajePago] =
    useState<string>("10");
  const [exito, setExito] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    cargarVentasPendientes();
  }, []);

  const cargarVentasPendientes = async () => {
    setIsLoading(true);
    setError(null);
    setExito(""); // Limpiar éxito al cargar
    try {
      const data = await getVentasPendientes();
      setVentasPendientes(data);
    } catch (err: any) {
      console.error("Error al cargar ventas pendientes:", err);
      setError(err.message || "No se pudieron cargar las cuentas pendientes.");
      setVentasPendientes([]); // Limpiar en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar por cliente
  const ventasPorCliente = ventasPendientes.reduce(
    (acc, venta) => {
      // Usamos clienteNombre que viene de la API
      const clienteKey = venta.clienteNombre || "Cliente General"; 
      if (!acc[clienteKey]) {
        acc[clienteKey] = [];
      }
      acc[clienteKey].push(venta);
      return acc;
    },
    {} as { [cliente: string]: Venta[] },
  );

  // Calcular deuda total por cliente
  const calcularDeudaCliente = (cliente: string): number => {
    return ventasPorCliente[cliente].reduce(
      (total, venta) => total + Number(venta.total), // Aseguramos que 'total' sea número
      0,
    );
  };

  // Abrir modal de pago
  const abrirModalPago = (venta: Venta) => {
    setVentaSeleccionada(venta);
    // --- 3. CORRECCIÓN AL ABRIR MODAL ---
    setFormaPagoPago("efectivo"); // Siempre default al string "efectivo"
    setInteresPorcentajePago("10"); // Default interés
    setError(null); // Limpiar errores del modal
    setShowModal(true);
  };

  // Registrar pago
  const registrarPago = async () => {
    if (!ventaSeleccionada) return;

    setIsSubmitting(true);
    setError(null);

    const porcentaje = parseFloat(interesPorcentajePago) || 0;
    
    // --- 4. CORRECCIÓN: Comparar con string ---
    const interesCalculado =
      formaPagoPago === "credito" 
        ? (Number(ventaSeleccionada.subtotal) * porcentaje) / 100
        : 0;

    try {
      const pagoDto = {
        formaPago: formaPagoPago,
        interes: interesCalculado,
      };

      // Llamar a la API para registrar el pago
      const ventaPagada = await registrarPagoVenta(ventaSeleccionada.id, pagoDto);

      // Actualizar el estado local (eliminar la venta de la lista de pendientes)
      setVentasPendientes((prevVentas) =>
        prevVentas.filter((v) => v.id !== ventaSeleccionada.id),
      );

      setShowModal(false);
      setExito(
        `¡Pago registrado exitosamente! Venta N°${
          ventaPagada.numeroVenta
        } - ${ventaPagada.clienteNombre} - $${Number(ventaPagada.total).toFixed(2)}`,
      );
      setVentaSeleccionada(null);

      setTimeout(() => setExito(""), 4000); // Mostrar éxito por 4 seg
    } catch (apiError: any) {
      console.error("Error al registrar el pago:", apiError);
      setError(apiError.message || "No se pudo registrar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaISO: string | Date): string => {
    const fecha = new Date(fechaISO);
    // CORRECCIÓN TIMEZONE: No ajustar manualmente
    const day = String(fecha.getDate()).padStart(2, '0');
    const month = String(fecha.getMonth() + 1).padStart(2, '0'); // Month es 0-indexed
    const year = fecha.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Formatear hora
  const formatearHora = (fechaISO: string | Date): string => {
     const fecha = new Date(fechaISO);
     // CORRECCIÓN TIMEZONE: No ajustar manualmente
     return fecha.toLocaleTimeString("es-AR", {
     hour: "2-digit",
     minute: "2-digit",
   });
  }

  return (
    <div>
      {/* Logo */}
      <div className="d-flex justify-content-end mb-3">
        <img
          src={logo}
          alt="Dietética San José"
          style={{ height: "60px", objectFit: "contain" }}
        />
      </div>

      <Card className="mt-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0 text-center">
            <CashCoin className="me-2" />
            Cuentas Corrientes - Pagos Pendientes
          </h5>
        </Card.Header>
        <Card.Body>
          {exito && (
            <Alert variant="success" className="d-flex align-items-center">
              <CheckCircle size={24} className="me-2" />
              {exito}
            </Alert>
          )}

          {error && !isSubmitting && ( // No mostrar error general si hay error en modal
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando deudas...</p>
            </div>
          ) : Object.keys(ventasPorCliente).length > 0 ? (
            <>
              {Object.keys(ventasPorCliente).map((cliente) => (
                <Card
                  key={cliente}
                  className="mb-3"
                  style={{ border: "1px solid #8f3d38" }}
                >
                  <Card.Header
                    style={{ backgroundColor: "#8f3d38", color: "white" }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>👤 {cliente}</strong>
                      <Badge bg="danger" style={{ fontSize: "1rem" }}>
                        Deuda Total: ${calcularDeudaCliente(cliente).toFixed(2)}
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Table striped bordered hover responsive size="sm">
                      <thead>
                        <tr>
                          <th>Fecha Compra</th>
                          <th>Hora</th>
                          <th>Productos</th>
                          <th>Total</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventasPorCliente[cliente].map((venta) => (
                          <tr key={venta.id}>
                            <td>{formatearFecha(venta.fechaHora)}</td>
                            <td>{formatearHora(venta.fechaHora)}</td>
                            <td>
                              <small>
                                {/* Usamos el tipo VentaDetalle que viene de la API */}
                                {venta.items.map((item: VentaDetalle, idx) => (
                                  <div key={idx}>
                                    {/* Asumimos que 'articulo' está cargado (eager: true en backend) */}
                                    {item.articulo?.nombre || 'Artículo no encontrado'} x{item.cantidad}
                                  </div>
                                ))}
                              </small>
                            </td>
                            <td>
                              <strong>${Number(venta.total).toFixed(2)}</strong>
                            </td>
                            <td className="text-center">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => abrirModalPago(venta)}
                              >
                                💰 Registrar Pago
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              ))}
            </>
          ) : (
            <Alert variant="info" className="text-center">
              ✅ No hay cuentas corrientes pendientes de pago
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Modal de registro de pago */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#8f3d38", color: "white" }}
        >
          <Modal.Title>Registrar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Error dentro del modal */}
          {error && isSubmitting && (
            <Alert variant="danger">{error}</Alert>
          )}

          {ventaSeleccionada && (
            <>
              <h6 className="mb-3">
                Cliente: <strong>{ventaSeleccionada.clienteNombre}</strong>
              </h6>
              <p>
                <strong>Fecha de compra:</strong>{" "}
                {formatearFecha(ventaSeleccionada.fechaHora)}
              </p>

              <Alert variant="info">
                <strong>Productos:</strong>
                <ul className="mb-0 mt-2">
                  {ventaSeleccionada.items.map((item: VentaDetalle, idx) => (
                    <li key={idx}>
                      {item.articulo?.nombre || 'Artículo no encontrado'} x{item.cantidad} = $
                      {Number(item.subtotal).toFixed(2)}
                    </li>
                  ))}
                </ul>
              </Alert>

              <h5 className="text-center mb-3">
                Total base (sin interés):{" "}
                <span style={{ color: "#8f3d38" }}>
                  ${Number(ventaSeleccionada.subtotal).toFixed(2)}
                </span>
              </h5>

              <Form.Group>
                <Form.Label>
                  Forma de Pago <span className="text-danger">*</span>
                </Form.Label>
                {/* --- 5. CORRECCIÓN EN EL FORMULARIO --- */}
                {/* Usamos los valores de string del TIPO FormaPago */}
                <Form.Select
                  value={formaPagoPago}
                  onChange={(e) => setFormaPagoPago(e.target.value as FormaPago)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  <option value="transferencia">Transferencia</option>
                </Form.Select>
              </Form.Group>

              {formaPagoPago === "credito" && ( // <-- 6. CORRECCIÓN: Comparar con string
                <Form.Group className="mt-3">
                  <Form.Label>Interés para Tarjeta de Crédito (%)</Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.5"
                      value={interesPorcentajePago}
                      onChange={(e) => setInteresPorcentajePago(e.target.value)}
                      style={{ maxWidth: "140px" }}
                    />
                    <span className="text-muted">
                      +${(
                        (Number(ventaSeleccionada.subtotal) *
                          (parseFloat(interesPorcentajePago) || 0)) /
                        100
                      ).toFixed(2)}{" "}
                      interés
                    </span>
                  </div>
                  <div className="mt-2 fw-bold text-end">
                    Total a Pagar: $
                    {(
                      Number(ventaSeleccionada.subtotal) +
                      (Number(ventaSeleccionada.subtotal) *
                        (parseFloat(interesPorcentajePago) || 0)) /
                        100
                    ).toFixed(2)}
                  </div>
                </Form.Group>
              )}

              <Alert variant="warning" className="mt-3 mb-0">
                <small>
                  ⚠️ Al confirmar, esta venta se marcará como{" "}
                  <strong>Completada</strong> y se sumará al total del día de
                  HOY con el turno actual.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={registrarPago}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                {' '}Confirmando...
              </>
            ) : (
              "Confirmar Pago"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CuentasCorrientes;

