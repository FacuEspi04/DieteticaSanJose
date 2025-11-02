import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';

import { CreatePedidoDto } from './dto/create-pedido.dto';
import { Articulo } from 'src/articulos/articulo.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Pedido } from './pedido.entity';
// --- CORRECCIÓN EN RUTAS DE IMPORT ---


@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,
    @InjectRepository(Articulo) // Necesitamos esto para buscar precios
    private readonly articuloRepository: Repository<Articulo>,
    private readonly dataSource: DataSource, // Para transacciones
  ) {}

  async create(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { proveedorId, notas, items } = createPedidoDto;

    // 1. Iniciar una transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalPedido = 0;
      const detallesPedido: PedidoDetalle[] = [];

      // 2. Procesar cada ítem
      for (const itemDto of items) {
        const articulo = await this.articuloRepository.findOneBy({
          id: itemDto.articuloId,
        });
        if (!articulo) {
          throw new NotFoundException(
            `Artículo con ID #${itemDto.articuloId} no encontrado.`,
          );
        }

        const precioUnitario = Number(articulo.precio); // Usamos el precio de VENTA (como en tu front)
        const subtotal = precioUnitario * itemDto.cantidad;
        totalPedido += subtotal;

        const detalle = new PedidoDetalle();
        detalle.articuloId = itemDto.articuloId;
        detalle.cantidad = itemDto.cantidad;
        detalle.precioUnitario = precioUnitario;
        detalle.subtotal = subtotal;

        detallesPedido.push(detalle);
      }

      // 3. Crear el Pedido principal
      const pedido = new Pedido();
      pedido.proveedorId = proveedorId;

      // --- AQUÍ ESTÁ LA CORRECCIÓN ---
      // Si notas es 'undefined' o un string vacío, guardamos 'null'
      pedido.notas = notas || null;

      pedido.fechaPedido = new Date();
      pedido.total = totalPedido;
      pedido.estado = 'Pendiente';

      const pedidoGuardado = await queryRunner.manager.save(pedido);

      // 4. Asignar el ID del pedido a los detalles y guardarlos
      for (const detalle of detallesPedido) {
        detalle.pedidoId = pedidoGuardado.id;
        await queryRunner.manager.save(detalle);
      }

      // 5. Confirmar la transacción
      await queryRunner.commitTransaction();

      // 6. Devolver el pedido completo (TypeORM no lo hace fácil post-transacción)
      // Así que lo volvemos a buscar con todas sus relaciones
      return this.findOne(pedidoGuardado.id);
    } catch (err) {
      // 7. Revertir en caso de error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // 8. Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async findAll(
    proveedorId?: number,
    desde?: string,
    hasta?: string,
  ): Promise<Pedido[]> {
    const where: FindOptionsWhere<Pedido> = {};

    if (proveedorId) {
      where.proveedorId = proveedorId;
    }
    if (desde) {
      // Ajustamos la fecha 'desde' para que incluya todo el día (desde 00:00:00)
      const fechaDesde = new Date(desde);
      fechaDesde.setUTCHours(0, 0, 0, 0);
      where.fechaPedido = MoreThanOrEqual(fechaDesde);
    }
    if (hasta) {
      // Ajustamos la fecha 'hasta' para que incluya todo el día (hasta 23:59:59)
      const fechaHasta = new Date(hasta);
      fechaHasta.setUTCHours(23, 59, 59, 999);
      where.fechaPedido = LessThanOrEqual(fechaHasta);
    }

    // Buscamos y ordenamos, cargando las relaciones necesarias
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
}
