import { VentaDetalle } from './venta-detalle.entity';
import { Cliente } from 'src/clientes/cliente.entity';
export declare enum FormaPago {
    EFECTIVO = "efectivo",
    DEBITO = "debito",
    CREDITO = "credito",
    TRANSFERENCIA = "transferencia"
}
export declare enum VentaEstado {
    COMPLETADA = "Completada",
    PENDIENTE = "Pendiente"
}
export declare enum TurnoVenta {
    MANANA = "ma\u00F1ana",
    TARDE = "tarde",
    FUERA = "fuera"
}
export declare class Venta {
    id: number;
    numeroVenta: number;
    fechaHora: Date;
    clienteId: number | null;
    cliente: Cliente;
    clienteNombre: string;
    items: VentaDetalle[];
    subtotal: number;
    interes: number;
    total: number;
    formaPago: FormaPago | null;
    estado: VentaEstado;
    turno: TurnoVenta;
    createdAt: Date;
    updatedAt: Date;
}
