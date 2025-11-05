import { Articulo } from 'src/articulos/articulo.entity';
import { Cliente } from 'src/clientes/cliente.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateVentaDto, RegistrarPagoDto } from './dto/venta.dto';
import { VentaDetalle } from './venta-detalle.entity';
import { Venta } from './venta.entity';
export declare class VentasService {
    private readonly ventaRepository;
    private readonly detalleRepository;
    private readonly articuloRepository;
    private readonly clienteRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(ventaRepository: Repository<Venta>, detalleRepository: Repository<VentaDetalle>, articuloRepository: Repository<Articulo>, clienteRepository: Repository<Cliente>, dataSource: DataSource);
    create(createVentaDto: CreateVentaDto): Promise<Venta>;
    findAll(fecha?: string): Promise<Venta[]>;
    findPendientes(): Promise<Venta[]>;
    findOne(id: number): Promise<Venta>;
    registrarPago(id: number, registrarPagoDto: RegistrarPagoDto): Promise<Venta>;
    delete(id: number): Promise<{
        message: string;
        ventaEliminada: number;
    }>;
    deleteAll(): Promise<{
        message: string;
        ventasEliminadas: number;
    }>;
}
