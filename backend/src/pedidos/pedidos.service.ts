import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Between,
} from 'typeorm';

import { CreatePedidoDto } from './dto/create-pedido.dto';
import { Articulo } from 'src/articulos/articulo.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Pedido } from './pedido.entity';


@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(PedidoDetalle)
    private readonly detalleRepository: Repository<PedidoDetalle>,
    @InjectRepository(Articulo)
    private readonly articuloRepository: Repository<Articulo>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { proveedorId, notas, items } = createPedidoDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalPedido = 0;
      const detallesPedido: PedidoDetalle[] = [];

      for (const itemDto of items) {
        const articulo = await this.articuloRepository.findOneBy({
          id: itemDto.articuloId,
        });
        if (!articulo) {
          throw new NotFoundException(
            `Artículo con ID #${itemDto.articuloId} no encontrado.`,
          );
        }

        const precioUnitario = Number(articulo.precio);
        const subtotal = precioUnitario * itemDto.cantidad;
        totalPedido += subtotal;

        const detalle = new PedidoDetalle();
        detalle.articuloId = itemDto.articuloId;
        detalle.cantidad = itemDto.cantidad;
        detalle.precioUnitario = precioUnitario;
        detalle.subtotal = subtotal;

        detallesPedido.push(detalle);
      }

      const pedido = new Pedido();
      pedido.proveedorId = proveedorId;
      pedido.notas = notas || null;
      pedido.fechaPedido = new Date();
      pedido.total = totalPedido;
      pedido.estado = 'Pendiente';

      const pedidoGuardado = await queryRunner.manager.save(pedido);

      for (const detalle of detallesPedido) {
        detalle.pedidoId = pedidoGuardado.id;
        await queryRunner.manager.save(detalle);
      }

      await queryRunner.commitTransaction();

      this.logger.log(`Pedido #${pedidoGuardado.id} creado exitosamente.`);
      return this.findOne(pedidoGuardado.id);
    } catch (err) {
      this.logger.error(`Error al crear el pedido: ${err.message}`, err.stack);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    proveedorId?: number,
    desde?: string,
    hasta?: string,
  ): Promise<Pedido[]> {
    const where: FindOptionsWhere<Pedido> | FindOptionsWhere<Pedido>[] = {};

    if (proveedorId) {
      where.proveedorId = proveedorId;
    }
    
    // --- ESTA ES LA LÍNEA CORREGIDA ---
    // Usamos 'desde' y 'hasta', no 'fecha'
    if (desde && hasta) {
      const fechaInicio = new Date(`${desde}T00:00:00`); // Local
      const fechaFin = new Date(`${hasta}T23:59:59`); // Local
      where.fechaPedido = Between(fechaInicio, fechaFin);
    } else if (desde) {
      const fechaInicio = new Date(`${desde}T00:00:00`); // Local
      where.fechaPedido = MoreThanOrEqual(fechaInicio);
    } else if (hasta) {
      const fechaFin = new Date(`${hasta}T23:59:59`); // Local
      where.fechaPedido = LessThanOrEqual(fechaFin);
    }
    // --- FIN DE LA CORRECCIÓN ---

    return this.pedidoRepository.find({
      where,
      relations: ['proveedor', 'items', 'items.articulo'],
      order: { fechaPedido: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: ['proveedor', 'items', 'items.articulo'],
    });
    if (!pedido) {
      throw new NotFoundException(`Pedido con ID #${id} no encontrado.`);
    }
    return pedido;
  }

  async remove(id: number): Promise<{ message: string }> {
    const pedido = await this.findOne(id); // findOne ya maneja el 404

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Eliminar detalles
      // Usamos el ID del pedido, no el objeto
      await queryRunner.manager.delete(PedidoDetalle, { pedidoId: id });
      
      // Eliminar pedido principal
      await queryRunner.manager.delete(Pedido, { id: id });

      await queryRunner.commitTransaction();
      
      this.logger.warn(`Pedido #${pedido.id} (Proveedor: ${pedido.proveedor.nombre}) eliminado permanentemente.`);
      
      return { message: `Pedido #${pedido.id} eliminado exitosamente` };

    } catch (err) {
      this.logger.error(`Error al eliminar el pedido: ${err.message}`, err.stack);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

