import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Articulo } from 'src/articulos/articulo.entity';
import { Cliente } from 'src/clientes/cliente.entity';
import { determinarTurno } from 'src/common/turnos.util';
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Between,
} from 'typeorm';
import { CreateVentaDto, RegistrarPagoDto } from './dto/venta.dto';
import { VentaDetalle } from './venta-detalle.entity';
import { Venta, VentaEstado } from './venta.entity';

@Injectable()
export class VentasService {
  private readonly logger = new Logger(VentasService.name);

  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(VentaDetalle)
    private readonly detalleRepository: Repository<VentaDetalle>,
    @InjectRepository(Articulo)
    private readonly articuloRepository: Repository<Articulo>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea una nueva venta. Esta es una operación transaccional.
   * Descuenta el stock de los artículos.
   */
  async create(createVentaDto: CreateVentaDto): Promise<Venta> {
    const { clienteId, clienteNombre, items, formaPago, interes, estado } =
      createVentaDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subtotalVenta = 0;
      let totalVenta = 0;
      const detallesVenta: VentaDetalle[] = [];

      // 1. OBTENER EL SIGUIENTE NUMERO DE VENTA
      // CAMBIO: Quitado "FOR UPDATE" (no es compatible con SQLite en un MAX).
      // La transacción en SQLite bloquea el archivo, lo que previene "race conditions".
      // CAMBIO: Añadidas comillas dobles a "numeroVenta"
      const [maxResult] = await queryRunner.manager.query(
        'SELECT MAX("numeroVenta") as maxNum FROM ventas',
      );
      // Corregido: Forzar conversión a Número
      const siguienteNumeroVenta = (Number(maxResult?.maxNum) || 0) + 1;

      // 2. Validar cliente
      if (estado === VentaEstado.PENDIENTE && !clienteId && !clienteNombre) {
        throw new Error(
          'El nombre del cliente o el ID del cliente es obligatorio para cuentas corrientes.',
        );
      }

      // 3. Procesar artículos y descontar stock
      for (const itemDto of items) {
        // CAMBIO: Quitado el lock "pessimistic_write" (no soportado por SQLite).
        // La transacción ya está bloqueando la base de datos.
        const articulo = await queryRunner.manager.findOne(Articulo, {
          where: { id: itemDto.articuloId },
          // lock: { mode: 'pessimistic_write' },  <-- CAMBIO: LÍNEA ELIMINADA
        });

        if (!articulo) {
          throw new NotFoundException(
            `Artículo con ID #${itemDto.articuloId} no encontrado.`,
          );
        }
        if (articulo.stock < itemDto.cantidad) {
          throw new Error(
            `Stock insuficiente para "${articulo.nombre}". Stock actual: ${articulo.stock}, se solicitan: ${itemDto.cantidad}.`,
          );
        }

        articulo.stock -= itemDto.cantidad;
        await queryRunner.manager.save(Articulo, articulo);

        const precioUnitario = Number(articulo.precio);
        const subtotalItem = precioUnitario * itemDto.cantidad;
        subtotalVenta += subtotalItem;

        const detalle = new VentaDetalle();
        detalle.articuloId = itemDto.articuloId;
        detalle.cantidad = itemDto.cantidad;
        detalle.precioUnitario = precioUnitario;
        detalle.subtotal = subtotalItem;
        detallesVenta.push(detalle);
      }

      // 4. Calcular totales finales
      const interesCalculado = interes || 0;
      totalVenta = subtotalVenta + interesCalculado;
      const ahora = new Date();

      // 5. Crear la Venta principal
      const nuevaVenta = new Venta();
      nuevaVenta.numeroVenta = siguienteNumeroVenta;
      nuevaVenta.fechaHora = ahora;
      nuevaVenta.clienteId = clienteId || null;
      nuevaVenta.clienteNombre = clienteNombre || 'Cliente General';
      nuevaVenta.subtotal = subtotalVenta;
      nuevaVenta.interes = interesCalculado;
      nuevaVenta.total = totalVenta;
      nuevaVenta.formaPago =
        estado === VentaEstado.COMPLETADA ? formaPago : null;
      nuevaVenta.estado = estado;
      nuevaVenta.turno = determinarTurno(ahora); // Usamos la utilidad importada

      const ventaGuardada = await queryRunner.manager.save(Venta, nuevaVenta);

      // 6. Asignar la VENTA completa al detalle y guardarlos
      for (const detalle of detallesVenta) {
        detalle.venta = ventaGuardada; // Corregido: Asignar el objeto
        await queryRunner.manager.save(VentaDetalle, detalle);
      }

      // 7. Confirmar transacción
      await queryRunner.commitTransaction();

      this.logger.log(`Venta #${ventaGuardada.numeroVenta} creada exitosamente.`);
      return this.findOne(ventaGuardada.id); // Devolver con relaciones
    } catch (err) {
      this.logger.error(`Error al crear la venta: ${err.message}`);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Busca todas las ventas, opcionalmente filtradas por fecha.
   */
  async findAll(fecha?: string): Promise<Venta[]> {
    const where: FindOptionsWhere<Venta> | FindOptionsWhere<Venta>[] = {};

    if (fecha) {
      // Corregido: Filtro de zona horaria
      const fechaInicio = new Date(`${fecha}T00:00:00`); // Local
      const fechaFin = new Date(`${fecha}T23:59:59`); // Local
      where.fechaHora = Between(fechaInicio, fechaFin);
    }

    return this.ventaRepository.find({
      where,
      relations: ['cliente', 'items', 'items.articulo'],
      order: { fechaHora: 'DESC' },
    });
  }

  /**
   * Busca todas las ventas con estado "Pendiente" (Cuentas Corrientes).
   */
  async findPendientes(): Promise<Venta[]> {
    return this.ventaRepository.find({
      where: { estado: VentaEstado.PENDIENTE },
      relations: ['items', 'items.articulo', 'cliente'],
      order: { fechaHora: 'ASC' },
    });
  }

  /**
   * Busca una venta específica por ID, cargando sus relaciones.
   */
  async findOne(id: number): Promise<Venta> {
    const venta = await this.ventaRepository.findOne({
      where: { id },
      relations: ['items', 'items.articulo', 'cliente'],
    });
    if (!venta) {
      throw new NotFoundException(`Venta con ID #${id} no encontrada.`);
    }
    return venta;
  }

  /**
   * Registra el pago de una venta pendiente (Cuenta Corriente).
   */
  async registrarPago(
    id: number,
    registrarPagoDto: RegistrarPagoDto,
  ): Promise<Venta> {
    const { formaPago, interes } = registrarPagoDto;

    const venta = await this.ventaRepository.findOneBy({ id });
    if (!venta) {
      throw new NotFoundException(`Venta con ID #${id} no encontrada.`);
    }

    if (venta.estado !== VentaEstado.PENDIENTE) {
      throw new Error('Esta venta no está pendiente de pago.');
    }

    const ahora = new Date();
    const interesCalculado = interes || 0;
    const totalActualizado = venta.subtotal + interesCalculado;

    venta.estado = VentaEstado.COMPLETADA;
    venta.formaPago = formaPago;
    venta.interes = interesCalculado;
    venta.total = totalActualizado;
    venta.fechaHora = ahora;
    venta.turno = determinarTurno(ahora); // Usamos la utilidad importada

    this.logger.log(
      `Pago registrado para Venta #${venta.numeroVenta}. Nuevo estado: ${venta.estado}`,
    );
    return this.ventaRepository.save(venta);
  }

  /**
   * Elimina una venta específica de forma permanente (HARD DELETE).
   * Restaura el stock de los artículos vendidos.
   */
  async delete(id: number): Promise<{ message: string; ventaEliminada: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venta = await queryRunner.manager.findOne(Venta, {
        where: { id },
        relations: ['items'],
      });

      if (!venta) {
        throw new NotFoundException(`Venta con ID #${id} no encontrada.`);
      }

      if (
        venta.estado === VentaEstado.COMPLETADA ||
        venta.estado === VentaEstado.PENDIENTE
      ) {
        // 1. Devolver el stock
        for (const item of venta.items) {
          await queryRunner.manager.increment(
            Articulo,
            { id: item.articuloId },
            'stock',
            item.cantidad,
          );
          this.logger.log(
            `Stock devuelto: ${item.cantidad} a Artículo ID #${item.articuloId}`,
          );
        }
      }

      // 2. Eliminar los detalles de la venta (ya se eliminan por 'onDelete: CASCADE')
      // await queryRunner.manager.delete(VentaDetalle, { venta: { id } });

      // 3. Eliminar la venta
      await queryRunner.manager.delete(Venta, { id });

      await queryRunner.commitTransaction();

      this.logger.warn(`Venta #${venta.numeroVenta} eliminada permanentemente.`);

      return {
        message: `Venta #${venta.numeroVenta} eliminada exitosamente`,
        ventaEliminada: venta.numeroVenta,
      };
    } catch (err) {
      this.logger.error(`Error al eliminar la venta: ${err.message}`);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // --- MÉTODO 'deleteAll' AÑADIDO DE VUELTA ---
  /**
   * Elimina todas las ventas y sus detalles (SOLO PARA DESARROLLO).
   * Restaura el stock de los artículos vendidos.
   */
  async deleteAll(): Promise<{ message: string; ventasEliminadas: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Obtener todas las ventas con sus items
      const ventas = await queryRunner.manager.find(Venta, {
        relations: ['items'],
      });

      // 2. Devolver el stock
      for (const venta of ventas) {
        if (
          venta.estado === VentaEstado.COMPLETADA ||
          venta.estado === VentaEstado.PENDIENTE
        ) {
          for (const item of venta.items) {
            await queryRunner.manager.increment(
              Articulo,
              { id: item.articuloId },
              'stock',
              item.cantidad,
            );
            this.logger.log(
              `Stock restaurado: ${item.cantidad} a Artículo ID #${item.articuloId}`,
            );
          }
        }
      }

      // 3. Eliminar todos los detalles
      await queryRunner.manager.delete(VentaDetalle, {});

      // 4. Eliminar todas las ventas
      const result = await queryRunner.manager.delete(Venta, {});

      // 5. Resetear el autoincrement (CAMBIO: Comando para SQLite)
      // SQLite usa la tabla 'sqlite_sequence' para los autoincrement
      await queryRunner.manager.query(
        `DELETE FROM sqlite_sequence WHERE name = 'ventas'`,
      );
      await queryRunner.manager.query(
        `DELETE FROM sqlite_sequence WHERE name = 'venta_detalles'`,
      );

      await queryRunner.commitTransaction();

      const cantidadEliminada = result.affected || 0;
      this.logger.warn(`Se eliminaron ${cantidadEliminada} ventas de prueba.`);

      return {
        message: 'Todas las ventas fueron eliminadas exitosamente',
        ventasEliminadas: cantidadEliminada,
      };
    } catch (err) {
      this.logger.error(`Error al eliminar ventas: ${err.message}`);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

