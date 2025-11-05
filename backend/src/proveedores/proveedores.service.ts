import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateProveedorDto } from './dto/create-proveedor.dto';
import { Proveedor } from './proveedores.entity';

// import { MysqlError } from 'mysql2'; // <-- 1. ELIMINAMOS ESTA LÍNEA INCORRECTA

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

async update(
    id: number,
    updateProveedorDto: CreateProveedorDto,
  ): Promise<Proveedor> {
    // findOne ya maneja la excepcióin Not Found
    const proveedor = await this.findOne(id);

    // Mezcla los datos del DTO con la entidad existente
    // Esto actualiza solo los campos que vienen en el DTO
    this.proveedorRepository.merge(proveedor, updateProveedorDto);

    // Guarda la entidad actualizada
    return this.proveedorRepository.save(proveedor);
  }
  // --- FIN DE AÑADIDO ---

  async remove(id: number): Promise<{ message: string }> {
    const proveedor = await this.findOne(id); // findOne ya maneja el 404

    try {
      // Intentar eliminar el proveedor
      await this.proveedorRepository.remove(proveedor);
      
      return { message: `Proveedor "${proveedor.nombre}" (ID: ${id}) eliminado.` };

    } catch (error) {
      // --- 2. CORRECCIÓN AQUÍ ---
      // Capturar el error y tratarlo como 'any' para acceder a 'code' y 'errno'
      const mysqlError = error as any; 
      
      // Error de MySQL 1451: Violación de Foreign Key
      // (ER_ROW_IS_REFERENCED_2 es común, 1451 es el número de error)
      if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2' || mysqlError.errno === 1451) {
        throw new ConflictException(
          `No se puede eliminar el proveedor "${proveedor.nombre}" porque ya tiene pedidos u otros registros asociados.`
        );
      }
      
      // Si es otro tipo de error, lanzarlo
      throw error;
    }
  }
}

