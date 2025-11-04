import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { Marca } from './marca.entity';


@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  create(createMarcaDto: CreateMarcaDto): Promise<Marca> {
    const nuevaMarca = this.marcaRepository.create(createMarcaDto);
    return this.marcaRepository.save(nuevaMarca);
  }

  findAll(): Promise<Marca[]> {
    return this.marcaRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<Marca> {
    const marca = await this.marcaRepository.findOneBy({ id });
    if (!marca) {
      throw new NotFoundException(`Marca con ID #${id} no encontrada.`);
    }
    return marca;
  }

  // (Opcional) Podemos añadir 'update' y 'remove' si los necesitas
}

