// src/components/articulos/AgregarArticulo.tsx
import React, { useState, useEffect } from "react";
import { Card, Form, Button, Alert, Row, Col, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, UpcScan } from "react-bootstrap-icons";
import logo from "../../assets/dietSanJose.png";

interface ArticuloForm {
  nombre: string;
  codigoBarras: string;
  precio: string;
  stock: string;
  stockMinimo: string;
  categoria: string;
  descripcion: string;
}

const AgregarArticulo: React.FC = () => {
  const navigate = useNavigate();
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ArticuloForm>({
    nombre: "",
    codigoBarras: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    categoria: "",
    descripcion: "",
  });

  // Generar código de barras automáticamente al cargar el componente
  useEffect(() => {
    generarCodigoBarras();
  }, []);

  // Generar código de barras EAN-13 (formato argentino)
  const generarCodigoBarras = () => {
    // Prefijo 779 para Argentina + 10 dígitos aleatorios
    const prefijo = "779";
    let codigo = prefijo;
    
    // Generar 9 dígitos aleatorios
    for (let i = 0; i < 9; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    
    // Calcular dígito verificador
    const digitoVerificador = calcularDigitoVerificador(codigo);
    codigo += digitoVerificador;
    
    setFormData(prev => ({
      ...prev,
      codigoBarras: codigo
    }));
  };

  // Calcular dígito verificador para EAN-13
  const calcularDigitoVerificador = (codigo: string): number => {
    let suma = 0;
    for (let i = 0; i < codigo.length; i++) {
      const digito = parseInt(codigo[i]);
      // Los dígitos en posiciones impares (índice par) se multiplican por 1
      // Los dígitos en posiciones pares (índice impar) se multiplican por 3
      suma += i % 2 === 0 ? digito : digito * 3;
    }
    const modulo = suma % 10;
    return modulo === 0 ? 0 : 10 - modulo;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError("El nombre del artículo es obligatorio");
      return false;
    }
    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      setError("El precio debe ser mayor a 0");
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setError("El stock no puede ser negativo");
      return false;
    }
    if (!formData.stockMinimo || parseInt(formData.stockMinimo) < 0) {
      setError("El stock mínimo no puede ser negativo");
      return false;
    }
    if (!formData.categoria.trim()) {
      setError("Debes seleccionar una categoría");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito(false);

    if (!validarFormulario()) {
      return;
    }

    // Preparar artículo para guardar
    const nuevoArticulo = {
      id: Date.now(), // ID único basado en timestamp
      nombre: formData.nombre,
      codigoBarras: formData.codigoBarras,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      stockMinimo: parseInt(formData.stockMinimo),
      categoria: formData.categoria,
      descripcion: formData.descripcion,
    };
    
    // Obtener artículos existentes del localStorage
    const articulosGuardados = localStorage.getItem('articulos');
    const articulos = articulosGuardados ? JSON.parse(articulosGuardados) : [];
    
    // Agregar nuevo artículo
    articulos.push(nuevoArticulo);
    
    // Guardar en localStorage
    localStorage.setItem('articulos', JSON.stringify(articulos));
    
    console.log("Artículo guardado:", nuevoArticulo);

    // Mostrar mensaje de éxito
    setExito(true);

    // Redirigir después de 2 segundos
    setTimeout(() => {
      navigate("/articulos");
    }, 2000);
  };

  const handleCancelar = () => {
    navigate("/articulos");
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
      <Card className="shadow-sm">
        <Card.Header className="d-flex align-items-center">
          <Button
            variant="link"
            onClick={handleCancelar}
            className="p-0 me-2"
            style={{ textDecoration: "none" }}
          >
            <ArrowLeft size={24} />
          </Button>
          <h5 className="mb-0">Agregar Nuevo Artículo</h5>
        </Card.Header>
        <Card.Body>
          {/* Mensajes de error y éxito */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
              {error}
            </Alert>
          )}
          {exito && (
            <Alert variant="success" className="d-flex align-items-center">
              <CheckCircle size={24} className="me-2" />
              ¡Artículo agregado exitosamente! Redirigiendo...
            </Alert>
          )}

          {/* Formulario */}
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
                    placeholder="Ej: Harina Integral 1kg"
                    required
                  />
                </Form.Group>
              </Col>

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
                      style={{ backgroundColor: "#f8f9fa" }}
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
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    <option value="Harinas y Cereales">Harinas y Cereales</option>
                    <option value="Semillas y Frutos Secos">Semillas y Frutos Secos</option>
                    <option value="Endulzantes">Endulzantes</option>
                    <option value="Aceites">Aceites</option>
                    <option value="Infusiones">Infusiones</option>
                    <option value="Suplementos">Suplementos</option>
                    <option value="Snacks Saludables">Snacks Saludables</option>
                    <option value="Productos Orgánicos">Productos Orgánicos</option>
                    <option value="Otros">Otros</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción adicional del producto..."
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Text className="text-muted d-block mb-3">
              Los campos marcados con <span className="text-danger">*</span> son
              obligatorios
            </Form.Text>

            {/* Botones de acción */}
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button variant="success" type="submit">
                Guardar Artículo
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
    </div>
  );
};

export default AgregarArticulo;