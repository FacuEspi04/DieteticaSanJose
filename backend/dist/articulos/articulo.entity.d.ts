import { Categoria } from 'src/categorias/categoria.entity';
import { Marca } from 'src/marcas/marca.entity';
import { PedidoDetalle } from 'src/pedidos/pedido-detalle.entity';
import { VentaDetalle } from 'src/ventas/venta-detalle.entity';
export declare class Articulo {
    id: number;
    nombre: string;
    codigo_barras: string;
    precio: number;
    stock: number;
    stock_minimo: number;
    categoriaId: number | null;
    categoria: Categoria | null;
    marcaId: number | null;
    marca: Marca | null;
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
    itemsVenta: VentaDetalle[];
    itemsPedido: PedidoDetalle[];
}
