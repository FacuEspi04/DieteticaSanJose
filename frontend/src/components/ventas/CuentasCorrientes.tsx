// src/components/ventas/CuentasCorrientes.tsx
import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Button, Modal, Form, Alert } from "react-bootstrap";
import { CashCoin, CheckCircle } from "react-bootstrap-icons";
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

const CuentasCorrientes: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  const [formaPagoPago, setFormaPagoPago] = useState("efectivo");
  const [interesPorcentajePago, setInteresPorcentajePago] = useState<string>("10");
  const [exito, setExito] = useState("");

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = () => {
    const ventasGuardadas = localStorage.getItem('ventas');
    if (ventasGuardadas) {
      setVentas(JSON.parse(ventasGuardadas));
    }
  };

  // Filtrar solo ventas pendientes (cuenta corriente)
  const ventasPendientes = ventas.filter(v => v.estado === "Pendiente");

  // Agrupar por cliente
  const ventasPorCliente = ventasPendientes.reduce((acc, venta) => {
    if (!acc[venta.cliente]) {
      acc[venta.cliente] = [];
    }
    acc[venta.cliente].push(venta);
    return acc;
  }, {} as { [cliente: string]: Venta[] });

  // Calcular deuda total por cliente
  const calcularDeudaCliente = (cliente: string): number => {
    return ventasPorCliente[cliente].reduce((total, venta) => total + venta.total, 0);
  };

  // Abrir modal de pago
  const abrirModalPago = (venta: Venta) => {
    setVentaSeleccionada(venta);
    setFormaPagoPago(venta.formaPago || "efectivo");
    setInteresPorcentajePago("10");
    setShowModal(true);
  };

  // Registrar pago
  const registrarPago = () => {
    if (!ventaSeleccionada) return;

    const ahora = new Date();
    const fechaPago = ahora.toISOString().split('T')[0];
    const horaPago = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });

    // Calcular interés si corresponde
    const porcentaje = parseFloat(interesPorcentajePago) || 0;
    const interesCalculado = formaPagoPago === 'credito' ? (ventaSeleccionada.subtotal * porcentaje) / 100 : 0;
    const totalActualizado = ventaSeleccionada.subtotal + interesCalculado;

    // Actualizar la venta: cambiar estado y registrar fecha/hora de pago
    const ventasActualizadas = ventas.map(venta => {
      if (venta.id === ventaSeleccionada.id) {
        return {
          ...venta,
          estado: "Completada",
          formaPago: formaPagoPago,
          interes: interesCalculado,
          total: totalActualizado,
          fecha: fechaPago, // Actualizar a la fecha de pago
          hora: horaPago,   // Actualizar a la hora de pago
        };
      }
      return venta;
    });

    // Guardar en localStorage
    localStorage.setItem('ventas', JSON.stringify(ventasActualizadas));
    
    // Actualizar estado local
    setVentas(ventasActualizadas);
    
    setShowModal(false);
    setExito(`¡Pago registrado exitosamente! ${ventaSeleccionada.cliente} - $${ventaSeleccionada.total.toFixed(2)}`);
    setVentaSeleccionada(null);
    
    setTimeout(() => setExito(""), 3000);
  };

  const formatearFecha = (fecha: string): string => {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div>
      {/* Logo */}
      <div className="d-flex justify-content-end mb-3">
        <img 
          src={logo} 
          alt="Dietética San José" 
          style={{ height: '60px', objectFit: 'contain' }}
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

          {Object.keys(ventasPorCliente).length > 0 ? (
            <>
              {Object.keys(ventasPorCliente).map((cliente) => (
                <Card key={cliente} className="mb-3" style={{ border: "1px solid #8f3d38" }}>
                  <Card.Header style={{ backgroundColor: "#8f3d38", color: "white" }}>
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
                            <td>{formatearFecha(venta.fecha)}</td>
                            <td>{venta.hora}</td>
                            <td>
                              <small>
                                {venta.items.map((item, idx) => (
                                  <div key={idx}>
                                    {item.articulo.nombre} x{item.cantidad}
                                  </div>
                                ))}
                              </small>
                            </td>
                            <td><strong>${venta.total.toFixed(2)}</strong></td>
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
        <Modal.Header closeButton style={{ backgroundColor: "#8f3d38", color: "white" }}>
          <Modal.Title>Registrar Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {ventaSeleccionada && (
            <>
              <h6 className="mb-3">Cliente: <strong>{ventaSeleccionada.cliente}</strong></h6>
              <p><strong>Fecha de compra:</strong> {formatearFecha(ventaSeleccionada.fecha)}</p>
              
              <Alert variant="info">
                <strong>Productos:</strong>
                <ul className="mb-0 mt-2">
                  {ventaSeleccionada.items.map((item, idx) => (
                    <li key={idx}>
                      {item.articulo.nombre} x{item.cantidad} = ${item.subtotal.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </Alert>

              <h5 className="text-center mb-3">
                Total base (sin interés): <span style={{ color: "#8f3d38" }}>${ventaSeleccionada.subtotal.toFixed(2)}</span>
              </h5>

              <Form.Group>
                <Form.Label>Forma de Pago <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formaPagoPago}
                  onChange={(e) => setFormaPagoPago(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="debito">Débito</option>
                  <option value="credito">Crédito</option>
                  <option value="transferencia">Transferencia</option>
                </Form.Select>
              </Form.Group>

              {formaPagoPago === 'credito' && (
                <Form.Group className="mt-3">
                  <Form.Label>Interés para Tarjeta de Crédito (%)</Form.Label>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="number"
                      min="0"
                      step="0.5"
                      value={interesPorcentajePago}
                      onChange={(e) => setInteresPorcentajePago(e.target.value)}
                      style={{ maxWidth: '140px' }}
                    />
                    <span className="text-muted">
                      +${((ventaSeleccionada.subtotal * (parseFloat(interesPorcentajePago) || 0)) / 100).toFixed(2)} interés
                    </span>
                  </div>
                  <div className="mt-2 fw-bold text-end">
                    Total a Pagar: ${(
                      ventaSeleccionada.subtotal + (ventaSeleccionada.subtotal * (parseFloat(interesPorcentajePago) || 0) / 100)
                    ).toFixed(2)}
                  </div>
                </Form.Group>
              )}

              <Alert variant="warning" className="mt-3 mb-0">
                <small>
                  ⚠️ Al confirmar, esta venta se marcará como <strong>Completada</strong> y se sumará 
                  al total del día de HOY con el turno actual.
                </small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={registrarPago}>
            Confirmar Pago
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CuentasCorrientes;