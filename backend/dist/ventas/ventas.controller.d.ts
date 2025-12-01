import { VentasService } from './ventas.service';
import { CreateVentaDto, RegistrarPagoDto } from './dto/venta.dto';
import { PagarCuentaDto } from './dto/pagar-cuenta.dto';
export declare class VentasController {
    private readonly ventasService;
    constructor(ventasService: VentasService);
    create(createVentaDto: CreateVentaDto): Promise<import("./venta.entity").Venta>;
    findAll(fecha?: string): Promise<import("./venta.entity").Venta[]>;
    findPendientes(): Promise<import("./venta.entity").Venta[]>;
    findOne(id: number): Promise<import("./venta.entity").Venta>;
    registrarPago(id: number, registrarPagoDto: RegistrarPagoDto): Promise<import("./venta.entity").Venta>;
    registrarPagoCuenta(pagarCuentaDto: PagarCuentaDto): Promise<{
        message: string;
        ventasAfectadas: number;
        reciboGenerado: number;
    }>;
    deleteAll(): Promise<{
        message: string;
        ventasEliminadas: number;
    }>;
    delete(id: number): Promise<{
        message: string;
        ventaEliminada: number;
    }>;
}
