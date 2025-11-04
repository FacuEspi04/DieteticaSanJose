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
  BoxArrowRight, // <-- 1. AÑADIDO: Ícono para Retiro
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/dietSanJose.png';
// --- 2. AÑADIDO: Importar servicios y tipos de Retiro ---
import {
  type Venta,
  getVentasPorFecha,
  type VentaEstado,
  type FormaPago,
  deleteVenta,
  getRetirosPorFecha, // <--- NUEVO
  type Retiro,         // <--- NUEVO
} from '../../services/apiService';


const VentasList: React.FC = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [retiros, setRetiros] = useState<Retiro[]>([]); // <-- 3. AÑADIDO: Estado para Retiros
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  const [ventaAEliminar, setVentaAEliminar] = useState<Venta | null>(null);
  const [showModalEliminar, setShowModalEliminar] = useState(false);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  // FUNCIÓN CORREGIDA PARA MANEJAR ZONA HORARIA ---
  const getTodayString = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, '0');
  const day = String(hoy.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
  useEffect(() => {
    // const hoy = new Date().toISOString().split('T')[0]; // <-- ESTO CAUSA EL BUG DE ZONA HORARIA
    setFechaSeleccionada(getTodayString()); // <-- CORREGIDO
  }, []);

  useEffect(() => {
    if (fechaSeleccionada) {
      // --- 4. MODIFICADO: Renombrado para claridad ---
      cargarDatosDelDia(fechaSeleccionada);
    }
  }, [fechaSeleccionada]);

  // --- 5. MODIFICADO: Ahora carga Ventas Y Retiros ---
  const cargarDatosDelDia = async (fecha: string) => {
    setIsLoading(true);
    setError(null);
    setExito(null); 
    try {
      // Pedimos ambas cosas en paralelo
      const [ventasData, retirosData] = await Promise.all([
        getVentasPorFecha(fecha),
        getRetirosPorFecha(fecha) // <-- Carga los retiros
      ]);
      
      setVentas(ventasData);
      setRetiros(retirosData); // <-- Guarda los retiros
      
    } catch (err: any) {
      console.error('Error al cargar datos del día:', err);
      setError(err.message || 'No se pudieron cargar los datos del día.');
      setVentas([]);
      setRetiros([]); // Limpiar también
    } finally {
      setIsLoading(false);
    }
  };

  // Determinar turno (sin cambios)
  const determinarTurno = (
    fechaHoraISO: Date | string,
  ): 'mañana' | 'tarde' | 'fuera' => {
    const fecha = new Date(fechaHoraISO);
    const h = fecha.getHours();
    const m = fecha.getMinutes();
    const tiempoEnMinutos = h * 60 + m;
    if (tiempoEnMinutos >= 540 && tiempoEnMinutos <= 810) return 'mañana';
    if (tiempoEnMinutos >= 990 && tiempoEnMinutos <= 1260) return 'tarde';
    return 'fuera';
  };
  
  // --- 6. AÑADIDO: Memoización de cálculos para Retiros ---
  const retirosComputados = useMemo(() => {
    const mañana = retiros.filter(
      (r) => determinarTurno(r.fechaHora) === 'mañana',
    );
    const tarde = retiros.filter(
      (r) => determinarTurno(r.fechaHora) === 'tarde',
    );
    return { mañana, tarde };
  }, [retiros]);

  const { mañana: retirosMañana, tarde: retirosTarde } = retirosComputados;

  const totalRetirosMañana = useMemo(() => retirosMañana.reduce((total, r) => total + Number(r.monto), 0), [retirosMañana]);
  const totalRetirosTarde = useMemo(() => retirosTarde.reduce((total, r) => total + Number(r.monto), 0), [retirosTarde]);
  const totalRetirosDelDia = useMemo(() => retiros.reduce((total, r) => total + Number(r.monto), 0), [retiros]);
  // --- FIN CÁLCULOS RETIROS ---


  // Cálculos de Ventas (Corregido para usar strings)
  const ventasComputadas = useMemo(() => {
    // --- CORRECCIÓN: Usar string 'Completada' ---
    const completadas = ventas.filter((v) => v.estado === 'Completada');
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
    // --- CORRECCIÓN: Usar strings como keys ---
    const totales: { [key: string]: number } = {
      'efectivo': 0, 'debito': 0, 'credito': 0, 'transferencia': 0,
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

  const totalVentasMañana = useMemo(() => ventasMañana.reduce((total, v) => total + Number(v.total), 0), [ventasMañana]);
  const totalVentasTarde = useMemo(() => ventasTarde.reduce((total, v) => total + Number(v.total), 0), [ventasTarde]);
  const totalVentasDelDia = useMemo(() => ventasCompletadas.reduce((total, v) => total + Number(v.total), 0), [ventasCompletadas]);

  // --- 7. AÑADIDO: Cálculo del Neto ---
  const netoMañana = useMemo(() => totalVentasMañana - totalRetirosMañana, [totalVentasMañana, totalRetirosMañana]);
  const netoTarde = useMemo(() => totalVentasTarde - totalRetirosTarde, [totalVentasTarde, totalRetirosTarde]);
  const netoTotalDia = useMemo(() => totalVentasDelDia - totalRetirosDelDia, [totalVentasDelDia, totalRetirosDelDia]);


  // Funciones de formato (sin cambios)
  // FUNCIÓN CORREGIDA que parsea fechas ISO como locales
const formatearFecha = (fechaISO: string | Date): string => {
  let fecha: Date;
  
  if (typeof fechaISO === 'string') {
    // Si es string en formato "YYYY-MM-DD", parsearlo como fecha local
    const [year, month, day] = fechaISO.split('-').map(Number);
    fecha = new Date(year, month - 1, day); // Month es 0-indexed
  } else {
    fecha = fechaISO;
  }
  
  const day = String(fecha.getDate()).padStart(2, '0');
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const year = fecha.getFullYear();
  return `${day}/${month}/${year}`;
};

// Para formatearHora, si también recibes strings ISO sin hora:
const formatearHora = (fechaISO: string | Date): string => {
  let fecha: Date;
  
  if (typeof fechaISO === 'string' && !fechaISO.includes('T')) {
    // Si es solo fecha sin hora, parsearlo como local
    const [year, month, day] = fechaISO.split('-').map(Number);
    fecha = new Date(year, month - 1, day);
  } else {
    fecha = new Date(fechaISO);
  }
  
  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

  // Funciones de eliminación (sin cambios)
  const abrirModalEliminar = (venta: Venta) => {
    setVentaAEliminar(venta);
    setError(null);
    setShowModalEliminar(true);
  };
  const confirmarEliminacion = async () => {
    if (!ventaAEliminar) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteVenta(ventaAEliminar.id);
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
    } finally {
      setIsSubmitting(false);
    }
  };
  const cancelarEliminacion = () => {
    setShowModalEliminar(false);
    setVentaAEliminar(null);
  };

  // --- CORRECCIÓN: Usar strings ---
  const getEstadoBadge = (estado: VentaEstado) => {
    if (estado === 'Completada') return "success";
    if (estado === 'Pendiente') return "warning";
    return "secondary";
  };

  const getFormaPagoBadge = (formaPago: FormaPago) => {
    const badges: { [key: string]: string } = {
      'efectivo': "success",
      'debito': "info",
      'credito': "warning",
      'transferencia': "primary",
    };
    return badges[formaPago] || "secondary";
  };

  const formatearFormaPago = (formaPago: FormaPago | null, estado: VentaEstado) => {
    if (estado === 'Pendiente') return "Cta. Cte.";
    if (!formaPago) return "N/A";
    switch (formaPago) {
      case 'efectivo': return "Efectivo";
      case 'debito': return "Débito";
      case 'credito': return "Crédito";
      case 'transferencia': return "Transferencia";
      default: return formaPago;
    }
  };

  return (
    <div>
      {/* ... Logo ... */}
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
            <h5 className="mb-0">Resumen de Caja</h5> {/* <-- Título cambiado */}
            <div className="d-flex gap-2">
              {/* --- 8. AÑADIDO: Botón Nuevo Retiro --- */}
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => navigate("/ventas/nuevo-retiro")}
              >
                <BoxArrowRight className="me-1" />
                Nuevo Retiro
              </Button>
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
            {/* ... Selector de fecha ... */}
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
                <p className="mt-2">Cargando datos del día...</p>
              </div>
            ) : // --- INICIO DE LA CORRECCIÓN LÓGICA ---
              // 1. Añadimos la condición: (ventas.length > 0 || retiros.length > 0)
              (ventas.length > 0 || retiros.length > 0) ? (
              <>
                {/* --- 9. AÑADIDO: Card de Retiros del Día --- */}
                {/* Mostrar solo si hay ventas O retiros */}
                {retiros.length > 0 && (
                  <Card className="mb-3" style={{ backgroundColor: "#fff5f5", border: "2px solid #dc3545" }}>
                    <Card.Body>
                      <h5 className="mb-3 text-danger">Retiros de Caja del Día</h5>
                      <Table striped bordered hover responsive size="sm">
                        <thead style={{ backgroundColor: "#dc3545", color: "white" }}>
                          <tr>
                            <th>Hora</th>
                            <th>Turno</th>
                            <th>Monto</th>
                            <th>Motivo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {retiros.map((retiro) => {
                            const turno = determinarTurno(retiro.fechaHora);
                            return (
                              <tr key={retiro.id}>
                                <td>{formatearHora(retiro.fechaHora)}</td>
                                <td>
                                  {turno === "mañana" && <Badge bg="info">Mañana</Badge>}
                                  {turno === "tarde" && <Badge bg="warning">Tarde</Badge>}
                                  {turno === "fuera" && <Badge bg="secondary">Fuera</Badge>}
                                </td>
                                <td><strong>-${Number(retiro.monto).toFixed(2)}</strong></td>
                                <td>{retiro.motivo}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                )}


                {/* --- 10. MODIFICADO: Totales por turno (Mañana) --- */}
                <Row className="mt-3">
                  <Col md={6}>
                    <Card style={{ backgroundColor: "#e7f3ff", border: "2px solid #0d6efd" }}>
                      <Card.Body>
                        <h5 className="mb-3">Turno Mañana</h5>
                        {/* ... (Totales por forma de pago - sin cambios) ... */}
                        <p className="text-muted mb-2">{ventasMañana.length} venta{ventasMañana.length !== 1 ? 's' : ''}</p>
                        <Row className="g-2 mb-3">
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#d4edda", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#155724" }}>💵 Efectivo</div><strong>${totalesMañana.efectivo?.toFixed(2) || '0.00'}</strong></div></Col>
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#d1ecf1", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#0c5460" }}>💳 Débito</div><strong>${totalesMañana.debito?.toFixed(2) || '0.00'}</strong></div></Col>
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#fff3cd", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#856404" }}>💳 Crédito</div><strong>${totalesMañana.credito?.toFixed(2) || '0.00'}</strong></div></Col>
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#cce5ff", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#004085" }}>🏦 Transfer.</div><strong>${totalesMañana.transferencia?.toFixed(2) || '0.00'}</strong></div></Col>
                        </Row>
                        
                        <hr />
                        {/* Total Ventas Mañana */}
                        <div className="d-flex justify-content-between">
                          <strong>Total Ventas Mañana:</strong>
                          <h5 className="mb-0 text-success">${totalVentasMañana.toFixed(2)}</h5>
                        </div>
                        {/* Total Retiros Mañana */}
                        <div className="d-flex justify-content-between text-danger">
                          <strong>Retiros Mañana:</strong>
                          <h5 className="mb-0">-${totalRetirosMañana.toFixed(2)}</h5>
                        </div>
                        <hr style={{ borderTop: "1px dashed #0d6efd" }} />
                        {/* Neto Mañana */}
                        <div className="d-flex justify-content-between">
                          <strong>Neto Turno Mañana:</strong>
                          <h5 className="mb-0" style={{ color: "#0d6efd" }}>${netoMañana.toFixed(2)}</h5>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* --- 11. MODIFICADO: Totales por turno (Tarde) --- */}
                  <Col md={6}>
                    <Card style={{ backgroundColor: "#fff8e1", border: "2px solid #ffc107" }}>
                      <Card.Body>
                        <h5 className="mb-3">Turno Tarde</h5>
                        {/* ... (Totales por forma de pago - sin cambios) ... */}
                        <p className="text-muted mb-2">{ventasTarde.length} venta{ventasTarde.length !== 1 ? 's' : ''}</p>
                        <Row className="g-2 mb-3">
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#d4edda", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#155724" }}>💵 Efectivo</div><strong>${totalesTarde.efectivo?.toFixed(2) || '0.00'}</strong></div></Col>
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#d1ecf1", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#0c5460" }}>💳 Débito</div><strong>${totalesTarde.debito?.toFixed(2) || '0.00'}</strong></div></Col>
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#fff3cd", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#856404" }}>💳 Crédito</div><strong>${totalesTarde.credito?.toFixed(2) || '0.00'}</strong></div></Col>
                           <Col xs={6}><div className="text-center p-2" style={{ backgroundColor: "#cce5ff", borderRadius: "6px", fontSize: "0.85rem" }}><div style={{ color: "#004085" }}>🏦 Transfer.</div><strong>${totalesTarde.transferencia?.toFixed(2) || '0.00'}</strong></div></Col>
                        </Row>
                        
                        <hr />
                        {/* Total Ventas Tarde */}
                        <div className="d-flex justify-content-between">
                          <strong>Total Ventas Tarde:</strong>
                          <h5 className="mb-0 text-success">${totalVentasTarde.toFixed(2)}</h5>
                        </div>
                        {/* Total Retiros Tarde */}
                        <div className="d-flex justify-content-between text-danger">
                          <strong>Retiros Tarde:</strong>
                          <h5 className="mb-0">-${totalRetirosTarde.toFixed(2)}</h5>
                        </div>
                        <hr style={{ borderTop: "1px dashed #ffc107" }} />
                        {/* Neto Tarde */}
                        <div className="d-flex justify-content-between">
                          <strong>Neto Turno Tarde:</strong>
                          <h5 className="mb-0" style={{ color: "#B8860B" }}>${netoTarde.toFixed(2)}</h5>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* --- 12. MODIFICADO: Total del día (con Neto) --- */}
                <Card className="mt-3" style={{ backgroundColor: "#f8f9fa", border: "2px solid #8f3d38" }}>
                  <Card.Body>
                    <h5 className="mb-3">
                      Totales del Día - {formatearFecha(fechaSeleccionada)}
                    </h5>
                    <Row className="mb-3">
                       <Col md={3}><div className="text-center p-3" style={{ backgroundColor: "#d4edda", borderRadius: "8px" }}><div style={{ fontSize: "0.9rem", color: "#155724" }}>💵 Efectivo</div><strong style={{ fontSize: "1.3rem", color: "#155724" }}>${totalesPorFormaPago.efectivo?.toFixed(2) || '0.00'}</strong></div></Col>
                       <Col md={3}><div className="text-center p-3" style={{ backgroundColor: "#d1ecf1", borderRadius: "8px" }}><div style={{ fontSize: "0.9rem", color: "#0c5460" }}>💳 Débito</div><strong style={{ fontSize: "1.3rem", color: "#0c5460" }}>${totalesPorFormaPago.debito?.toFixed(2) || '0.00'}</strong></div></Col>
                       <Col md={3}><div className="text-center p-3" style={{ backgroundColor: "#fff3cd", borderRadius: "8px" }}><div style={{ fontSize: "0.9rem", color: "#856404" }}>💳 Crédito</div><strong style={{ fontSize: "1.3rem", color: "#856404" }}>${totalesPorFormaPago.credito?.toFixed(2) || '0.00'}</strong></div></Col>
                       <Col md={3}><div className="text-center p-3" style={{ backgroundColor: "#cce5ff", borderRadius: "8px" }}><div style={{ fontSize: "0.9rem", color: "#004085" }}>🏦 Transferencia</div><strong style={{ fontSize: "1.3rem", color: "#004085" }}>${totalesPorFormaPago.transferencia?.toFixed(2) || '0.00'}</strong></div></Col>
                    </Row>
                    <hr />

                    {/* Total Recaudado */}
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <CashStack size={32} className="me-3" style={{ color: "green" }} />
                        <div>
                          <h6 className="mb-0">Total Recaudado (Ventas)</h6>
                          <small className="text-muted">
                            {ventasCompletadas.length} venta{ventasCompletadas.length !== 1 ? "s" : ""}
                          </small>
                        </div>
                      </div>
                      <h3 className="mb-0 text-success">
                        ${totalVentasDelDia.toFixed(2)}
                      </h3>
                    </div>
                    
                    {/* Total Retiros */}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <div className="d-flex align-items-center">
                        <BoxArrowRight size={32} className="me-3 text-danger" />
                        <div>
                          <h6 className="mb-0">Total Retiros de Caja</h6>
                          <small className="text-muted">
                            {retiros.length} retiro{retiros.length !== 1 ? 's' : ''}
                          </small>
                        </div>
                      </div>
                      <h3 className="mb-0 text-danger">
                        -${totalRetirosDelDia.toFixed(2)}
                      </h3>
                    </div>

                    <hr />

                    {/* Total Neto */}
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <CashStack size={32} className="me-3" style={{ color: "#8f3d38" }} />
                        <div>
                          <h6 className="mb-0">Neto en Caja (Ventas - Retiros)</h6>
                        </div>
                      </div>
                      <h3 className="mb-0" style={{ color: "#8f3d38" }}>
                        ${netoTotalDia.toFixed(2)}
                      </h3>
                    </div>

                  </Card.Body>
                </Card>
                
                {/* --- 13. MODIFICADO: Mover la tabla de Ventas aquí --- */}
                {/* Mostrar la tabla solo si hay ventas */}
                {ventas.length > 0 ? (
                  <>
                    <h5 className="mt-4 mb-3">Detalle de Ventas del Día</h5>
                    <Table striped bordered hover responsive>
                      <thead style={{ backgroundColor: "#8f3d38", color: "white" }}>
                        <tr>
                          <th>N° Venta</th> <th>Hora</th> <th>Turno</th> <th>Cliente</th>
                          <th>Productos</th> <th>Forma de Pago</th> <th>Total</th>
                          <th>Estado</th> <th>Acciones</th>
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
                                {turno === "mañana" && <Badge bg="info">Mañana</Badge>}
                                {turno === "tarde" && <Badge bg="warning">Tarde</Badge>}
                                {turno === "fuera" && <Badge bg="secondary">⏰ Fuera de turno</Badge>}
                              </td>
                              <td>{venta.clienteNombre}</td>
                              <td>
                                <small>
                                  {venta.items.map((item, idx) => (
                                    <div key={idx}>{item.articulo.nombre} x{item.cantidad}</div>
                                  ))}
                                </small>
                              </td>
                              <td>
                                <Badge bg={venta.formaPago && venta.estado === 'Completada' ? getFormaPagoBadge(venta.formaPago) : "secondary"}>
                                  {formatearFormaPago(venta.formaPago, venta.estado)}
                                </Badge>
                                {venta.formaPago === 'credito' && Number(venta.interes) > 0 && (
                                    <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                      +${Number(venta.interes).toFixed(2)} interés
                                    </div>
                                )}
                              </td>
                              <td><strong>${Number(venta.total).toFixed(2)}</strong></td>
                              <td><Badge bg={getEstadoBadge(venta.estado)}>{venta.estado}</Badge></td>
                              <td>
                                <Button variant="outline-danger" size="sm" onClick={() => abrirModalEliminar(venta)} title="Eliminar esta venta">
                                  <Trash className="me-1" /> Borrar
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </>
                ) : (
                  // No mostramos la tabla de ventas si no hay ventas
                  <Alert variant="info" className="mt-3 text-center">
                    No hay ventas registradas para este día.
                  </Alert>
                )}
              </>
            ) : ( // <-- 2. ESTE ES EL 'ELSE' QUE CORRESPONDE A (ventas.length > 0 || retiros.length > 0)
              <Alert variant="warning" className="text-center">
                No hay ventas ni retiros registrados para el día{" "}
                {fechaSeleccionada ? formatearFecha(fechaSeleccionada) : "seleccionado"}.
              </Alert>
            )}
          </Card.Body>
        </Card>

        {/* Modal para eliminar venta (sin cambios) */}
        <Modal show={showModalEliminar} onHide={cancelarEliminacion} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación de Venta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && isSubmitting && ( <Alert variant="danger">{error}</Alert> )}
            {ventaAEliminar && (
              <div>
                <p><strong>N° Venta:</strong> {ventaAEliminar.numeroVenta}</p>
                <p><strong>Fecha:</strong> {formatearFecha(ventaAEliminar.fechaHora)}{" "}{formatearHora(ventaAEliminar.fechaHora)}</p>
                <p><strong>Cliente:</strong> {ventaAEliminar.clienteNombre}</p>
                <p>
                  <strong>Productos:</strong><br />
                  <small>
                    {ventaAEliminar.items.map((item, idx) => (
                      <span key={idx}> {item.articulo.nombre} x{item.cantidad} <br /> </span>
                    ))}
                  </small>
                </p>
                <p><strong>Total:</strong> ${Number(ventaAEliminar.total).toFixed(2)}</p>
                <p><strong>Forma de Pago:</strong>{" "}{formatearFormaPago(ventaAEliminar.formaPago, ventaAEliminar.estado)}</p>
                <p className="text-danger">
                  ¿Seguro que desea eliminar esta venta? Esta acción no se puede deshacer.
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
            {/* --- CORRECCIÓN DE SINTAXIS (ya estaba bien en tu archivo) --- */}
            <Button variant="danger" onClick={confirmarEliminacion} disabled={isSubmitting}>
              {isSubmitting ? (
                   <>
                     <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                     {' '}Eliminando...
                   </>
              ) : "Confirmar Eliminación"} 
            </Button> 
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default VentasList;

