import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository, Like } from 'typeorm';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto';
import { Articulo } from './articulo.entity';

@Injectable()
export class ArticulosService {
  constructor(
    @InjectRepository(Articulo)
    private readonly articuloRepository: Repository<Articulo>,
  ) {}

  create(createArticuloDto: CreateArticuloDto): Promise<Articulo> {
    const nuevoArticulo = this.articuloRepository.create(createArticuloDto);
    return this.articuloRepository.save(nuevoArticulo);
  }

  // --- CORRECCIÓN AQUÍ ---
  // Añadimos el parámetro opcional 'search'
  async findAll(search?: string): Promise<Articulo[]> {
    if (search) {
      // Si hay término de búsqueda, filtramos por él
      return this.articuloRepository.find({
        where: [
          { nombre: Like(`%${search}%`) },
          { marca: Like(`%${search}%`) },
          { codigo_barras: Like(`%${search}%`) },
        ],
        order: { nombre: 'ASC' },
      });
    }
    // Si no hay término de búsqueda, devolvemos todo
    return this.articuloRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Articulo> {
    const articulo = await this.articuloRepository.findOneBy({ id });
    if (!articulo) {
      throw new NotFoundException(`Artículo con ID #${id} no encontrado.`);
    }
    return articulo;
  }

  async update(
    id: number,
    updateArticuloDto: UpdateArticuloDto,
  ): Promise<Articulo> {
    const articulo = await this.articuloRepository.preload({
      id,
      ...updateArticuloDto,
    });

    if (!articulo) {
      throw new NotFoundException(`Artículo con ID #${id} no encontrado.`);
    }

    return this.articuloRepository.save(articulo);
  }

  async remove(id: number) {
    const articulo = await this.findOne(id);
    await this.articuloRepository.remove(articulo);
    return { message: `Artículo con ID #${id} eliminado.` };
  }
}

