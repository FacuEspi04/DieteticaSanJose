import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
export declare class MarcasController {
    private readonly marcasService;
    constructor(marcasService: MarcasService);
    create(createMarcaDto: CreateMarcaDto): Promise<import("./marca.entity").Marca>;
    findAll(): Promise<import("./marca.entity").Marca[]>;
    findOne(id: number): Promise<import("./marca.entity").Marca>;
}
