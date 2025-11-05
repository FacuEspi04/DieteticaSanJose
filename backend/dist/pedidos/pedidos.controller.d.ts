import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
export declare class PedidosController {
    private readonly pedidosService;
    constructor(pedidosService: PedidosService);
    create(createPedidoDto: CreatePedidoDto): Promise<import("./pedido.entity").Pedido>;
    findAll(proveedorId?: string, desde?: string, hasta?: string): Promise<import("./pedido.entity").Pedido[]>;
    findOne(id: number): Promise<import("./pedido.entity").Pedido>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
