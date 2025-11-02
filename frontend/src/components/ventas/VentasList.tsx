import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Card,
  Badge,
  Button,
  Form,
  Row,
  Col,
  Alert,
  Modal,
  Spinner,
} from 'react-bootstrap';
import {
  PlusCircle,
  Calendar,
  CashStack,
  CheckCircle,
  Trash,
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/dietSanJose.png';
import { type Venta, getVentasPorFecha, VentaEstado, FormaPago, deleteVenta } from '../../services/apiService';
// Importamos los servicios y tipos


const VentasList: React.FC = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  const [ventaAEliminar, setVentaAEliminar] = useState<Venta | null>(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  // Cargar ventas al montar y cuando cambia la fecha
  useEffect(() => {
    // Establecer la fecha de hoy por defecto al cargar
    const hoy = new Date().toISOString().split('T')[0];
    setFechaSeleccionada(hoy);
  }, []);

  useEffect(() => {
    // Cargar ventas cuando la fecha seleccionada tenga un valor
    if (fechaSeleccionada) {
      cargarVentas(fechaSeleccionada);
    }
  }, [fechaSeleccionada]);

  const cargarVentas = async (fecha: string) => {
    setIsLoading(true);
    setError(null);
    setExito(null); // Limpiar éxito al cargar
    try {
      const data = await getVentasPorFecha(fecha);
      setVentas(data);
    } catch (err: any) {
      console.error('Error al cargar ventas:', err);
      setError(err.message || 'No se pudieron cargar las ventas.');
      setVentas([]); // Limpiar ventas en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar turno según hora
  const determinarTurno = (
    fechaHoraISO: Date | string,
  ): 'mañana' | 'tarde' | 'fuera' => {
    const fecha = new Date(fechaHoraISO);
    // --- CORRECCIÓN DE TIMEZONE ---
    // No hacemos NINGÚN ajuste manual.
    // Confiamos en que la DB guarda en UTC y el new Date()
    // lo convierte a la zona horaria local del navegador.
    // ---
    
    const h = fecha.getHours();
    const m = fecha.getMinutes();
    
    const tiempoEnMinutos = h * 60 + m;
    // Mañana: 9:00 - 13:30 (540 - 810 minutos)
    if (tiempoEnMinutos >= 540 && tiempoEnMinutos <= 810) return 'mañana';
    // Tarde: 16:30 - 21:00 (990 - 1260 minutos)
    if (tiempoEnMinutos >= 990 && tiempoEnMinutos <= 1260) return 'tarde';
    return 'fuera';
  };
  
  // Memoización de cálculos para performance
  const ventasComputadas = useMemo(() => {
    const completadas = ventas.filter((v) => v.estado === VentaEstado.COMPLETADA);
    const mañana = completadas.filter(
      (v) => determinarTurno(v.fechaHora) === 'mañana',
    );
    const tarde = completadas.filter(
      (v) => determinarTurno(v.fechaHora) === 'tarde',
    );
    return { completadas, mañana, tarde };
  }, [ventas]);

  const { completadas: ventasCompletadas, mañana: ventasMañana, tarde: ventasTarde } = ventasComputadas;

  const calcularTotalesPorFormaPago = (ventas: Venta[]) => {
    const totales: { [key in FormaPago]?: number } = {
      [FormaPago.EFECTIVO]: 0,
      [FormaPago.DEBITO]: 0,
      [FormaPago.CREDITO]: 0,
      [FormaPago.TRANSFERENCIA]: 0,
    };
    ventas.forEach((venta) => {
      const formaPago = venta.formaPago;
      if (formaPago && totales.hasOwnProperty(formaPago)) {
        totales[formaPago]! += Number(venta.total);
      }
    });
    return totales;
  };

  const totalesPorFormaPago = useMemo(() => calcularTotalesPorFormaPago(ventasCompletadas), [ventasCompletadas]);
  const totalesMañana = useMemo(() => calcularTotalesPorFormaPago(ventasMañana), [ventasMañana]);
  const totalesTarde = useMemo(() => calcularTotalesPorFormaPago(ventasTarde), [ventasTarde]);

  const totalMañana = useMemo(() => ventasMañana.reduce((total, v) => total + Number(v.total), 0), [ventasMañana]);
  const totalTarde = useMemo(() => ventasTarde.reduce((total, v) => total + Number(v.total), 0), [ventasTarde]);
  const totalDelDia = useMemo(() => ventasCompletadas.reduce((total, v) => total + Number(v.total), 0), [ventasCompletadas]);


  // Formatear fecha para mostrar
  const formatearFecha = (fechaISO: string | Date): string => {
    const fecha = new Date(fechaISO);
    // --- CORRECCIÓN DE TIMEZONE ---
    // No hacemos NINGÚN ajuste manual.
    // ---
    const [year, month, day] = fecha.toISOString().split("T")[0].split("-");
    return `${day}/${month}/${year}`;
  };

  // Formatear hora
  const formatearHora = (fechaISO: string | Date): string => {
     const fecha = new Date(fechaISO);
     // --- CORRECCIÓN DE TIMEZONE ---
     // No hacemos NINGÚN ajuste manual.
     // ---
     return fecha.toLocaleTimeString("es-AR", {
     hour: "2-digit",
     minute: "2-digit",
   });
  }

  // ELIMINACIÓN DE VENTA
  const abrirModalEliminar = (venta: Venta) => {
    setVentaAEliminar(venta);
    setError(null); // Limpiar error
    setShowModalEliminar(true);
  };
  
  const confirmarEliminacion = async () => {
    if (!ventaAEliminar) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Llamar a la API para eliminar (usamos ID, no numeroVenta, para más precisión)
      await deleteVenta(ventaAEliminar.id);

      // Actualizar el estado local removiendo la venta eliminada
      setVentas((prevVentas) =>
        prevVentas.filter((v) => v.id !== ventaAEliminar.id)
      );
      
      setExito(`Venta N° ${ventaAEliminar.numeroVenta} eliminada correctamente.`);
      setTimeout(() => setExito(null), 3000);

      setShowModalEliminar(false);
      setVentaAEliminar(null);

    } catch (apiError: any) {
      console.error("Error al eliminar la venta:", apiError);
      setError(apiError.message || "No se pudo eliminar la venta.");
      // Mantenemos el modal abierto para mostrar el error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cancelarEliminacion = () => {
    setShowModalEliminar(false);
    setVentaAEliminar(null);
  };

  const getEstadoBadge = (estado: VentaEstado) => {
    if (estado === VentaEstado.COMPLETADA) return "success";
    if (estado === VentaEstado.PENDIENTE) return "warning";
    // if (estado === "Anulada") return "secondary"; // Ya no existe
    return "secondary";
  };

  const getFormaPagoBadge = (formaPago: FormaPago) => {
    const badges: { [key in FormaPago]: string } = {
      [FormaPago.EFECTIVO]: "success",
      [FormaPago.DEBITO]: "info",
      [FormaPago.CREDITO]: "warning",
      [FormaPago.TRANSFERENCIA]: "primary",
    };
    return badges[formaPago] || "secondary";
  };

  // Función para mostrar la forma de pago correctamente
  const formatearFormaPago = (formaPago: FormaPago | null, estado: VentaEstado) => {
    if (estado === VentaEstado.PENDIENTE) return "Cta. Cte.";
    if (!formaPago) return "N/A";

    switch (formaPago) {
      case FormaPago.EFECTIVO: return "Efectivo";
      case FormaPago.DEBITO: return "Débito";
      case FormaPago.CREDITO: return "Crédito";
      case FormaPago.TRANSFERENCIA: return "Transferencia";
      default: return formaPago;
    }
  };

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

      <div className="mt-4">
        <Card className="shadow-sm mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Lista de Ventas</h5>
            <div className="d-flex gap-2">
              <Button
                variant="warning"
                size="sm"
                onClick={() => navigate("/ventas/cuentas-corrientes")}
              >
                <CashStack className="me-1" />
                Cuentas Corrientes
              </Button>
              <Button
                variant="success"
                size="sm"
                onClick={() => navigate("/ventas/nueva")}
              >
                <PlusCircle className="me-1" />
                Nueva Venta
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {/* Selector de fecha */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <Calendar className="me-2" />
                    Seleccionar Fecha
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaSeleccionada}
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Alert variant="info" className="mb-0 w-100">
                  <strong>Fecha seleccionada:</strong>{" "}
                  {fechaSeleccionada
                    ? formatearFecha(fechaSeleccionada)
                    : "Ninguna"}
                </Alert>
              </Col>
            </Row>
            
            {/* Alertas de Éxito o Error general */}
             {exito && (
               <Alert variant="success" className="d-flex align-items-center">
                 <CheckCircle size={24} className="me-2" />
                 {exito}
               </Alert>
             )}
             {error && (
               <Alert variant="danger" onClose={() => setError(null)} dismissible>
                 {error}
               </Alert>
             )}

            {/* Spinner de carga */}
            {isLoading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="success" />
                <p className="mt-2">Cargando ventas del día...</p>
              </div>
            ) : ventas.length > 0 ? ( // Mostrar tabla y totales si hay ventas
              <>
                <Table striped bordered hover responsive>
                  <thead
                    style={{ backgroundColor: "#8f3d38", color: "white" }}
                  >
                    <tr>
                      <th>N° Venta</th>
                      <th>Hora</th>
                      <th>Turno</th>
                      <th>Cliente</th>
                      <th>Productos</th>
                      <th>Forma de Pago</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ventas.map((venta) => {
                      const turno = determinarTurno(venta.fechaHora);
                      return (
                        <tr key={venta.numeroVenta}>
                          <td>{venta.numeroVenta ?? "-"}</td>
                          <td>{formatearHora(venta.fechaHora)}</td>
                          <td>
                            {turno === "mañana" && (
                              <Badge bg="info">Mañana</Badge>
                            )}
                            {turno === "tarde" && (
                              <Badge bg="warning">Tarde</Badge>
                            )}
                            {turno === "fuera" && (
                              <Badge bg="secondary">⏰ Fuera de turno</Badge>
                            )}
                          </td>
                          <td>{venta.clienteNombre}</td>
                          <td>
                            <small>
                              {venta.items.map((item, idx) => (
                                <div key={idx}>
                                  {item.articulo.nombre} x{item.cantidad}
                                </div>
                              ))}
                            </small>
                          </td>
                          <td>
                            <Badge
                              bg={
                                venta.formaPago &&
                                venta.estado === VentaEstado.COMPLETADA
                                  ? getFormaPagoBadge(venta.formaPago)
                                  : "secondary"
                              }
                            >
                              {formatearFormaPago(venta.formaPago, venta.estado)}
                            </Badge>
                            {venta.formaPago === FormaPago.CREDITO &&
                              Number(venta.interes) > 0 && (
                                <div
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  +${Number(venta.interes).toFixed(2)} interés
                                </div>
                              )}
                          </td>
                          <td>
                            <strong>${Number(venta.total).toFixed(2)}</strong>
                          </td>
                          <td>
                            <Badge bg={getEstadoBadge(venta.estado)}>
                              {venta.estado}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => abrirModalEliminar(venta)}
                              title="Eliminar esta venta"
                            >
                              <Trash className="me-1" />
                              Borrar
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>

                {/* Totales por turno y forma de pago */}
                <Row className="mt-3">
                  {/* Turno Mañana */}
                  <Col md={6}>
                    <Card
                      style={{
                        backgroundColor: "#e7f3ff",
                        border: "2px solid #0d6efd",
                      }}
                    >
                      <Card.Body>
                        <h5 className="mb-3">Turno Mañana</h5>
                        <p className="text-muted mb-2">
                          {ventasMañana.length} venta
                          {ventasMañana.length !== 1 ? "s" : ""}
                        </p>

                        <Row className="g-2 mb-3">
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#d4edda",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#155724" }}>
                                💵 Efectivo
                              </div>
                              <strong>
                                ${totalesMañana.efectivo?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#d1ecf1",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#0c5460" }}>
                                💳 Débito
                              </div>
                              <strong>
                                ${totalesMañana.debito?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#fff3cd",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#856404" }}>
                                💳 Crédito
                              </div>
                              <strong>
                                ${totalesMañana.credito?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#cce5ff",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#004085" }}>
                                🏦 Transfer.
                              </div>
                              <strong>
                                ${totalesMañana.transferencia?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                        </Row>

                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong>Total Turno Mañana:</strong>
                          <h5 className="mb-0" style={{ color: "#0d6efd" }}>
                            ${totalMañana.toFixed(2)}
                          </h5>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Turno Tarde */}
                  <Col md={6}>
                    <Card
                      style={{
                        backgroundColor: "#fff8e1",
                        border: "2px solid #ffc107",
                      }}
                    >
                      <Card.Body>
                        <h5 className="mb-3">Turno Tarde</h5>
                        <p className="text-muted mb-2">
                          {ventasTarde.length} venta
                          {ventasTarde.length !== 1 ? "s" : ""}
                        </p>

                        <Row className="g-2 mb-3">
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#d4edda",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#155724" }}>
                                💵 Efectivo
                              </div>
                              <strong>
                                ${totalesTarde.efectivo?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#d1ecf1",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#0c5460" }}>
                                💳 Débito
                              </div>
                              <strong>
                                ${totalesTarde.debito?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#fff3cd",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#856404" }}>
                                💳 Crédito
                              </div>
                              <strong>
                                ${totalesTarde.credito?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                          <Col xs={6}>
                            <div
                              className="text-center p-2"
                              style={{
                                backgroundColor: "#cce5ff",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div style={{ color: "#004085" }}>
                                🏦 Transfer.
                              </div>
                              <strong>
                                ${totalesTarde.transferencia?.toFixed(2) || '0.00'}
                              </strong>
                            </div>
                          </Col>
                        </Row>

                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong>Total Turno Tarde:</strong>
                          <h5 className="mb-0" style={{ color: "#ffc107" }}>
                            ${totalTarde.toFixed(2)}
                          </h5>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Total del día */}
                <Card
                  className="mt-3"
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "2px solid #8f3d38",
                  }}
                >
                  <Card.Body>
                    <h5 className="mb-3">
                      Totales del Día - {formatearFecha(fechaSeleccionada)}
                    </h5>

                    {/* Totales por forma de pago */}
                    <Row className="mb-3">
                      <Col md={3}>
                        <div
                          className="text-center p-3"
                          style={{
                            backgroundColor: "#d4edda",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{ fontSize: "0.9rem", color: "#155724" }}
                          >
                            💵 Efectivo
                          </div>
                          <strong
                            style={{ fontSize: "1.3rem", color: "#155724" }}
                          >
                            ${totalesPorFormaPago.efectivo?.toFixed(2) || '0.00'}
                          </strong>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div
                          className="text-center p-3"
                          style={{
                            backgroundColor: "#d1ecf1",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{ fontSize: "0.9rem", color: "#0c5460" }}
                          >
                            💳 Débito
                          </div>
                          <strong
                            style={{ fontSize: "1.3rem", color: "#0c5460" }}
                          >
                            ${totalesPorFormaPago.debito?.toFixed(2) || '0.00'}
                          </strong>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div
                          className="text-center p-3"
                          style={{
                            backgroundColor: "#fff3cd",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{ fontSize: "0.9rem", color: "#856404" }}
                          >
                            💳 Crédito
                          </div>
                          <strong
                            style={{ fontSize: "1.3rem", color: "#856404" }}
                          >
                            ${totalesPorFormaPago.credito?.toFixed(2) || '0.00'}
                          </strong>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div
                          className="text-center p-3"
                          style={{
                            backgroundColor: "#cce5ff",
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{ fontSize: "0.9rem", color: "#004085" }}
                          >
                            🏦 Transferencia
                          </div>
                          <strong
                            style={{ fontSize: "1.3rem", color: "#004085" }}
                          >
                            ${totalesPorFormaPago.transferencia?.toFixed(2) || '0.00'}
                          </strong>
                        </div>
                      </Col>
                    </Row>

                    <hr />

                    {/* Total general */}
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <CashStack
                          size={32}
                          className="me-3"
                          style={{ color: "#8f3d38" }}
                        />
                        <div>
                          <h6 className="mb-0">Total General Recaudado</h6>
                          <small className="text-muted">
                            {ventasCompletadas.length} venta
                            {ventasCompletadas.length !== 1 ? "s" : ""}
                          </small>
                        </div>
                      </div>
                      <h3 className="mb-0" style={{ color: "#8f3d38" }}>
                        ${totalDelDia.toFixed(2)}
                      </h3>
                    </div>
                  </Card.Body>
                </Card>
              </>
            ) : ( // Mostrar si no hay ventas (y no está cargando)
              <Alert variant="warning" className="text-center">
                No hay ventas registradas para el día{" "}
                {fechaSeleccionada
                  ? formatearFecha(fechaSeleccionada)
                  : "seleccionado"}
                .
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Modal para eliminar venta */}
        <Modal show={showModalEliminar} onHide={cancelarEliminacion} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación de Venta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* Mostrar error de API en el modal */}
            {error && isSubmitting && (
                 <Alert variant="danger">
                   {error}
                 </Alert>
            )}
            {ventaAEliminar && (
              <div>
                <p>
                  <strong>N° Venta:</strong> {ventaAEliminar.numeroVenta}
                </p>
                <p>
                  <strong>Fecha:</strong> {formatearFecha(ventaAEliminar.fechaHora)}{" "}
                  {formatearHora(ventaAEliminar.fechaHora)}
                </p>
                <p>
                  <strong>Cliente:</strong> {ventaAEliminar.clienteNombre}
                </p>
                <p>
                  <strong>Productos:</strong>
                  <br />
                  <small>
                    {ventaAEliminar.items.map((item, idx) => (
                      <span key={idx}>
                        {item.articulo.nombre} x{item.cantidad}
                        <br />
                      </span>
                    ))}
                  </small>
                </p>
                <p>
                  <strong>Total:</strong> ${Number(ventaAEliminar.total).toFixed(2)}
                </p>
                <p>
                  <strong>Forma de Pago:</strong>{" "}
                  {formatearFormaPago(
                    ventaAEliminar.formaPago,
                    ventaAEliminar.estado,
                  )}
                </p>
                <p className="text-danger">
                  ¿Seguro que desea eliminar esta venta? Esta acción no se puede
                  deshacer.
                </p>
                <Alert variant="warning">
                  ⚠️ El stock de los productos involucrados será devuelto.
                </Alert>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelarEliminacion} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarEliminacion} disabled={isSubmitting}>
              {isSubmitting ? (
                   <>
                     <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                     {' '}Eliminando...
                   </>
              ) : (
                "Confirmar Eliminación"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default VentasList;

