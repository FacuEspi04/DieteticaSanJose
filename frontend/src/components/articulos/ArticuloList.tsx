// src/components/articulos/ArticuloList.tsx
import React, { useState, useEffect } from "react";
import { Table, Card, Form, InputGroup, Badge, Alert, Button, Modal } from "react-bootstrap";
import { Search, ExclamationTriangle, PlusCircle, Trash } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";

interface Articulo {
  id: number;
  nombre: string;
  codigoBarras: string;
  stock: number;
  stockMinimo: number;
  precio: number;
}

const ArticuloList: React.FC = () => {
  const navigate = useNavigate();
  
  // Estado para la búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [articuloAEliminar, setArticuloAEliminar] = useState<Articulo | null>(null);

  // Datos iniciales (se usarán si no hay nada en localStorage)
  const articulosIniciales: Articulo[] = [
    { id: 1, nombre: "Harina Integral", codigoBarras: "7790001234567", stock: 25, stockMinimo: 10, precio: 1200 },
    { id: 2, nombre: "Yerba Orgánica", codigoBarras: "7790002345678", stock: 8, stockMinimo: 15, precio: 2500 },
    { id: 3, nombre: "Miel Pura", codigoBarras: "7790003456789", stock: 3, stockMinimo: 5, precio: 3800 },
    { id: 4, nombre: "Aceite de Coco", codigoBarras: "7790004567890", stock: 30, stockMinimo: 10, precio: 4500 },
    { id: 5, nombre: "Quinoa", codigoBarras: "7790005678901", stock: 5, stockMinimo: 10, precio: 3200 },
  ];

  // Cargar artículos del localStorage al montar el componente
  useEffect(() => {
    cargarArticulos();
  }, []);

  const cargarArticulos = () => {
    const articulosGuardados = localStorage.getItem('articulos');
    if (articulosGuardados) {
      setArticulos(JSON.parse(articulosGuardados));
    } else {
      // Si no hay artículos guardados, usar los iniciales
      setArticulos(articulosIniciales);
      localStorage.setItem('articulos', JSON.stringify(articulosIniciales));
    }
  };

  // Confirmar eliminación
  const confirmarEliminacion = (articulo: Articulo) => {
    setArticuloAEliminar(articulo);
    setShowModal(true);
  };

  // Eliminar artículo
  const eliminarArticulo = () => {
    if (!articuloAEliminar) return;

    // Filtrar el artículo a eliminar
    const nuevosArticulos = articulos.filter((art) => art.id !== articuloAEliminar.id);
    
    // Actualizar estado
    setArticulos(nuevosArticulos);
    
    // Guardar en localStorage
    localStorage.setItem('articulos', JSON.stringify(nuevosArticulos));
    
    // Cerrar modal
    setShowModal(false);
    setArticuloAEliminar(null);
  };

  // Artículos con stock bajo
  const articulosStockBajo = articulos.filter(
    (articulo) => articulo.stock <= articulo.stockMinimo
  );

  // Filtrar artículos por código de barras o nombre
  const articulosFiltrados = articulos.filter((articulo) => {
    const terminoBusqueda = busqueda.toLowerCase().trim();
    return (
      articulo.codigoBarras.includes(terminoBusqueda) ||
      articulo.nombre.toLowerCase().includes(terminoBusqueda)
    );
  });

  return (
    <div>
      {/* Logo en la esquina superior derecha */}
      <div className="d-flex justify-content-end mb-3">
        <img 
          src={logo} 
          alt="Dietética San José" 
          style={{ height: '60px', objectFit: 'contain' }}
        />
      </div>

      <Card className="mt-4 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Lista de Artículos</h5>
        <Button 
          variant="success" 
          size="sm"
          onClick={() => navigate('/articulos/nuevo')}
        >
          <PlusCircle className="me-1" />
          Agregar Artículo
        </Button>
      </Card.Header>
      <Card.Body>
        {/* Alerta de stock bajo */}
        {articulosStockBajo.length > 0 && (
          <Alert variant="warning" className="d-flex align-items-center mb-3">
            <ExclamationTriangle size={24} className="me-2" />
            <div>
              <strong>¡Atención! Stock bajo en {articulosStockBajo.length} producto{articulosStockBajo.length !== 1 ? 's' : ''}:</strong>
              <ul className="mb-0 mt-1">
                {articulosStockBajo.map((art) => (
                  <li key={art.id}>
                    {art.nombre} - Stock actual: {art.stock} (Mínimo: {art.stockMinimo})
                  </li>
                ))}
              </ul>
            </div>
          </Alert>
        )}
        {/* Barra de búsqueda */}
        <Form.Group className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar por código de barras o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
            />
          </InputGroup>
          <Form.Text className="text-muted">
            {articulosFiltrados.length} artículo{articulosFiltrados.length !== 1 ? 's' : ''} encontrado{articulosFiltrados.length !== 1 ? 's' : ''}
          </Form.Text>
        </Form.Group>

        {/* Tabla de artículos */}
        <Table striped bordered hover responsive>
          <thead style={{ backgroundColor: "#8f3d38", color: "white" }}>
            <tr>
              <th>ID</th>
              <th>Código de Barras</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th>Stock Mínimo</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulosFiltrados && articulosFiltrados.length > 0 ? (
              articulosFiltrados.map((articulo) => (
                <tr key={articulo.id}>
                  <td>{articulo.id}</td>
                  <td>
                    <code>{articulo.codigoBarras}</code>
                  </td>
                  <td>{articulo.nombre}</td>
                  <td>
                    {articulo.stock <= articulo.stockMinimo ? (
                      <Badge bg="danger">{articulo.stock}</Badge>
                    ) : (
                      <Badge bg="success">{articulo.stock}</Badge>
                    )}
                  </td>
                  <td>{articulo.stockMinimo}</td>
                  <td>${articulo.precio.toFixed(2)}</td>
                  <td className="text-center">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmarEliminacion(articulo)}
                      title="Eliminar artículo"
                    >
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  {busqueda ? `No se encontraron artículos que coincidan con "${busqueda}"` : "No hay artículos disponibles."}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>

    {/* Modal de confirmación */}
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton style={{ backgroundColor: "#8f3d38", color: "white" }}>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {articuloAEliminar && (
          <>
            <p>¿Estás seguro de que deseas eliminar el siguiente artículo?</p>
            <div className="alert alert-warning">
              <strong>{articuloAEliminar.nombre}</strong><br />
              Código: <code>{articuloAEliminar.codigoBarras}</code><br />
              Precio: ${articuloAEliminar.precio.toFixed(2)}
            </div>
            <p className="text-danger"><strong>Esta acción no se puede deshacer.</strong></p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button variant="danger" onClick={eliminarArticulo}>
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
    </div>
  );
};

export default ArticuloList;