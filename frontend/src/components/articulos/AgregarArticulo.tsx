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
  Modal, // Importar Modal
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, UpcScan } from 'react-bootstrap-icons';
import logo from '../../assets/dietSanJose.png';
import {
  createArticulo,
  getCategorias,
  getMarcas,
  createMarca,
  createCategoria, // <-- AÑADIDO
  type Categoria,
  type Marca,
  type CreateArticuloDto,
} from '../../services/apiService';

// Interfaz para el estado del formulario
interface ArticuloForm {
  nombre: string;
  marcaId: string;
  codigoBarras: string;
  precio: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
}

const AgregarArticulo: React.FC = () => {
  const navigate = useNavigate();
  const [exito, setExito] = useState(false);
  const [error, setError] = useState('');

  // Estados para los desplegables
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Un solo estado de carga
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para el Modal de Nueva Marca
  const [showMarcaModal, setShowMarcaModal] = useState(false);
  const [newMarcaName, setNewMarcaName] = useState('');
  const [errorMarca, setErrorMarca] = useState(''); // Error específico del modal

  // --- AÑADIDO ---
  // Estados para el Modal de Nueva Categoria
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [newCategoriaName, setNewCategoriaName] = useState('');
  const [errorCategoria, setErrorCategoria] = useState(''); // Error específico del modal

  const [formData, setFormData] = useState<ArticuloForm>({
    nombre: '',
    marcaId: '',
    codigoBarras: '',
    precio: '',
    stock: '',
    stockMinimo: '',
    categoriaId: '',
  });

  // Cargar categorías y MARCAS al montar
  useEffect(() => {
    generarCodigoBarras();

    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        // Pedimos ambas cosas en paralelo
        const [categoriasData, marcasData] = await Promise.all([
          getCategorias(),
          getMarcas(),
        ]);
        setCategorias(categoriasData);
        setMarcas(marcasData);
        setError(''); // Limpiar errores si todo carga bien
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(
          'No se pudieron cargar las categorías o marcas. Intente más tarde.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Generar código de barras (sin cambios)
  const generarCodigoBarras = () => {
    const prefijo = '779';
    let codigo = prefijo;
    for (let i = 0; i < 9; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    const digitoVerificador = calcularDigitoVerificador(codigo);
    codigo += digitoVerificador;
    setFormData((prev) => ({
      ...prev,
      codigoBarras: codigo,
    }));
  };

  // Calcular dígito verificador (sin cambios)
  const calcularDigitoVerificador = (codigo: string): number => {
    let suma = 0;
    for (let i = 0; i < codigo.length; i++) {
      const digito = parseInt(codigo[i]);
      suma += i % 2 === 0 ? digito : digito * 3;
    }
    const modulo = suma % 10;
    return modulo === 0 ? 0 : 10 - modulo;
  };

  // --- MODIFICADO ---
  // Manejador de cambios para abrir el modal
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === 'marcaId' && value === 'NUEVA_MARCA') {
      setShowMarcaModal(true); // Abre el modal de marca
    } else if (name === 'categoriaId' && value === 'NUEVA_CATEGORIA') {
      // <-- AÑADIDO
      setShowCategoriaModal(true); // Abre el modal de categoría
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const validarFormulario = (): boolean => {
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
    // --- MODIFICADO ---
    if (!formData.categoriaId || formData.categoriaId === 'NUEVA_CATEGORIA') {
      setError('Debes seleccionar una categoría');
      return false;
    }
    if (!formData.marcaId || formData.marcaId === 'NUEVA_MARCA') {
      setError('Debes seleccionar una marca');
      return false;
    }
    return true;
  };

  // Manejador para crear la nueva marca (sin cambios)
  const handleCrearMarca = async () => {
    if (!newMarcaName.trim()) {
      setErrorMarca('El nombre de la marca no puede estar vacío.');
      return;
    }

    setIsSubmitting(true);
    setErrorMarca('');

    try {
      const nuevaMarca = await createMarca({ nombre: newMarcaName.trim() });
      setMarcas([...marcas, nuevaMarca]);
      setFormData((prev) => ({ ...prev, marcaId: String(nuevaMarca.id) }));
      setShowMarcaModal(false);
      setNewMarcaName('');
    } catch (err: any) {
      console.error('Error al crear marca:', err);
      setErrorMarca(err.message || 'Error al guardar la marca.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- AÑADIDO ---
  // Manejador para crear la nueva categoría desde el modal
  const handleCrearCategoria = async () => {
    if (!newCategoriaName.trim()) {
      setErrorCategoria('El nombre de la categoría no puede estar vacío.');
      return;
    }

    setIsSubmitting(true);
    setErrorCategoria('');

    try {
      // 1. Llamar a la API
      const nuevaCategoria = await createCategoria({
        nombre: newCategoriaName.trim(),
      });

      // 2. Añadir la nueva categoría a la lista del desplegable
      setCategorias([...categorias, nuevaCategoria]);

      // 3. Seleccionar automáticamente la categoría recién creada
      setFormData((prev) => ({
        ...prev,
        categoriaId: String(nuevaCategoria.id),
      }));

      // 4. Cerrar el modal y limpiar
      setShowCategoriaModal(false);
      setNewCategoriaName('');
    } catch (err: any) {
      console.error('Error al crear categoría:', err);
      setErrorCategoria(err.message || 'Error al guardar la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito(false);

    if (!validarFormulario()) {
      return;
    }

    setIsSubmitting(true);

    // Preparar artículo para la API
    const nuevoArticulo: CreateArticuloDto = {
      nombre: formData.nombre.trim(),
      marcaId: parseInt(formData.marcaId, 10),
      codigo_barras: formData.codigoBarras,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock, 10),
      stock_minimo: parseInt(formData.stockMinimo, 10),
      categoriaId: parseInt(formData.categoriaId, 10),
    };

    try {
      await createArticulo(nuevoArticulo);
      setExito(true);
      setTimeout(() => {
        navigate('/articulos');
      }, 2000);
    } catch (apiError: any) {
      console.error('Error al guardar artículo:', apiError);
      setError(apiError.message || 'Error al guardar el artículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = () => {
    navigate('/articulos');
  };

  return (
    <div>
      {/* ... Logo (sin cambios) ... */}
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
            {/* ... Botón de volver (sin cambios) ... */}
            <Button
              variant="link"
              onClick={handleCancelar}
              className="p-0 me-2"
              style={{ textDecoration: 'none' }}
            >
              <ArrowLeft size={24} />
            </Button>
            <h5 className="mb-0">Agregar Nuevo Artículo</h5>
          </Card.Header>
          <Card.Body>
            {/* ... Alertas (sin cambios) ... */}
            {error && (
              <Alert variant="danger" dismissible onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {exito && (
              <Alert variant="success" className="d-flex align-items-center">
                <CheckCircle size={24} className="me-2" />
                ¡Artículo agregado exitosamente! Redirigiendo...
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row>
                {/* ... Nombre (sin cambios) ... */}
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
                      placeholder="Ej: Harina Integral 1kg"
                      required
                    />
                  </Form.Group>
                </Col>

                {/* ... Código de Barras (sin cambios) ... */}
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Código de Barras <span className="text-danger">*</span>
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <UpcScan />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        name="codigoBarras"
                        value={formData.codigoBarras}
                        onChange={handleChange}
                        readOnly
                        style={{ backgroundColor: '#f8f9fa' }}
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={generarCodigoBarras}
                        title="Generar nuevo código"
                      >
                        🔄
                      </Button>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Código generado automáticamente
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                {/* ... Precio, Stock, Stock Mínimo (sin cambios) ... */}
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
                        placeholder="0.00"
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
                      placeholder="0"
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
                      placeholder="0"
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
                      disabled={isLoading}
                    >
                      <option value="">
                        {isLoading
                          ? 'Cargando...'
                          : 'Selecciona una categoría'}
                      </option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                      {/* --- AÑADIDO --- */}
                      <option
                        value="NUEVA_CATEGORIA"
                        style={{ fontStyle: 'italic', color: 'blue' }}
                      >
                        -- Agregar Nueva Categoría --
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* --- Campo de Marca (sin cambios) --- */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Marca <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="marcaId"
                      value={formData.marcaId}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    >
                      <option value="">
                        {isLoading ? 'Cargando...' : 'Selecciona una marca'}
                      </option>
                      {marcas.map((marca) => (
                        <option key={marca.id} value={marca.id}>
                          {marca.nombre}
                        </option>
                      ))}
                      <option
                        value="NUEVA_MARCA"
                        style={{ fontStyle: 'italic', color: 'blue' }}
                      >
                        -- Agregar Nueva Marca --
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* ... (Texto obligatorio y botones sin cambios) ... */}
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
                      {' '}Guardando...
                    </>
                  ) : (
                    'Guardar Artículo'
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>

      {/* --- Modal para crear nueva marca (sin cambios) --- */}
      <Modal
        show={showMarcaModal}
        onHide={() => setShowMarcaModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Nueva Marca</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMarca && <Alert variant="danger">{errorMarca}</Alert>}
          <Form.Group>
            <Form.Label>Nombre de la nueva marca</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Yin Yang"
              value={newMarcaName}
              onChange={(e) => setNewMarcaName(e.target.value)}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowMarcaModal(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCrearMarca}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                {' '}Creando...
              </>
            ) : (
              'Crear y Seleccionar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- AÑADIDO: Modal para crear nueva categoría --- */}
      <Modal
        show={showCategoriaModal}
        onHide={() => setShowCategoriaModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Nueva Categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorCategoria && (
            <Alert variant="danger">{errorCategoria}</Alert>
          )}
          <Form.Group>
            <Form.Label>Nombre de la nueva categoría</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Galletitas"
              value={newCategoriaName}
              onChange={(e) => setNewCategoriaName(e.target.value)}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCategoriaModal(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCrearCategoria}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" />
                {' '}Creando...
              </>
            ) : (
              'Crear y Seleccionar'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AgregarArticulo;