import React, { useEffect, useState, useMemo } from "react";
import { Card, Table, Button, Row, Col, Form, Modal, Alert, Spinner } from "react-bootstrap";
import logo from "../../assets/dietSanJose.png";
import { type Pedido, type Proveedor, getProveedores, getPedidos } from "../../services/apiService";


// Renombrar PedidoGuardado a Pedido para consistencia
type PedidoGuardado = Pedido;

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoGuardado[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  
  // Estados de Filtro
  const [proveedorId, setProveedorId] = useState<string>("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  // Estados de UI
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoGuardado | null>(null);
  const [showDetalle, setShowDetalle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial (Proveedores para el filtro)
  useEffect(() => {
    const cargarProveedores = async () => {
      try {
        const provData = await getProveedores();
        setProveedores(provData);
      } catch (err: any) {
        setError(err.message || "Error al cargar proveedores");
      }
    };
    cargarProveedores();
  }, []);

  // Cargar pedidos (y re-cargar al cambiar filtros)
  useEffect(() => {
    const cargarPedidos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPedidos(proveedorId || undefined, desde || undefined, hasta || undefined);
        setPedidos(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar los pedidos");
      } finally {
        setIsLoading(false);
      }
    };
    
    // Usamos un timeout para no hacer fetch en cada tecleo de fecha
    const timer = setTimeout(() => {
      cargarPedidos();
    }, 500); // Espera 500ms después de la últimaS modificación

    return () => clearTimeout(timer); // Limpia el timer si el filtro cambia de nuevo
  }, [proveedorId, desde, hasta]);


  const imprimirPedido = (pedido: PedidoGuardado) => {
    // Esta función ya recibe el objeto completo, debería funcionar igual
    const win = window.open("", "_blank");
    if (!win) return;
    const estilos = `
      <style>
        body{ font-family: Arial, sans-serif; padding: 16px; }
        h2{ margin: 0 0 8px 0; }
        .muted{ color:#666; }
        table{ width:100%; border-collapse: collapse; margin-top:12px; }
        th, td{ border:1px solid #ccc; padding:8px; text-align:left; }
        thead{ background:#f0f0f0; }
      </style>
    `;
    const filas = pedido.items.map(i => `<tr><td>${i.articulo.nombre}</td><td>${i.cantidad}</td></tr>`).join("");
    const html = `
      ${estilos}
      <h2>Pedido a Proveedor</h2>
      <div class="muted">Fecha: ${new Date(pedido.fechaPedido).toLocaleDateString('es-AR')}</div>
      <h3>Proveedor</h3>
      <div><strong>${pedido.proveedor.nombre}</strong></div>
      ${pedido.proveedor.contacto ? `<div>Contacto: ${pedido.proveedor.contacto}</div>` : ''}
      ${pedido.proveedor.telefono ? `<div>Teléfono: ${pedido.proveedor.telefono}</div>` : ''}
      ${pedido.proveedor.email ? `<div>Email: ${pedido.proveedor.email}</div>` : ''}
      ${pedido.notas ? `<div><strong>Observaciones:</strong> ${pedido.notas}</div>` : ''}
      <h3 style="margin-top:16px">Artículos</h3>
      <table>
        <thead><tr><th>Artículo</th><th>Cantidad</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
    `;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };
  
  // No necesitamos más pedidosFiltrados, la API ya los entrega filtrados
  const pedidosFiltrados = pedidos;

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <img src={logo} alt="Dietética San José" style={{ height: '80px', objectFit: 'contain' }} />
      </div>
      <Card className="mt-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Lista de Pedidos a Proveedores</h5>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Proveedor</Form.Label>
                <Form.Select value={proveedorId} onChange={e => setProveedorId(e.target.value)}>
                  <option value="">Todos</option>
                  {proveedores.map(p => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Desde (fecha)</Form.Label>
                <Form.Control type="date" value={desde} onChange={e => setDesde(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Hasta (fecha)</Form.Label>
                <Form.Control type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          {isLoading ? (
             <div className="text-center my-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando pedidos...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead style={{ backgroundColor: "#8f3d38", color: "white" }}>
                <tr>
                  <th>Fecha</th>
                  {/* <th>Hora</th> */}
                  <th>Proveedor</th>
                  <th>Ítems</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.length > 0 ? pedidosFiltrados.map(pedido => (
                  <tr key={pedido.id}>
                    <td>{new Date(pedido.fechaPedido).toLocaleDateString('es-AR')}</td>
                    {/* <td>{new Date(pedido.createdAt).toLocaleTimeString('es-AR')}</td> */}
                    <td>{pedido.proveedor.nombre}</td>
                    <td>{pedido.items.length}</td>
                    <td>${Number(pedido.total).toFixed(2)}</td>
                    <td>
                      <Button variant="info" size="sm" className="me-2" onClick={() => { setPedidoDetalle(pedido); setShowDetalle(true); }}>Ver</Button>
                      <Button variant="warning" size="sm" onClick={() => imprimirPedido(pedido)}>PDF</Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center">No hay pedidos registrados en este rango/proveedor.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}

          <Modal show={showDetalle} onHide={() => setShowDetalle(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detalle de Pedido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {pedidoDetalle && (
                <>
                  <div><strong>Fecha:</strong> {new Date(pedidoDetalle.fechaPedido).toLocaleDateString('es-AR')}</div>
                  <div><strong>Proveedor:</strong> {pedidoDetalle.proveedor.nombre}</div>
                  {pedidoDetalle.proveedor.contacto && <div><strong>Contacto:</strong> {pedidoDetalle.proveedor.contacto}</div>}
                  {pedidoDetalle.proveedor.telefono && <div><strong>Tel.:</strong> {pedidoDetalle.proveedor.telefono}</div>}
                  {pedidoDetalle.proveedor.email && <div><strong>Email:</strong> {pedidoDetalle.proveedor.email}</div>}
                  <div className="mt-2"><strong>Artículos:</strong>
                    <ul>
                      {/* Usamos el objeto anidado 'articulo' que viene de la API */}
                      {pedidoDetalle.items.map(i => <li key={i.id}>{i.articulo.nombre} x{i.cantidad}</li>)}
                    </ul>
                  </div>
                  {pedidoDetalle.notas && <div className="mt-2"><strong>Observaciones:</strong> {pedidoDetalle.notas}</div>}
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDetalle(false)}>Cerrar</Button>
              {pedidoDetalle && <Button variant="warning" onClick={() => imprimirPedido(pedidoDetalle)}>Descargar PDF</Button>}
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListaPedidos;
