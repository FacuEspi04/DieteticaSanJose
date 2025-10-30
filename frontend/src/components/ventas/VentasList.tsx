// src/components/ventas/VentasList.tsx
import React, { useState, useEffect } from "react";
import { Table, Card, Badge, Button, Form, Row, Col, Alert, Modal } from "react-bootstrap";
import { PlusCircle, Calendar, CashStack } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";

interface ItemVenta {
  articulo: {
    id: number;
    nombre: string;
    precio: number;
  };
  cantidad: number;
  subtotal: number;
}

interface Venta {
  id: number;
  numeroVenta?: number;
  fecha: string;
  hora: string;
  cliente: string;
  items: ItemVenta[];
  subtotal: number;
  formaPago: string;
  interes: number;
  total: number;
  estado: string;
}

const VentasList: React.FC = () => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");

  // Estados agregados:
  const [ventaAAnular, setVentaAAnular] = useState<Venta|null>(null);
  const [showModalAnular, setShowModalAnular] = useState(false);

  // Cargar ventas del localStorage al montar el componente
  useEffect(() => {
    cargarVentas();
    // Establecer la fecha de hoy por defecto
    const hoy = new Date().toISOString().split('T')[0];
    setFechaSeleccionada(hoy);
  }, []);

  const cargarVentas = () => {
    const ventasGuardadas = localStorage.getItem('ventas');
    if (!ventasGuardadas) return;

    let ventasParseadas: Venta[] = JSON.parse(ventasGuardadas);

    // Migración: asignar numeroVenta si falta, empezando desde 1 por orden de creación (id asc)
    const necesitanNumero = ventasParseadas.some(v => v.numeroVenta == null);
    if (necesitanNumero) {
      const ordenadas = [...ventasParseadas].sort((a, b) => (a.id || 0) - (b.id || 0));
      let contador = 0;
      const asignadas = ordenadas.map(v => {
        if (v.numeroVenta == null) {
          contador += 1;
          return { ...v, numeroVenta: contador };
        }
        return v;
      });
      // Si ya había algunas numeradas, ajustar contador al máximo
      const maxExistente = Math.max(
        0,
        ...asignadas.map(v => (v.numeroVenta || 0))
      );
      localStorage.setItem('contadorVentas', String(maxExistente));
      // Regrabar ventas con numeroVenta persistente
      // Conservar el orden original
      const porId = new Map(asignadas.map(v => [v.id, v]));
      ventasParseadas = ventasParseadas.map(v => porId.get(v.id) || v);
      localStorage.setItem('ventas', JSON.stringify(ventasParseadas));
    }

    setVentas(ventasParseadas);
  };

  // Determinar turno según hora (robusto para 24h y 12h con am/pm y espacios Unicode)
  const determinarTurno = (hora: string): "mañana" | "tarde" | "fuera" => {
    if (!hora) return "fuera";
    // Normalizar: quitar puntos y espacios (incluye NBSP \u00A0 y NNBSP \u202F)
    const normalizada = hora.toLowerCase()
      .replace(/[\u00A0\u202F]/g, ' ')
      .replace(/\./g, '')
      .trim();

    // Intentar capturar HH:MM
    const hhmmMatch = normalizada.match(/(\d{1,2}):(\d{2})/);
    let h = 0;
    let m = 0;
    if (hhmmMatch) {
      h = parseInt(hhmmMatch[1], 10) || 0;
      m = parseInt(hhmmMatch[2], 10) || 0;
      // Ajuste am/pm si estuviera presente
      if (/pm/.test(normalizada) && h < 12) h += 12;
      if (/am/.test(normalizada) && h === 12) h = 0;
    }

    const tiempoEnMinutos = h * 60 + m;
    // Mañana: 9:00 - 13:30 (540 - 810 minutos)
    if (tiempoEnMinutos >= 540 && tiempoEnMinutos <= 810) return "mañana";
    // Tarde: 16:30 - 21:00 (990 - 1260 minutos)
    if (tiempoEnMinutos >= 990 && tiempoEnMinutos <= 1260) return "tarde";
    return "fuera";
  };

  // Nuevas listas filtradas para totales:
  const ventasCompletadas = ventas.filter(v => v.fecha === fechaSeleccionada && v.estado === 'Completada');
  const ventasMañana = ventasCompletadas.filter(v => determinarTurno(v.hora) === 'mañana');
  const ventasTarde = ventasCompletadas.filter(v => determinarTurno(v.hora) === 'tarde');

  // Para la tabla y visualización, ventasFiltradas sigue mostrando todas del día
  const ventasFiltradas = ventas.filter((venta) => venta.fecha === fechaSeleccionada);

  // Totales recaudados sólo usan ventasCompletadas:
  const totalMañana = ventasMañana.reduce((total, venta) => total + venta.total, 0);
  const totalTarde = ventasTarde.reduce((total, venta) => total + venta.total, 0);
  const totalDelDia = ventasCompletadas.reduce((total, venta) => total + venta.total, 0);

  const calcularTotalesPorFormaPago = () => {
    const totales = {
      efectivo: 0,
      debito: 0,
      credito: 0,
      transferencia: 0,
    };
    ventasCompletadas.forEach((venta) => {
      const formaPago = venta.formaPago || "efectivo";
      if (totales.hasOwnProperty(formaPago)) {
        totales[formaPago as keyof typeof totales] += venta.total;
      }
    });
    return totales;
  };
  const calcularTotalesPorTurno = (turno: "mañana" | "tarde") => {
    const ventasTurno = turno === "mañana" ? ventasMañana : ventasTarde;
    const totales = {
      efectivo: 0,
      debito: 0,
      credito: 0,
      transferencia: 0,
    };
    ventasTurno.forEach((venta) => {
      const formaPago = venta.formaPago || "efectivo";
      if (totales.hasOwnProperty(formaPago)) {
        totales[formaPago as keyof typeof totales] += venta.total;
      }
    });
    return totales;
  };

  const totalesPorFormaPago = calcularTotalesPorFormaPago();
  const totalesMañana = calcularTotalesPorTurno("mañana");
  const totalesTarde = calcularTotalesPorTurno("tarde");

  // Calcular total del día
  // const totalDelDia = ventasFiltradas.reduce((total, venta) => total + venta.total, 0); // This line is now redundant

  // Formatear fecha para mostrar
  const formatearFecha = (fecha: string): string => {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  const anularVenta = (idVenta: number) => {
    if (!window.confirm('¿Seguro que desea anular esta venta?')) return;
    const ventasActualizadas = ventas.map(v => v.id === idVenta ? { ...v, estado: 'Anulada' } : v);
    localStorage.setItem('ventas', JSON.stringify(ventasActualizadas));
    setVentas(ventasActualizadas);
  };

  const abrirModalAnular = (venta: Venta) => {
    setVentaAAnular(venta);
    setShowModalAnular(true);
  };
  const confirmarAnulacion = () => {
    if (!ventaAAnular) return;
    const ventasActualizadas = ventas.map(v => v.id === ventaAAnular.id ? { ...v, estado: 'Anulada' } : v);
    localStorage.setItem('ventas', JSON.stringify(ventasActualizadas));
    setVentas(ventasActualizadas);
    setShowModalAnular(false);
    setVentaAAnular(null);
  };
  const cancelarAnulacion = () => {
    setShowModalAnular(false);
    setVentaAAnular(null);
  }

  const getEstadoBadge = (estado: string) => {
    if (estado === "Completada") return "success";
    if (estado === "Pendiente") return "warning";
    if (estado === "Anulada") return "secondary";
    return "secondary";
  };

  const getFormaPagoBadge = (formaPago: string) => {
    const badges: { [key: string]: string } = {
      efectivo: "success",
      debito: "info",
      credito: "warning",
      transferencia: "primary",
      cuenta_corriente: "secondary",
    };
    return badges[formaPago] || "secondary";
  };

  // Función para mostrar la forma de pago correctamente
  const formatearFormaPago = (formaPago: string, estado: string) => {
    if (!formaPago || estado === 'Pendiente') return 'A definir';
    switch (formaPago) {
      case 'efectivo': return 'Efectivo';
      case 'debito': return 'Débito';
      case 'credito': return 'Crédito';
      case 'transferencia': return 'Transferencia';
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
          style={{ height: '80px', objectFit: 'contain' }}
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
              onClick={() => navigate('/ventas/cuentas-corrientes')}
            >
              <CashStack className="me-1" />
              Cuentas Corrientes
            </Button>
            <Button 
              variant="success" 
              size="sm"
              onClick={() => navigate('/ventas/nueva')}
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
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <Alert variant="info" className="mb-0 w-100">
                <strong>Fecha seleccionada:</strong> {fechaSeleccionada ? formatearFecha(fechaSeleccionada) : 'Ninguna'}
              </Alert>
            </Col>
          </Row>

          {/* Tabla de ventas */}
          {ventasFiltradas.length > 0 ? (
            <>
              <Table striped bordered hover responsive>
                <thead style={{ backgroundColor: "#8f3d38", color: "white" }}>
                  <tr>
                    <th>N° Venta</th>
                    <th>Hora</th>
                    <th>Turno</th>
                    <th>Cliente</th>
                    <th>Productos</th>
                    <th>Forma de Pago</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasFiltradas.map((venta) => {
                    const turno = determinarTurno(venta.hora);
                    return (
                      <tr key={venta.id}>
                        <td>{venta.numeroVenta ?? '-'}</td>
                        <td>{venta.hora}</td>
                        <td>
                          {turno === "mañana" && <Badge bg="info">Mañana</Badge>}
                          {turno === "tarde" && <Badge bg="warning">Tarde</Badge>}
                          {turno === "fuera" && <Badge bg="secondary">⏰ Fuera de turno</Badge>}
                        </td>
                        <td>{venta.cliente}</td>
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
                          <Badge bg={venta.formaPago && venta.estado === 'Completada' ? getFormaPagoBadge(venta.formaPago) : 'secondary'}>
                            {formatearFormaPago(venta.formaPago, venta.estado)}
                          </Badge>
                          {venta.formaPago === "credito" && venta.interes > 0 && (
                            <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                              +${venta.interes.toFixed(2)} interés
                            </div>
                          )}
                        </td>
                        <td><strong>${venta.total.toFixed(2)}</strong></td>
                        <td>
                          <Badge bg={getEstadoBadge(venta.estado)}>
                            {venta.estado}
                          </Badge>
                          {venta.estado === 'Completada' && (
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="ms-2"
                              onClick={() => abrirModalAnular(venta)}
                            >
                              Anular
                            </Button>
                          )}
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
                  <Card style={{ backgroundColor: "#e7f3ff", border: "2px solid #0d6efd" }}>
                    <Card.Body>
                      <h5 className="mb-3">Turno Mañana</h5>
                      <p className="text-muted mb-2">{ventasMañana.length} venta{ventasMañana.length !== 1 ? 's' : ''}</p>
                      
                      <Row className="g-2 mb-3">
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#d4edda", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#155724" }}>💵 Efectivo</div>
                            <strong>${totalesMañana.efectivo.toFixed(2)}</strong>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#d1ecf1", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#0c5460" }}>💳 Débito</div>
                            <strong>${totalesMañana.debito.toFixed(2)}</strong>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#fff3cd", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#856404" }}>💳 Crédito</div>
                            <strong>${totalesMañana.credito.toFixed(2)}</strong>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#cce5ff", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#004085" }}>🏦 Transfer.</div>
                            <strong>${totalesMañana.transferencia.toFixed(2)}</strong>
                          </div>
                        </Col>
                      </Row>

                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total Turno Mañana:</strong>
                        <h5 className="mb-0" style={{ color: "#0d6efd" }}>${totalMañana.toFixed(2)}</h5>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Turno Tarde */}
                <Col md={6}>
                  <Card style={{ backgroundColor: "#fff8e1", border: "2px solid #ffc107" }}>
                    <Card.Body>
                      <h5 className="mb-3">Turno Tarde</h5>
                      <p className="text-muted mb-2">{ventasTarde.length} venta{ventasTarde.length !== 1 ? 's' : ''}</p>
                      
                      <Row className="g-2 mb-3">
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#d4edda", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#155724" }}>💵 Efectivo</div>
                            <strong>${totalesTarde.efectivo.toFixed(2)}</strong>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#d1ecf1", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#0c5460" }}>💳 Débito</div>
                            <strong>${totalesTarde.debito.toFixed(2)}</strong>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#fff3cd", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#856404" }}>💳 Crédito</div>
                            <strong>${totalesTarde.credito.toFixed(2)}</strong>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <div className="text-center p-2" style={{ backgroundColor: "#cce5ff", borderRadius: "6px", fontSize: "0.85rem" }}>
                            <div style={{ color: "#004085" }}>🏦 Transfer.</div>
                            <strong>${totalesTarde.transferencia.toFixed(2)}</strong>
                          </div>
                        </Col>
                      </Row>

                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total Turno Tarde:</strong>
                        <h5 className="mb-0" style={{ color: "#ffc107" }}>${totalTarde.toFixed(2)}</h5>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Total del día */}
              <Card className="mt-3" style={{ backgroundColor: "#f8f9fa", border: "2px solid #8f3d38" }}>
                <Card.Body>
                  <h5 className="mb-3">Totales del Día - {formatearFecha(fechaSeleccionada)}</h5>
                  
                  {/* Totales por forma de pago */}
                  <Row className="mb-3">
                    <Col md={3}>
                      <div className="text-center p-3" style={{ backgroundColor: "#d4edda", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.9rem", color: "#155724" }}>💵 Efectivo</div>
                        <strong style={{ fontSize: "1.3rem", color: "#155724" }}>
                          ${totalesPorFormaPago.efectivo.toFixed(2)}
                        </strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center p-3" style={{ backgroundColor: "#d1ecf1", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.9rem", color: "#0c5460" }}>💳 Débito</div>
                        <strong style={{ fontSize: "1.3rem", color: "#0c5460" }}>
                          ${totalesPorFormaPago.debito.toFixed(2)}
                        </strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center p-3" style={{ backgroundColor: "#fff3cd", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.9rem", color: "#856404" }}>💳 Crédito</div>
                        <strong style={{ fontSize: "1.3rem", color: "#856404" }}>
                          ${totalesPorFormaPago.credito.toFixed(2)}
                        </strong>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-center p-3" style={{ backgroundColor: "#cce5ff", borderRadius: "8px" }}>
                        <div style={{ fontSize: "0.9rem", color: "#004085" }}>🏦 Transferencia</div>
                        <strong style={{ fontSize: "1.3rem", color: "#004085" }}>
                          ${totalesPorFormaPago.transferencia.toFixed(2)}
                        </strong>
                      </div>
                    </Col>
                  </Row>

                  <hr />

                  {/* Total general */}
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <CashStack size={32} className="me-3" style={{ color: "#8f3d38" }} />
                      <div>
                        <h6 className="mb-0">Total General Recaudado</h6>
                        <small className="text-muted">{ventasCompletadas.length} venta{ventasCompletadas.length !== 1 ? 's' : ''}</small>
                      </div>
                    </div>
                    <h3 className="mb-0" style={{ color: "#8f3d38" }}>
                      ${totalDelDia.toFixed(2)}
                    </h3>
                  </div>
                </Card.Body>
              </Card>
            </>
          ) : (
            <Alert variant="warning" className="text-center">
              No hay ventas registradas para el día {fechaSeleccionada ? formatearFecha(fechaSeleccionada) : 'seleccionado'}.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Modal para anular venta */}
      <Modal show={showModalAnular} onHide={cancelarAnulacion} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Anulación de Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventaAAnular && (
            <div>
              <p><strong>ID:</strong> {ventaAAnular.id}</p>
              <p><strong>Fecha:</strong> {formatearFecha(ventaAAnular.fecha)} {ventaAAnular.hora}</p>
              <p><strong>Cliente:</strong> {ventaAAnular.cliente}</p>
              <p><strong>Productos:</strong><br/>
                {ventaAAnular.items.map((item, idx) => (
                  <span key={idx}>{item.articulo.nombre} x{item.cantidad}<br/></span>
                ))}
              </p>
              <p><strong>Total:</strong> ${ventaAAnular.total.toFixed(2)}</p>
              <p><strong>Forma de Pago:</strong> {formatearFormaPago(ventaAAnular.formaPago, ventaAAnular.estado)}</p>
              <p className="text-danger">¿Seguro que desea anular esta venta? Esta acción no se puede deshacer.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelarAnulacion}>Cancelar</Button>
          <Button variant="danger" onClick={confirmarAnulacion}>Confirmar Anulación</Button>
        </Modal.Footer>
      </Modal>
    </div>
    </div>
  );
};

export default VentasList;