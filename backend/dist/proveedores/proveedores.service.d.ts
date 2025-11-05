import { Repository } from 'typeorm';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { Proveedor } from './proveedores.entity';
export declare class ProveedoresService {
    private readonly proveedorRepository;
    constructor(proveedorRepository: Repository<Proveedor>);
    create(createProveedorDto: CreateProveedorDto): Promise<Proveedor>;
    findAll(): Promise<Proveedor[]>;
    findOne(id: number): Promise<Proveedor>;
    update(id: number, updateProveedorDto: CreateProveedorDto): Promise<Proveedor>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
