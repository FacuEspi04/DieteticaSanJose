import { PedidoDetalle } from './pedido-detalle.entity';
import { Proveedor } from 'src/proveedores/proveedores.entity';
export declare class Pedido {
    id: number;
    proveedorId: number;
    fechaPedido: Date;
    estado: string;
    total: number;
    notas: string | null;
    createdAt: Date;
    proveedor: Proveedor;
    items: PedidoDetalle[];
}
