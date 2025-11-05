import { Repository } from 'typeorm';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { Marca } from './marca.entity';
export declare class MarcasService {
    private readonly marcaRepository;
    constructor(marcaRepository: Repository<Marca>);
    create(createMarcaDto: CreateMarcaDto): Promise<Marca>;
    findAll(): Promise<Marca[]>;
    findOne(id: number): Promise<Marca>;
}
