import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  InputGroup,
  Spinner,
} from 'react-bootstrap';
// Importamos useParams para leer el 'id' de la URL
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'react-bootstrap-icons';
import logo from '../../assets/dietSanJose.png';
import { type Categoria, getArticuloById, getCategorias, type UpdateArticuloDto, updateArticulo } from '../../services/apiService';


// Interfaz para el estado del formulario (igual que en Agregar)
interface ArticuloForm {
  nombre: string;
  marca: string;
  codigoBarras: string;
  precio: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
}

const EditarArticulo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // <-- Obtenemos el ID del artículo de la URL
  const articuloId = Number(id);

  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Para cargar datos
  const [isSubmitting, setIsSubmitting] = useState(false); // Para guardar

  const [formData, setFormData] = useState<ArticuloForm>({
    nombre: '',
    marca: '',
    codigoBarras: '',
    precio: '',
    stock: '',
    stockMinimo: '',
    categoriaId: '',
  });

  // Cargar datos del artículo y categorías al montar
  useEffect(() => {
    if (!articuloId) {
      setError('ID de artículo inválido.');
      setIsLoading(false);
      return;
    }

    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        // Pedimos ambas cosas en paralelo
        const [articuloData, categoriasData] = await Promise.all([
          getArticuloById(articuloId),
          getCategorias(),
        ]);

        // Llenamos el formulario con los datos del artículo
        setFormData({
          nombre: articuloData.nombre,
          marca: articuloData.marca || '',
          codigoBarras: articuloData.codigo_barras,
          precio: String(articuloData.precio),
          stock: String(articuloData.stock),
          stockMinimo: String(articuloData.stock_minimo),
          categoriaId: String(articuloData.categoria.id),
        });
        setCategorias(categoriasData);
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(err.message || 'No se pudieron cargar los datos.');
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, [articuloId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validarFormulario = (): boolean => {
    // Reutilizamos las mismas validaciones que en "Agregar"
    if (!formData.nombre.trim()) {
      setError('El nombre del artículo es obligatorio');
      return false;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      setError('El precio debe ser mayor a 0');
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError('El stock no puede ser negativo');
      return false;
    }
    if (!formData.stockMinimo || parseInt(formData.stockMinimo) < 0) {
      setError('El stock mínimo no puede ser negativo');
      return false;
    }
    if (!formData.categoriaId) {
      setError('Debes seleccionar una categoría');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito(false);

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    // Preparar DTO de actualización
    const articuloActualizado: UpdateArticuloDto = {
      nombre: formData.nombre.trim(),
      marca: formData.marca.trim() || undefined,
      // No permitimos editar el código de barras por ser un identificador único
      // codigo_barras: formData.codigoBarras,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock, 10),
      stock_minimo: parseInt(formData.stockMinimo, 10),
      categoriaId: parseInt(formData.categoriaId, 10),
    };

    try {
      await updateArticulo(articuloId, articuloActualizado);
      setExito(true);

      setTimeout(() => {
        navigate('/articulos');
      }, 2000);
    } catch (apiError: any) {
      console.error('Error al actualizar artículo:', apiError);
      setError(apiError.message || 'Error al actualizar el artículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    navigate('/articulos');
  };

  // --- RENDERIZADO ---

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Cargando datos del artículo...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-end mb-3">
        <img
          src={logo}
          alt="Dietética San José"
          style={{ height: '80px', objectFit: 'contain' }}
        />
      </div>

      <div className="mt-4">
        <Card className="shadow-sm">
          <Card.Header className="d-flex align-items-center">
            <Button
              variant="link"
              onClick={handleCancelar}
              className="p-0 me-2"
              style={{ textDecoration: 'none' }}
            >
              <ArrowLeft size={24} />
            </Button>
            {/* Título dinámico */}
            <h5 className="mb-0">Editar Artículo: {formData.nombre}</h5>
          </Card.Header>
          <Card.Body>
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {exito && (
              <Alert variant="success" className="d-flex align-items-center">
                <CheckCircle size={24} className="me-2" />
                ¡Artículo actualizado exitosamente! Redirigiendo...
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Nombre del Artículo <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Código de Barras</Form.Label>
                    {/* Hacemos que el código de barras no sea editable */}
                    <Form.Control
                      type="text"
                      name="codigoBarras"
                      value={formData.codigoBarras}
                      readOnly
                      disabled
                      style={{ backgroundColor: '#f8f9fa' }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Precio <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Stock Actual <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Stock Mínimo <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="stockMinimo"
                      value={formData.stockMinimo}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Categoría <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="categoriaId"
                      value={formData.categoriaId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Marca</Form.Label>
                    <Form.Control
                      type="text"
                      name="marca"
                      value={formData.marca}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Text className="text-muted d-block mb-3">
                Los campos marcados con <span className="text-danger">*</span> son
                obligatorios
              </Form.Text>

              <div className="d-flex justify-content-end gap-2">
                <Button
                  variant="secondary"
                  onClick={handleCancelar}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button variant="success" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" />
                      {' '}Guardando Cambios...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default EditarArticulo;
