import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
export declare class CategoriasController {
    private readonly categoriasService;
    constructor(categoriasService: CategoriasService);
    create(createCategoriaDto: CreateCategoriaDto): Promise<import("./categoria.entity").Categoria>;
    findAll(): Promise<import("./categoria.entity").Categoria[]>;
    findOne(id: number): Promise<import("./categoria.entity").Categoria>;
    update(id: number, updateCategoriaDto: UpdateCategoriaDto): Promise<import("./categoria.entity").Categoria>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
