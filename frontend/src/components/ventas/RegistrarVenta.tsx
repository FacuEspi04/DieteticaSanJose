import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  InputGroup,
  Button,
  Alert,
  Modal,
  Table,
  Badge,
  Spinner,
} from "react-bootstrap";
import { UpcScan, Trash, CheckCircle, ArrowLeft } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/dietSanJose.png";
// Importamos los servicios y tipos
import {
  getArticulos,
  createVenta,
  type CreateVentaDto,
  type CreateVentaItemDto,
  type FormaPago, 
  type VentaEstado,
  type Articulo,
} from "../../services/apiService";

// El tipo de Articulo que usa este componente (simplificado)
interface ArticuloVenta {
  id: number;
  nombre: string;
  codigoBarras: string;
  stock: number;
  precio: number;
}

interface ItemVenta {
  articulo: ArticuloVenta;
  cantidad: number;
  subtotal: number;
}

const RegistrarVenta: React.FC = () => {
  const navigate = useNavigate();
  const [codigoBarras, setCodigoBarras] = useState("");
  const [itemsVenta, setItemsVenta] = useState<ItemVenta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [catalogoArticulos, setCatalogoArticulos] = useState<ArticuloVenta[]>([]);
  // Usamos el TIPO 'FormaPago' para el estado
  const [formaPago, setFormaPago] = useState<FormaPago>("efectivo");
  const [interesPorcentaje, setInteresPorcentaje] = useState<string>("10"); // %
  const [esCtaCte, setEsCtaCte] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Cargar artículos desde la API
  useEffect(() => {
    const cargarCatalogo = async () => {
      setIsLoading(true);
      try {
        const apiItems: Articulo[] = await getArticulos(); // Usamos el tipo Articulo
        const mapeados: ArticuloVenta[] = apiItems.map((a) => ({
          // --- CORRECCIÓN 1: Forzar conversión a número al cargar ---
          id: Number(a.id), 
          nombre: a.nombre,
          marca: a.marca || '', 
          codigoBarras: a.codigo_barras,
          precio: Number(a.precio), 
          stock: a.stock ?? 0,
        }));
        setCatalogoArticulos(mapeados);
        setError(""); // Limpiar error si la carga fue exitosa
      } catch (e: any) {
        console.error("Error al cargar artículos:", e);
        setError("Error al cargar el catálogo de artículos. " + e.message);
        setCatalogoArticulos([]); 
      } finally {
        setIsLoading(false);
      }
    };
    
    cargarCatalogo();
  }, []);

  // Buscar artículo por código de barras
  const buscarArticulo = (codigo: string): ArticuloVenta | undefined => {
    return catalogoArticulos.find((art) => art.codigoBarras === codigo);
  };

  // Agregar producto a la venta
  const agregarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const codigo = codigoBarras.trim();
    if (!codigo) {
      setError("Por favor, escanea o ingresa un código de barras");
      return;
    }

    const articulo = buscarArticulo(codigo);

    if (!articulo) {
      setError(`No se encontró ningún artículo con el código: ${codigo}`);
      setCodigoBarras("");
      return;
    }

    if (articulo.stock <= 0) {
      setError(`El artículo "${articulo.nombre}" no tiene stock disponible`);
      setCodigoBarras("");
      return;
    }

    // Verificar si ya está en la venta
    const itemExistente = itemsVenta.find(
      (item) => item.articulo.id === articulo.id,
    );

    if (itemExistente) {
      // Incrementar cantidad
      if (itemExistente.cantidad >= articulo.stock) {
        setError(
          `No hay suficiente stock de "${articulo.nombre}". Stock disponible: ${articulo.stock}`,
        );
        setCodigoBarras("");
        return;
      }

      setItemsVenta(
        itemsVenta.map((item) =>
          item.articulo.id === articulo.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * articulo.precio,
              }
            : item,
        ),
      );
    } else {
      // Agregar nuevo item
      setItemsVenta([
        ...itemsVenta,
        {
          articulo,
          cantidad: 1,
          subtotal: articulo.precio,
        },
      ]);
    }

    setCodigoBarras("");
  };

  // Eliminar item de la venta
  const eliminarItem = (articuloId: number) => {
    setItemsVenta(itemsVenta.filter((item) => item.articulo.id !== articuloId));
  };

  // Actualizar cantidad de un item
  const actualizarCantidad = (articuloId: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(articuloId);
      return;
    }

    const item = itemsVenta.find((i) => i.articulo.id === articuloId);
    if (!item) return;

    // Verificar que no exceda el stock
    if (nuevaCantidad > item.articulo.stock) {
      setError(`Stock insuficiente. Disponible: ${item.articulo.stock}`);
      // Volver al máximo stock
      setItemsVenta(
        itemsVenta.map((i) =>
          i.articulo.id === articuloId
            ? {
                ...i,
                cantidad: i.articulo.stock,
                subtotal: i.articulo.stock * i.articulo.precio,
              }
            : i,
        ),
      );
      return;
    }

    // Limpiar error si la cantidad es válida
    setError("");
    setItemsVenta(
      itemsVenta.map((item) =>
        item.articulo.id === articuloId
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * item.articulo.precio,
            }
          : item,
      ),
    );
  };

  // Calcular total
  const calcularTotal = (): number => {
    return itemsVenta.reduce((total, item) => total + item.subtotal, 0);
  };

  // Calcular interés
  const calcularInteres = (): number => {
    if (esCtaCte) return 0; 
    
    if (formaPago === "credito") {
      const subtotal = calcularTotal();
      const porcentaje = parseFloat(interesPorcentaje) || 0;
      return (subtotal * porcentaje) / 100;
    }
    return 0;
  };

  // Calcular total final con interés
  const calcularTotalFinal = (): number => {
    return calcularTotal() + calcularInteres();
  };

  // Confirmar venta
  const confirmarVenta = () => {
    if (itemsVenta.length === 0) {
      setError("No hay productos en la venta");
      return;
    }
    if (esCtaCte && !nombreCliente.trim()) {
      setError("El nombre del cliente es obligatorio para Cuenta Corriente");
      return;
    }
    setShowModal(true);
  };

  // Procesar venta y guardar en API
  const procesarVenta = async () => {
    setIsSubmitting(true);
    setError("");

    // 1. Mapear items al DTO
    const itemsDto: CreateVentaItemDto[] = itemsVenta.map(item => ({
      // --- CORRECCIÓN 2: Forzar conversión a número al enviar ---
      articuloId: Number(item.articulo.id), 
      cantidad: item.cantidad,
    }));

    // 2. Crear el DTO de Venta
    const estadoVenta: VentaEstado = esCtaCte ? "Pendiente" : "Completada";
    
    const nuevaVenta: CreateVentaDto = {
      clienteNombre: nombreCliente.trim() || "Cliente General",
      // clienteId: (opcional)
      items: itemsDto,
      formaPago: esCtaCte ? null : formaPago, 
      estado: estadoVenta,
      interes: calcularInteres(), 
      // nota: (opcional)
    };

    try {
      // 3. Llamar a la API
      const ventaGuardada = await createVenta(nuevaVenta);
      
      setShowModal(false);
      setExito(`¡Venta N° ${ventaGuardada.numeroVenta} registrada! Total: $${Number(ventaGuardada.total).toFixed(2)}`);
      
      // 4. Limpiar formulario
      setItemsVenta([]);
      setNombreCliente("");
      setFormaPago("efectivo");
      setEsCtaCte(false);
      setInteresPorcentaje("10");

      // Recargar el catálogo para actualizar stock
      const apiItems = await getArticulos();
      const mapeados: ArticuloVenta[] = apiItems.map((a) => ({
        id: Number(a.id), // Asegurar que sea número
        nombre: a.nombre,
        marca: a.marca || '',
        codigoBarras: a.codigo_barras,
        precio: Number(a.precio),
        stock: a.stock ?? 0,
      }));
      setCatalogoArticulos(mapeados);
      
      setTimeout(() => setExito(""), 3000);

    } catch (apiError: any) {
      console.error("Error al procesar la venta:", apiError);
      setError(apiError.message || "Error al procesar la venta. Verifique el stock.");
      setShowModal(false); // Cerrar modal para mostrar error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancelar venta
  const cancelarVenta = () => {
    setItemsVenta([]);
    setCodigoBarras("");
    setNombreCliente("");
    setFormaPago("efectivo");
    setEsCtaCte(false);
    setError("");
  };

  return (
    <div>
      {/* Logo en la esquina superior derecha */}
      <div className="d-flex justify-content-end mb-3">
        <img
          src={logo}
          alt="Dietética San José"
          style={{ height: "60px", objectFit: "contain" }}
        />
      </div>

      <div className="mt-4">
        <Card className="shadow-sm mb-3">
          <Card.Header className="d-flex align-items-center">
            <Button
              variant="link"
              onClick={() => navigate("/ventas")}
              className="p-0 me-2"
              style={{ textDecoration: "none" }}
            >
              <ArrowLeft size={24} />
            </Button>
            <h5 className="mb-0">Registrar Nueva Venta</h5>
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
                {exito}
              </Alert>
            )}

            {/* Campo de cliente */}
            <Form.Group className="mb-3">
              <Form.Label>
                Nombre del Cliente{" "}
                {esCtaCte && <span className="text-danger">*</span>}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingresa el nombre del cliente..."
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                required={esCtaCte}
              />
              {esCtaCte && (
                <Form.Text className="text-danger">
                  El nombre es obligatorio para cuenta corriente
                </Form.Text>
              )}
            </Form.Group>

            {/* Checkbox de Cuenta Corriente */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="🏦 Venta en Cuenta Corriente (pago pendiente)"
                checked={esCtaCte}
                onChange={(e) => {
                  setEsCtaCte(e.target.checked);
                }}
              />
            </Form.Group>

            {/* Forma de pago (se oculta si es cuenta corriente) */}
            {!esCtaCte && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Forma de Pago <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    value={formaPago}
                    onChange={(e) => setFormaPago(e.target.value as FormaPago)}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="debito">Débito</option>
                    <option value="credito">Crédito (con interés)</option>
                    <option value="transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>

                {formaPago === "credito" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Interés para Tarjeta de Crédito (%)</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        min="0"
                        step="0.5"
                        value={interesPorcentaje}
                        onChange={(e) => setInteresPorcentaje(e.target.value)}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                    <Form.Text className="text-muted">
                      Interés actual: {interesPorcentaje}% ($
                      {calcularInteres().toFixed(2)})
                    </Form.Text>
                  </Form.Group>
                )}
              </>
            )}
            
            {esCtaCte && (
              <Alert variant="info" className="mt-2 mb-3">
                <small>
                  ℹ️ Esta venta quedará registrada como <strong>Pendiente</strong>.
                  La forma de pago y el interés se definirán al momento de
                  cancelar la deuda en Cuentas Corrientes.
                </small>
              </Alert>
            )}

            {/* Formulario de escaneo */}
            <Form onSubmit={agregarProducto}>
              <Form.Group className="mb-3">
                <Form.Label>Escanear Código de Barras</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <UpcScan />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder={
                      isLoading 
                        ? "Cargando catálogo..." 
                        : "Escanea o ingresa el código..."
                    }
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    autoFocus
                    disabled={isLoading} 
                  />
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    Agregar
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Enfoca este campo y escanea el código de barras con el lector
                </Form.Text>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* Lista de productos en la venta */}
        {itemsVenta.length > 0 && (
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Productos en la Venta</h6>
              <Badge bg="primary">
                {itemsVenta.length} producto
                {itemsVenta.length !== 1 ? "s" : ""}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead
                  style={{ backgroundColor: "#8f3d38", color: "white" }}
                >
                  <tr>
                    <th>Producto</th>
                    <th>Precio Unit.</th>
                    <th style={{ width: "150px" }}>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsVenta.map((item) => (
                    <tr key={item.articulo.id}>
                      <td>{item.articulo.nombre}</td>
                      <td>${item.articulo.precio.toFixed(2)}</td>
                      <td>
                        <InputGroup size="sm">
                          <Button
                            variant="outline-secondary"
                            onClick={() =>
                              actualizarCantidad(
                                item.articulo.id,
                                item.cantidad - 1,
                              )
                            }
                          >
                            −
                          </Button>
                          <Form.Control
                            type="number"
                            min="1"
                            max={item.articulo.stock}
                            value={item.cantidad}
                            onChange={(e) => {
                              const valor = parseInt(e.target.value) || 0;
                              actualizarCantidad(item.articulo.id, valor);
                            }}
                            className="text-center"
                            style={{ maxWidth: "60px" }}
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() =>
                              actualizarCantidad(
                                item.articulo.id,
                                item.cantidad + 1,
                              )
                            }
                            disabled={item.cantidad >= item.articulo.stock}
                          >
                            +
                          </Button>
                        </InputGroup>
                        <small className="text-muted d-block text-center mt-1">
                          Stock: {item.articulo.stock}
                        </small>
                      </td>
                      <td>${item.subtotal.toFixed(2)}</td>
                      <td className="text-center">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => eliminarItem(item.articulo.id)}
                        >
                          <Trash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr
                    style={{
                      backgroundColor: "#f8f9fa",
                      fontWeight: "bold",
                    }}
                  >
                    <td colSpan={3} className="text-end">
                      SUBTOTAL:
                    </td>
                    <td>${calcularTotal().toFixed(2)}</td>
                    <td></td>
                  </tr>
                  {!esCtaCte && formaPago === "credito" && calcularInteres() > 0 && (
                    <tr style={{ backgroundColor: "#fff3cd" }}>
                      <td colSpan={3} className="text-end">
                        INTERÉS ({interesPorcentaje}%):
                      </td>
                      <td>${calcularInteres().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  )}
                  <tr
                    style={{
                      backgroundColor: "#8f3d38",
                      color: "white",
                      fontWeight: "bold",
                    }}
                  >
                    <td colSpan={3} className="text-end">
                      TOTAL A PAGAR:
                    </td>
                    <td>${calcularTotalFinal().toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </Table>

              {/* Botones de acción */}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <Button variant="secondary" onClick={cancelarVenta}>
                  Cancelar Venta
                </Button>
                <Button variant="success" onClick={confirmarVenta}>
                  Confirmar Venta
                </Button>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Modal de confirmación */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header
            closeButton
            style={{ backgroundColor: "#8f3d38", color: "white" }}
          >
            <Modal.Title>Confirmar Venta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5 className="mb-3">Resumen de la venta:</h5>
            <p>
              <strong>Cliente:</strong> {nombreCliente || "Cliente General"}
            </p>
            {esCtaCte ? (
              <>
                <Alert variant="warning">
                  <strong>⚠️ CUENTA CORRIENTE - Pago Pendiente</strong>
                </Alert>
              </>
            ) : (
              <p>
                <strong>Forma de Pago:</strong>{" "}
                {formaPago.charAt(0).toUpperCase() + formaPago.slice(1)}
              </p>
            )}
            <ul>
              {itemsVenta.map((item) => (
                <li key={item.articulo.id}>
                  {item.articulo.nombre} x {item.cantidad} = $
                  {item.subtotal.toFixed(2)}
                </li>
              ))}
            </ul>
            <hr />
            <div className="d-flex justify-content-between">
              <span>Subtotal:</span>
              <strong>${calcularTotal().toFixed(2)}</strong>
            </div>
            {!esCtaCte && formaPago === "credito" && calcularInteres() > 0 && (
              <div className="d-flex justify-content-between text-warning">
                <span>Interés ({interesPorcentaje}%):</span>
                <strong>${calcularInteres().toFixed(2)}</strong>
              </div>
            )}
            <hr />
            <h4 className="text-end">
              Total {esCtaCte ? "Pendiente" : "a Pagar"}: $
              {calcularTotalFinal().toFixed(2)}
            </h4>
            <p className="text-muted mt-3">
              ¿Deseas confirmar esta venta
              {esCtaCte ? " en cuenta corriente" : ""}?
            </p>
            {/* Mostrar error de API dentro del modal si ocurre al confirmar */}
            {error && isSubmitting && (
               <Alert variant="danger" className="mt-3">
                 {error}
               </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              variant="success"
              onClick={procesarVenta}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  {' '}Procesando...
                </>
              ) : (
                "Confirmar y Procesar"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default RegistrarVenta;

