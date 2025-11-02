import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { Proveedor } from './proveedores.entity';

@Injectable()
export class ProveedoresService {
  constructor(
    @InjectRepository(Proveedor)
    private readonly proveedorRepository: Repository<Proveedor>,
  ) {}

  create(createProveedorDto: CreateProveedorDto): Promise<Proveedor> {
    const nuevoProveedor = this.proveedorRepository.create(createProveedorDto);
    return this.proveedorRepository.save(nuevoProveedor);
  }

  findAll(): Promise<Proveedor[]> {
    return this.proveedorRepository.find({ order: { nombre: 'ASC' } });
  }

  async findOne(id: number): Promise<Proveedor> {
    const proveedor = await this.proveedorRepository.findOneBy({ id });
    if (!proveedor) {
      throw new NotFoundException(`Proveedor con ID #${id} no encontrado.`);
    }
    return proveedor;
  }
}
