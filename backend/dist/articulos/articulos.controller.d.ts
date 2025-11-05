import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
export declare class ArticulosController {
    private readonly articulosService;
    constructor(articulosService: ArticulosService);
    create(createArticuloDto: CreateArticuloDto): Promise<import("./articulo.entity").Articulo>;
    findAll(searchTerm?: string): Promise<import("./articulo.entity").Articulo[]>;
    findOne(id: number): Promise<import("./articulo.entity").Articulo>;
    update(id: number, updateArticuloDto: UpdateArticuloDto): Promise<import("./articulo.entity").Articulo>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
