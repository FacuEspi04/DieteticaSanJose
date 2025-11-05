import { DataSource, Repository } from 'typeorm';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { Articulo } from 'src/articulos/articulo.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Pedido } from './pedido.entity';
export declare class PedidosService {
    private readonly pedidoRepository;
    private readonly detalleRepository;
    private readonly articuloRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(pedidoRepository: Repository<Pedido>, detalleRepository: Repository<PedidoDetalle>, articuloRepository: Repository<Articulo>, dataSource: DataSource);
    create(createPedidoDto: CreatePedidoDto): Promise<Pedido>;
    findAll(proveedorId?: number, desde?: string, hasta?: string): Promise<Pedido[]>;
    findOne(id: number): Promise<Pedido>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
