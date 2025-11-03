import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { CreateRetiroDto } from './dto/create-retiro.dto';
import { Retiro } from './retiro.entity';
import { determinarTurno } from 'src/common/turnos.util';
 // Importamos la utilidad

@Injectable()
export class RetirosService {
  private readonly logger = new Logger(RetirosService.name);

  constructor(
    @InjectRepository(Retiro)
    private readonly retiroRepository: Repository<Retiro>,
  ) {}

  /**
   * Crea un nuevo registro de retiro de caja.
   */
  async create(createRetiroDto: CreateRetiroDto): Promise<Retiro> {
    const ahora = new Date();
    
    const nuevoRetiro = this.retiroRepository.create({
      ...createRetiroDto,
      fechaHora: ahora,
      turno: determinarTurno(ahora), // Asignamos el turno automáticamente
    });

    const retiroGuardado = await this.retiroRepository.save(nuevoRetiro);
    this.logger.log(`Retiro de $${retiroGuardado.monto} registrado exitosamente.`);
    return retiroGuardado;
  }

  /**
   * Busca todos los retiros, opcionalmente filtrados por fecha.
   */
  async findAll(fecha?: string): Promise<Retiro[]> {
    const where: FindOptionsWhere<Retiro> | FindOptionsWhere<Retiro>[] = {};

    if (fecha) {
      // Usamos la misma lógica de filtro de fecha que en Ventas
      const fechaInicio = new Date(`${fecha}T00:00:00`); // 00:00:00 Local
      const fechaFin = new Date(`${fecha}T23:59:59`); // 23:59:59 Local
      where.fechaHora = Between(fechaInicio, fechaFin);
    }

    return this.retiroRepository.find({
      where,
      order: { fechaHora: 'DESC' },
    });
  }
}

