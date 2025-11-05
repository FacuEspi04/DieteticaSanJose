import { VentasService } from './ventas.service';
import { CreateVentaDto, RegistrarPagoDto } from './dto/venta.dto';
export declare class VentasController {
    private readonly ventasService;
    constructor(ventasService: VentasService);
    create(createVentaDto: CreateVentaDto): Promise<import("./venta.entity").Venta>;
    findAll(fecha?: string): Promise<import("./venta.entity").Venta[]>;
    findPendientes(): Promise<import("./venta.entity").Venta[]>;
    findOne(id: number): Promise<import("./venta.entity").Venta>;
    registrarPago(id: number, registrarPagoDto: RegistrarPagoDto): Promise<import("./venta.entity").Venta>;
    deleteAll(): Promise<{
        message: string;
        ventasEliminadas: number;
    }>;
    delete(id: number): Promise<{
        message: string;
        ventaEliminada: number;
    }>;
}
