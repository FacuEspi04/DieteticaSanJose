import { Venta } from './venta.entity';
import { Articulo } from 'src/articulos/articulo.entity';
export declare class VentaDetalle {
    id: number;
    numeroVenta: number;
    venta: Venta;
    articuloId: number;
    articulo: Articulo;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}
