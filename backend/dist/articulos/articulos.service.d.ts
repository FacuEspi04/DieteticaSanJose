import { Repository } from 'typeorm';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { Articulo } from './articulo.entity';
export declare class ArticulosService {
    private readonly articuloRepository;
    constructor(articuloRepository: Repository<Articulo>);
    create(createArticuloDto: CreateArticuloDto): Promise<Articulo>;
    findAll(search?: string): Promise<Articulo[]>;
    findOne(id: number): Promise<Articulo>;
    update(id: number, updateArticuloDto: UpdateArticuloDto): Promise<Articulo>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
