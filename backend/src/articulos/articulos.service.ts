import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { Categoria } from 'src/categorias/categoria.entity';
import { Marca } from 'src/marcas/marca.entity';
import { Articulo } from './articulo.entity';


@Injectable()
export class ArticulosService {
  constructor(
    @InjectRepository(Articulo)
    private readonly articuloRepository: Repository<Articulo>,
  ) {}

  // Modificado para 'marcaId' y 'categoriaId'
  create(createArticuloDto: CreateArticuloDto): Promise<Articulo> {
    const { categoriaId, marcaId, ...rest } = createArticuloDto;

    const nuevoArticulo = this.articuloRepository.create({
      ...rest,
      // Asignar relaciones por ID
      categoria: { id: categoriaId },
      marca: marcaId ? { id: marcaId } : null,
    });
    return this.articuloRepository.save(nuevoArticulo);
  }

  // Modificado para 'marcaId' y 'eager' relations
  async findAll(search?: string): Promise<Articulo[]> {
    const options: FindOptionsWhere<Articulo>[] = [];
    
    if (search) {
      const likeQuery = Like(`%${search}%`);
      options.push(
        { nombre: likeQuery },
        { codigo_barras: likeQuery },
        // Nueva búsqueda por nombre de marca
        { marca: { nombre: likeQuery } }, 
        // También por nombre de categoría
        { categoria: { nombre: likeQuery } } 
      );
    }

    return this.articuloRepository.find({
      // 'relations' es redundante si 'eager: true' está en la entidad,
      // pero lo dejamos para ser explícitos.
      where: options.length > 0 ? options : undefined,
      relations: ['categoria', 'marca'], 
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Articulo> {
    const articulo = await this.articuloRepository.findOne({ 
      where: { id },
      relations: ['categoria', 'marca'],
    });
    if (!articulo) {
      throw new NotFoundException(`Artículo con ID #${id} no encontrado.`);
    }
    return articulo;
  }

  // Modificado para 'marcaId' y 'categoriaId' usando 'merge'
  async update(
    id: number,
    updateArticuloDto: UpdateArticuloDto,
  ): Promise<Articulo> {
    
    // 1. Buscamos el artículo primero por su ID.
    const articulo = await this.articuloRepository.findOneBy({ id });

    // 2. Si no lo encuentra, lanzamos el 404.
    if (!articulo) {
      throw new NotFoundException(`Artículo con ID #${id} no encontrado.`);
    }

    const { categoriaId, marcaId, ...rest } = updateArticuloDto;

    // 3. Fusionamos los datos simples (nombre, precio, stock, etc.)
    this.articuloRepository.merge(articulo, rest);

    // 4. Asignamos las relaciones manualmente si vienen en el DTO
    if (categoriaId) {
      articulo.categoria = { id: categoriaId } as Categoria;
    }
    if (marcaId) {
      articulo.marca = { id: marcaId } as Marca;
    } else if (updateArticuloDto.hasOwnProperty('marcaId')) {
      // Si el DTO envió 'marcaId: null'
      articulo.marca = null;
    }

    // 5. Guardamos la entidad ya fusionada.
    return this.articuloRepository.save(articulo);
  }

  async remove(id: number) {
    const articulo = await this.findOne(id);
    await this.articuloRepository.remove(articulo);
    return { message: `Artículo con ID #${id} eliminado.` };
  }
}

