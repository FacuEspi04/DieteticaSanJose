import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';
export declare class ProveedoresController {
    private readonly proveedoresService;
    constructor(proveedoresService: ProveedoresService);
    create(createProveedorDto: CreateProveedorDto): Promise<import("./proveedores.entity").Proveedor>;
    findAll(): Promise<import("./proveedores.entity").Proveedor[]>;
    findOne(id: number): Promise<import("./proveedores.entity").Proveedor>;
    update(id: number, updateProveedorDto: CreateProveedorDto): Promise<import("./proveedores.entity").Proveedor>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
