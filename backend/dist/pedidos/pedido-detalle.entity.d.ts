import { Pedido } from './pedido.entity';
import { Articulo } from 'src/articulos/articulo.entity';
export declare class PedidoDetalle {
    id: number;
    pedidoId: number;
    articuloId: number;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    pedido: Pedido;
    articulo: Articulo;
}
