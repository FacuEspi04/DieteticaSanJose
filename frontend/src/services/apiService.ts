// Definimos la URL base de la API
const API_URL = 'http://localhost:3000/api';

// --- Tipos Compartidos ---

export interface Categoria {
  id: number;
  nombre: string;
}

// --- 1. NUEVOS TIPOS DE MARCA ---
export interface Marca {
  id: number;
  nombre: string;
}

export interface CreateMarcaDto {
  nombre: string;
}

export interface Articulo {
  id: number;
  nombre: string;
  marca: Marca | null; // <-- CORREGIDO: Ahora es un objeto
  codigo_barras: string;
  precio: string | number; 
  stock: number;
  stock_minimo: number;
  categoria: Categoria | null; // <-- CORREGIDO: Acepta null
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArticuloDto {
  nombre: string;
  marcaId?: number; // <-- CORREGIDO: Es marcaId
  codigo_barras: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  categoriaId: number;
}

// Para el formulario de edición (campos opcionales)
export type UpdateArticuloDto = Partial<CreateArticuloDto>;
export type UpdateProveedorDto = Partial<CreateProveedorDto>;
// --- Tipos de Proveedores ---

export interface Proveedor {
  id: number;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion: string | null;
  cuit: string | null;
  notas: string | null;
  activo: boolean;
  createdAt: Date;
}

export interface CreateProveedorDto {
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion?: string;
  cuit?: string;
  notas?: string;
}

// --- Tipos de Pedidos ---

export interface PedidoItem {
  id: number;
  articuloId: number;
  articulo: Articulo; 
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  proveedorId: number;
  proveedor: Proveedor; 
  fechaPedido: Date;
  estado: string;
  total: number;
  notas: string | null;
  createdAt: Date;
  items: PedidoItem[];
}

export interface CreatePedidoItemDto {
  articuloId: number;
  cantidad: number;
}

export interface CreatePedidoDto {
  proveedorId: number;
  notas?: string;
  items: CreatePedidoItemDto[];
}

// --- Tipos de Ventas (Actualizados) ---

// Usamos 'type' en lugar de 'enum' para el frontend
export type FormaPago = 'efectivo' | 'debito' | 'credito' | 'transferencia';

export type VentaEstado = 'Completada' | 'Pendiente';

export interface VentaDetalle {
  id: number;
  articuloId: number;
  articulo: Articulo; 
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Venta {
  id: number; 
  numeroVenta: number;
  clienteId: number | null;
  clienteNombre: string;
  fechaHora: Date;
  subtotal: number;
  interes: number;
  total: number;
  formaPago: FormaPago | null; 
  estado: VentaEstado;
  turno: string;
  items: VentaDetalle[];
  createdAt: Date;
}

export interface CreateVentaItemDto {
  articuloId: number;
  cantidad: number;
}

export interface CreateVentaDto {
  clienteNombre: string;
  clienteId?: number;
  items: CreateVentaItemDto[];
  formaPago: FormaPago | null; 
  estado: VentaEstado; 
  interes?: number;
  nota?: string;
}

export interface RegistrarPagoDto {
  formaPago: FormaPago;
  interes?: number;
}

// --- Tipos de Retiros ---
export interface Retiro {
  id: number;
  fechaHora: Date;
  monto: number;
  motivo: string;
  turno: 'mañana' | 'tarde' | 'fuera';
}

export interface CreateRetiroDto {
  monto: number;
  motivo: string;
}

// --- Servicios de Artículos ---

export const getArticulos = async (search?: string): Promise<Articulo[]> => {
  const url = search
    ? `${API_URL}/articulos?search=${search}`
    : `${API_URL}/articulos`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error al obtener los artículos');
  }
  return await response.json();
};

export const getArticuloById = async (id: number): Promise<Articulo> => {
  const response = await fetch(`${API_URL}/articulos/${id}`);
  if (!response.ok) {
    throw new Error(`Error al obtener el artículo #${id}`);
  }
  return await response.json();
};

export const createArticulo = async (
  articuloData: CreateArticuloDto,
): Promise<Articulo> => {
  const response = await fetch(`${API_URL}/articulos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articuloData),
  });
  if (!response.ok) {
    throw new Error('Error al crear el artículo');
  }
  return await response.json();
};

export const updateArticulo = async (
  id: number,
  articuloData: UpdateArticuloDto,
): Promise<Articulo> => {
  const response = await fetch(`${API_URL}/articulos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(articuloData),
  });
  if (!response.ok) {
    throw new Error('Error al actualizar el artículo');
  }
  return await response.json();
};

export const deleteArticulo = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/articulos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Error al eliminar el artículo');
  }
  return await response.json();
};

// --- Servicios de Categorías ---

export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await fetch(`${API_URL}/categorias`);
  if (!response.ok) {
    throw new Error('Error al obtener las categorías');
  }
  return await response.json();
};

// --- 2. NUEVOS SERVICIOS DE MARCAS ---
export const getMarcas = async (): Promise<Marca[]> => {
  const response = await fetch(`${API_URL}/marcas`);
  if (!response.ok) {
    throw new Error('Error al obtener las marcas');
  }
  return await response.json();
};

export const createMarca = async (
  marcaData: CreateMarcaDto,
): Promise<Marca> => {
  const response = await fetch(`${API_URL}/marcas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(marcaData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message.join(', ') || 'Error al crear la marca');
  }
  return await response.json();
};
// --- FIN SERVICIOS DE MARCAS ---

// --- Servicios de Proveedores ---

export const getProveedores = async (): Promise<Proveedor[]> => {
  const response = await fetch(`${API_URL}/proveedores`);
  if (!response.ok) {
    throw new Error('Error al obtener los proveedores');
  }
  return await response.json();
};

export const createProveedor = async (
  proveedorData: CreateProveedorDto,
): Promise<Proveedor> => {
  const response = await fetch(`${API_URL}/proveedores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proveedorData),
  });
  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message.join(', '));
    }
    throw new Error('Error al crear el proveedor');
  }
  return await response.json();
};

// --- AÑADIDO: updateProveedor ---
export const updateProveedor = async (
 id: number,
 proveedorData: UpdateProveedorDto,
): Promise<Proveedor> => {
 const response = await fetch(`${API_URL}/proveedores/${id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(proveedorData), 
});
 if (!response.ok) {
 if (response.status === 400) {
 	  const error = await response.json();
 	  throw new Error(error.message.join(', '));
 	}
 throw new Error('Error al actualizar el proveedor');
 }
 return await response.json();
};

export const getProveedorById = async (id: number): Promise<Proveedor> => {
  const response = await fetch(`${API_URL}/proveedores/${id}`);
  if (!response.ok) {
    throw new Error(`Error al obtener el proveedor #${id}`);
  }
  return await response.json();
};

export const deleteProveedor = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/proveedores/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    // Capturar error del backend
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar el proveedor');
  }
  return await response.json();
};

// --- Servicios de Pedidos ---

export const getPedidos = async (
  proveedorId?: string,
  desde?: string,
  hasta?: string,
): Promise<Pedido[]> => {
  const params = new URLSearchParams();
  if (proveedorId) params.append('proveedorId', proveedorId);
  if (desde) params.append('desde', desde);
  if (hasta) params.append('hasta', hasta);

  const response = await fetch(`${API_URL}/pedidos?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Error al obtener los pedidos');
  }
  return await response.json();
};

export const getPedidoById = async (id: number): Promise<Pedido> => {
  const response = await fetch(`${API_URL}/pedidos/${id}`);
  if (!response.ok) {
    throw new Error(`Error al obtener el pedido #${id}`);
  }
  return await response.json();
};

export const createPedido = async (
  pedidoData: CreatePedidoDto,
): Promise<Pedido> => {
  const response = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pedidoData),
  });
  if (!response.ok) {
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message.join(', '));
    }
    throw new Error('Error al crear el pedido');
  }
  return await response.json();
};

export const deletePedido = async (
  id: number,
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/pedidos/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar el pedido');
  }
  return await response.json();
};

// --- Servicios de Ventas (Actualizados) ---

export const getVentasPorFecha = async (fecha: string): Promise<Venta[]> => {
  const response = await fetch(`${API_URL}/ventas?fecha=${fecha}`);
  if (!response.ok) {
    throw new Error('Error al obtener las ventas');
  }
  return await response.json();
};

export const getVentasPendientes = async (): Promise<Venta[]> => {
  const response = await fetch(`${API_URL}/ventas/pendientes`);
  if (!response.ok) {
    throw new Error('Error al obtener las ventas pendientes');
  }
  return await response.json();
};

export const createVenta = async (ventaData: CreateVentaDto): Promise<Venta> => {
  const response = await fetch(`${API_URL}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ventaData),
  });

  if (!response.ok) {
    // Capturar errores de stock o validación del backend
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear la venta');
  }
  return await response.json();
}; 

export const registrarPagoVenta = async (
  ventaId: number, // Usamos el 'id'
  pagoData: RegistrarPagoDto,
): Promise<Venta> => {
  const response = await fetch(`${API_URL}/ventas/${ventaId}/pagar`, { // Usamos el 'id'
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pagoData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al registrar el pago');
  }
  return await response.json();
};

export const deleteVenta = async (
  ventaId: number, // Usamos el 'id'
): Promise<{ message: string; ventaEliminada: number }> => {
  const response = await fetch(`${API_URL}/ventas/${ventaId}`, { // Usamos el 'id'
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar la venta');
  }
  return await response.json();
};

// --- Servicios de Retiros ---

export const getRetirosPorFecha = async (fecha: string): Promise<Retiro[]> => {
  const response = await fetch(`${API_URL}/retiros?fecha=${fecha}`);
  if (!response.ok) {
    throw new Error('Error al obtener los retiros');
  }
  return await response.json();
};

export const createRetiro = async (retiroData: CreateRetiroDto): Promise<Retiro> => {
  const response = await fetch(`${API_URL}/retiros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(retiroData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al registrar el retiro');
  }
  return await response.json();
};

