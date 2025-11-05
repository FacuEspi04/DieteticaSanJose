import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
export declare class ClientesController {
    private readonly clientesService;
    constructor(clientesService: ClientesService);
    create(createClienteDto: CreateClienteDto): Promise<import("./cliente.entity").Cliente>;
    findAll(): Promise<import("./cliente.entity").Cliente[]>;
    findOne(id: number): Promise<import("./cliente.entity").Cliente>;
    update(id: number, updateClienteDto: UpdateClienteDto): Promise<import("./cliente.entity").Cliente>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
