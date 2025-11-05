import { FormaPago, VentaEstado } from '../venta.entity';
export declare class CreateVentaItemDto {
    articuloId: number;
    cantidad: number;
}
export declare class CreateVentaDto {
    clienteId?: number;
    clienteNombre?: string;
    items: CreateVentaItemDto[];
    formaPago: FormaPago;
    interes?: number;
    estado: VentaEstado;
}
export declare class RegistrarPagoDto {
    formaPago: FormaPago;
    interes?: number;
}
