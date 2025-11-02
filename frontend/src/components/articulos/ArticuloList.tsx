import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Card,
  Form,
  InputGroup,
  Badge,
  Alert,
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap';
import {
  Search,
  ExclamationTriangle,
  PlusCircle,
  Trash,
  PencilSquare, // <-- IMPORTAR ÍCONO DE EDITAR
} from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/dietSanJose.png';
import {
  getArticulos,
  deleteArticulo,
  type Articulo,
} from '../../services/apiService';

const ArticuloList: React.FC = () => {
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [articuloAEliminar, setArticuloAEliminar] = useState<Articulo | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    cargarArticulos();
  }, []);

  const cargarArticulos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getArticulos();
      setArticulos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los artículos');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarEliminacion = (articulo: Articulo) => {
    setArticuloAEliminar(articulo);
    setShowModal(true);
  };
  
  // --- FUNCIÓN NUEVA ---
  const handleEditar = (id: number) => {
    navigate(`/articulos/editar/${id}`);
  };

  const eliminarArticulo = async () => {
    if (!articuloAEliminar) return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteArticulo(articuloAEliminar.id);
      setArticulos((prevArticulos) =>
        prevArticulos.filter((art) => art.id !== articuloAEliminar.id),
      );
      setShowModal(false);
      setArticuloAEliminar(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el artículo');
    } finally {
      setIsDeleting(false);
    }
  };

  const articulosFiltrados = useMemo(() => {
    const terminoBusqueda = busqueda.toLowerCase().trim();
    if (!terminoBusqueda) {
      return articulos;
    }
    return articulos.filter((articulo) => {
      return (
        (articulo.codigo_barras &&
          articulo.codigo_barras.includes(terminoBusqueda)) ||
        (articulo.nombre &&
          articulo.nombre.toLowerCase().includes(terminoBusqueda)) ||
        (articulo.marca &&
          articulo.marca.toLowerCase().includes(terminoBusqueda))
      );
    });
  }, [articulos, busqueda]);

  const articulosStockBajo = useMemo(() => {
    return articulos.filter(
      (articulo) => articulo.stock <= articulo.stock_minimo,
    );
  }, [articulos]);

  return (
    <div>
      {/* ... (Logo y Card.Header no cambian) ... */}
      <div className="d-flex justify-content-end mb-3">
        <img
          src={logo}
          alt="Dietética San José"
          style={{ height: '80px', objectFit: 'contain' }}
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
          
          {/* --- MODIFICACIÓN AQUÍ ---
              Añadimos el botón de "Crear Pedido" dentro de la alerta de stock bajo
          */}
          {articulosStockBajo.length > 0 && (
            <Alert variant="warning" className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                {/* Contenido de la alerta (Izquierda) */}
                <div className="d-flex align-items-center">
                  <ExclamationTriangle
                    size={32} // Un poco más grande para que se note
                    className="me-3 text-warning"
                  />
                  <div>
                    <strong>
                      ¡Atención! Stock bajo en {articulosStockBajo.length}{" "}
                      producto
                      {articulosStockBajo.length !== 1 ? "s" : ""}:
                    </strong>
                    {/* Usamos 'small' y 'fontSize' para que la lista no sea tan grande */}
                    <small> 
                      <ul className="mb-0 mt-1" style={{ fontSize: "0.9em" }}>
                        {articulosStockBajo.map((art) => (
                          <li key={art.id}>
                            {art.nombre} (Stock: {art.stock} / Mín:{" "}
                            {art.stock_minimo})
                          </li>
                        ))}
                      </ul>
                    </small>
                  </div>
                </div>
                
                {/* Botón nuevo para ir a Pedidos (Derecha) */}
                <div className="ms-3">
                  <Button
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate('/proveedores/pedidos/nuevo')}
                    title="Ir a crear un nuevo pedido a proveedores"
                  >
                    Crear Pedido
                  </Button>
                </div>
              </div>
            </Alert>
          )}
          {/* --- FIN DE LA MODIFICACIÓN --- */}


          {error && !isDeleting && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {/* ... (Form.Group de Búsqueda no cambia) ... */}
          <Form.Group className="mb-3">
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar por código, nombre o marca..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                autoFocus
              />
            </InputGroup>
            <Form.Text className="text-muted">
              {articulosFiltrados.length} artículo
              {articulosFiltrados.length !== 1 ? 's' : ''} encontrado
              {articulosFiltrados.length !== 1 ? 's' : ''}
            </Form.Text>
          </Form.Group>

          {isLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="success" />
              <p className="mt-2">Cargando artículos...</p>
            </div>
          ) : (
            <Table striped bordered hover responsive>
              <thead style={{ backgroundColor: '#8f3d38', color: 'white' }}>
                <tr>
                  <th>ID</th>
                  <th>Código de Barras</th>
                  <th>Nombre</th>
                  <th>Marca</th>
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
                        <code>{articulo.codigo_barras}</code>
                      </td>
                      <td>{articulo.nombre}</td>
                      <td>{articulo.marca || <small className="text-muted">N/A</small>}</td>
                      <td>
                        {articulo.stock <= articulo.stock_minimo ? (
                          <Badge bg="danger">{articulo.stock}</Badge>
                        ) : (
                          <Badge bg="success">{articulo.stock}</Badge>
                        )}
                      </td>
                      <td>{articulo.stock_minimo}</td>
                      <td>${Number(articulo.precio).toFixed(2)}</td>
                      {/* Esta es tu celda de Acciones original, la respetamos */}
                      <td className="text-center">
                        <Button
                          variant="outline-primary" // Botón de editar
                          size="sm"
                          className="me-2" // Margen a la derecha
                          onClick={() => handleEditar(articulo.id)}
                          title="Editar artículo"
                        >
                          <PencilSquare />
                        </Button>
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
                    <td colSpan={8} className="text-center">
                      {busqueda
                        ? `No se encontraron artículos que coincidan con "${busqueda}"`
                        : 'No hay artículos disponibles. Comienza agregando uno.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* ... (Modal de confirmación de borrado no cambia) ... */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: '#8f3d38', color: 'white' }}
        >
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && isDeleting && <Alert variant="danger">{error}</Alert>}
          {articuloAEliminar && (
            <>
              <p>¿Estás seguro de que deseas eliminar el siguiente artículo?</p>
              <div className="alert alert-warning">
                <strong>{articuloAEliminar.nombre}</strong>
                <br />
                {articuloAEliminar.marca && (
                  <>
                    Marca: {articuloAEliminar.marca}
                    <br />
                  </>
                )}
                Código: <code>{articuloAEliminar.codigo_barras}</code>
                <br />
                Precio: ${Number(articuloAEliminar.precio).toFixed(2)}
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
            onClick={() => setShowModal(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={eliminarArticulo}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Eliminando...
              </>
            ) : (
              'Eliminar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ArticuloList;

