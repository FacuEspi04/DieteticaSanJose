import React, { useEffect, useState } from "react";
import { Card, Table, Button, Row, Col, Form, Modal, Alert } from "react-bootstrap";
import logo from "../../assets/dietSanJose.png";

interface Articulo {
  id: number;
  nombre: string;
  codigoBarras: string;
}

interface ItemPedido {
  articulo: Articulo;
  cantidad: number;
}

interface Proveedor {
  id: number;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
}

interface PedidoGuardado {
  id: number;
  fecha: string;
  hora: string;
  proveedor: Proveedor;
  items: ItemPedido[];
  observaciones?: string;
}

const ListaPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<PedidoGuardado[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [proveedorId, setProveedorId] = useState<string>("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pedidoDetalle, setPedidoDetalle] = useState<PedidoGuardado|null>(null);
  const [showDetalle, setShowDetalle] = useState(false);

  useEffect(() => {
    const pedidosLS = localStorage.getItem("pedidos");
    setPedidos(pedidosLS ? JSON.parse(pedidosLS) : []);
    const proveedoresLS = localStorage.getItem("proveedores");
    setProveedores(proveedoresLS ? JSON.parse(proveedoresLS) : []);
  }, []);

  const filtrarPedidos = () => {
    return pedidos.filter(p => {
      if (proveedorId && String(p.proveedor.id) !== proveedorId) return false;
      if (desde && p.fecha < desde) return false;
      if (hasta && p.fecha > hasta) return false;
      return true;
    });
  };
  const pedidosFiltrados = filtrarPedidos();

  const imprimirPedido = (pedido: PedidoGuardado) => {
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
      <div class="muted">Fecha: ${pedido.fecha} - Hora: ${pedido.hora}</div>
      <h3>Proveedor</h3>
      <div><strong>${pedido.proveedor.nombre}</strong></div>
      ${pedido.proveedor.contacto ? `<div>Contacto: ${pedido.proveedor.contacto}</div>` : ''}
      ${pedido.proveedor.telefono ? `<div>Teléfono: ${pedido.proveedor.telefono}</div>` : ''}
      ${pedido.proveedor.email ? `<div>Email: ${pedido.proveedor.email}</div>` : ''}
      ${pedido.observaciones ? `<div><strong>Observaciones:</strong> ${pedido.observaciones}</div>` : ''}
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
                <Form.Select value={proveedorId} onChange={e=>setProveedorId(e.target.value)}>
                  <option value="">Todos</option>
                  {proveedores.map(p=>(<option key={p.id} value={p.id}>{p.nombre}</option>))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Desde (fecha)</Form.Label>
                <Form.Control type="date" value={desde} onChange={e=>setDesde(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Hasta (fecha)</Form.Label>
                <Form.Control type="date" value={hasta} onChange={e=>setHasta(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Table striped bordered hover responsive>
            <thead style={{ backgroundColor: "#8f3d38", color: "white" }}>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Proveedor</th>
                <th>Ítems</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length > 0 ? pedidosFiltrados.map(pedido => (
                <tr key={pedido.id}>
                  <td>{pedido.fecha}</td>
                  <td>{pedido.hora}</td>
                  <td>{pedido.proveedor.nombre}</td>
                  <td>{pedido.items.length}</td>
                  <td>
                    <Button variant="info" size="sm" className="me-2" onClick={()=>{ setPedidoDetalle(pedido); setShowDetalle(true);} }>Ver</Button>
                    <Button variant="warning" size="sm" onClick={()=> imprimirPedido(pedido)}>PDF</Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center">No hay pedidos registrados en este rango/proveedor.</td>
                </tr>
              )}
            </tbody>
          </Table>

          <Modal show={showDetalle} onHide={()=>setShowDetalle(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Detalle de Pedido</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {pedidoDetalle && (
                <>
                  <div><strong>Fecha:</strong> {pedidoDetalle.fecha} {pedidoDetalle.hora}</div>
                  <div><strong>Proveedor:</strong> {pedidoDetalle.proveedor.nombre}</div>
                  {pedidoDetalle.proveedor.contacto && <div><strong>Contacto:</strong> {pedidoDetalle.proveedor.contacto}</div>}
                  {pedidoDetalle.proveedor.telefono && <div><strong>Tel.:</strong> {pedidoDetalle.proveedor.telefono}</div>}
                  {pedidoDetalle.proveedor.email && <div><strong>Email:</strong> {pedidoDetalle.proveedor.email}</div>}
                  <div className="mt-2"><strong>Artículos:</strong>
                    <ul>
                      {pedidoDetalle.items.map(i => <li key={i.articulo.id}>{i.articulo.nombre} x{i.cantidad}</li>)}
                    </ul>
                  </div>
                  {pedidoDetalle.observaciones && <div className="mt-2"><strong>Observaciones:</strong> {pedidoDetalle.observaciones}</div>}
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={()=>setShowDetalle(false)}>Cerrar</Button>
              {pedidoDetalle && <Button variant="warning" onClick={()=>imprimirPedido(pedidoDetalle)}>Descargar PDF</Button>}
            </Modal.Footer>
          </Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ListaPedidos;
