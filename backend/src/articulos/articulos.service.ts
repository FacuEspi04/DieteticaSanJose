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

  async findAll(search?: string): Promise<Articulo[]> {
    if (search) {
      return this.articuloRepository.find({
        where: [
          { nombre: Like(`%${search}%`) },
          { marca: Like(`%${search}%`) },
          { codigo_barras: Like(`%${search}%`) },
        ],
        order: { nombre: 'ASC' },
      });
    }
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

  // --- LÓGICA DE UPDATE CORREGIDA ---
  async update(
    id: number,
    updateArticuloDto: UpdateArticuloDto,
  ): Promise<Articulo> {
    
    // 1. Buscamos el artículo primero por su ID.
    const articulo = await this.articuloRepository.findOneBy({ id });

    // 2. Si no lo encuentra, lanzamos el 404.
    // (Si el 404 sigue ocurriendo, el error está aquí, 
    // lo que significaría que la DB o el ID están mal)
    if (!articulo) {
      throw new NotFoundException(`Artículo con ID #${id} no encontrado.`);
    }

    // 3. Si lo encuentra, fusionamos los datos del DTO en la entidad cargada.
    // Esto actualiza 'articulo' con los nuevos valores de 'updateArticuloDto'.
    this.articuloRepository.merge(articulo, updateArticuloDto);

    // 4. Guardamos la entidad ya fusionada.
    return this.articuloRepository.save(articulo);
  }
  // --- FIN DE LA CORRECCIÓN ---

  async remove(id: number) {
    const articulo = await this.findOne(id);
    await this.articuloRepository.remove(articulo);
    return { message: `Artículo con ID #${id} eliminado.` };
  }
}

