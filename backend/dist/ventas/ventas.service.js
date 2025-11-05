"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VentasService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VentasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const articulo_entity_1 = require("../articulos/articulo.entity");
const cliente_entity_1 = require("../clientes/cliente.entity");
const turnos_util_1 = require("../common/turnos.util");
const typeorm_2 = require("typeorm");
const venta_detalle_entity_1 = require("./venta-detalle.entity");
const venta_entity_1 = require("./venta.entity");
let VentasService = VentasService_1 = class VentasService {
    ventaRepository;
    detalleRepository;
    articuloRepository;
    clienteRepository;
    dataSource;
    logger = new common_1.Logger(VentasService_1.name);
    constructor(ventaRepository, detalleRepository, articuloRepository, clienteRepository, dataSource) {
        this.ventaRepository = ventaRepository;
        this.detalleRepository = detalleRepository;
        this.articuloRepository = articuloRepository;
        this.clienteRepository = clienteRepository;
        this.dataSource = dataSource;
    }
    async create(createVentaDto) {
        const { clienteId, clienteNombre, items, formaPago, interes, estado } = createVentaDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let subtotalVenta = 0;
            let totalVenta = 0;
            const detallesVenta = [];
            const [maxResult] = await queryRunner.manager.query('SELECT MAX("numeroVenta") as maxNum FROM ventas');
            const siguienteNumeroVenta = (Number(maxResult?.maxNum) || 0) + 1;
            if (estado === venta_entity_1.VentaEstado.PENDIENTE && !clienteId && !clienteNombre) {
                throw new Error('El nombre del cliente o el ID del cliente es obligatorio para cuentas corrientes.');
            }
            for (const itemDto of items) {
                const articulo = await queryRunner.manager.findOne(articulo_entity_1.Articulo, {
                    where: { id: itemDto.articuloId },
                });
                if (!articulo) {
                    throw new common_1.NotFoundException(`Artículo con ID #${itemDto.articuloId} no encontrado.`);
                }
                if (articulo.stock < itemDto.cantidad) {
                    throw new Error(`Stock insuficiente para "${articulo.nombre}". Stock actual: ${articulo.stock}, se solicitan: ${itemDto.cantidad}.`);
                }
                articulo.stock -= itemDto.cantidad;
                await queryRunner.manager.save(articulo_entity_1.Articulo, articulo);
                const precioUnitario = Number(articulo.precio);
                const subtotalItem = precioUnitario * itemDto.cantidad;
                subtotalVenta += subtotalItem;
                const detalle = new venta_detalle_entity_1.VentaDetalle();
                detalle.articuloId = itemDto.articuloId;
                detalle.cantidad = itemDto.cantidad;
                detalle.precioUnitario = precioUnitario;
                detalle.subtotal = subtotalItem;
                detallesVenta.push(detalle);
            }
            const interesCalculado = interes || 0;
            totalVenta = subtotalVenta + interesCalculado;
            const ahora = new Date();
            const nuevaVenta = new venta_entity_1.Venta();
            nuevaVenta.numeroVenta = siguienteNumeroVenta;
            nuevaVenta.fechaHora = ahora;
            nuevaVenta.clienteId = clienteId || null;
            nuevaVenta.clienteNombre = clienteNombre || 'Cliente General';
            nuevaVenta.subtotal = subtotalVenta;
            nuevaVenta.interes = interesCalculado;
            nuevaVenta.total = totalVenta;
            nuevaVenta.formaPago =
                estado === venta_entity_1.VentaEstado.COMPLETADA ? formaPago : null;
            nuevaVenta.estado = estado;
            nuevaVenta.turno = (0, turnos_util_1.determinarTurno)(ahora);
            const ventaGuardada = await queryRunner.manager.save(venta_entity_1.Venta, nuevaVenta);
            for (const detalle of detallesVenta) {
                detalle.venta = ventaGuardada;
                await queryRunner.manager.save(venta_detalle_entity_1.VentaDetalle, detalle);
            }
            await queryRunner.commitTransaction();
            this.logger.log(`Venta #${ventaGuardada.numeroVenta} creada exitosamente.`);
            return this.findOne(ventaGuardada.id);
        }
        catch (err) {
            this.logger.error(`Error al crear la venta: ${err.message}`);
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(fecha) {
        const where = {};
        if (fecha) {
            const fechaInicio = new Date(`${fecha}T00:00:00`);
            const fechaFin = new Date(`${fecha}T23:59:59`);
            where.fechaHora = (0, typeorm_2.Between)(fechaInicio, fechaFin);
        }
        return this.ventaRepository.find({
            where,
            relations: ['cliente', 'items', 'items.articulo'],
            order: { fechaHora: 'DESC' },
        });
    }
    async findPendientes() {
        return this.ventaRepository.find({
            where: { estado: venta_entity_1.VentaEstado.PENDIENTE },
            relations: ['items', 'items.articulo', 'cliente'],
            order: { fechaHora: 'ASC' },
        });
    }
    async findOne(id) {
        const venta = await this.ventaRepository.findOne({
            where: { id },
            relations: ['items', 'items.articulo', 'cliente'],
        });
        if (!venta) {
            throw new common_1.NotFoundException(`Venta con ID #${id} no encontrada.`);
        }
        return venta;
    }
    async registrarPago(id, registrarPagoDto) {
        const { formaPago, interes } = registrarPagoDto;
        const venta = await this.ventaRepository.findOneBy({ id });
        if (!venta) {
            throw new common_1.NotFoundException(`Venta con ID #${id} no encontrada.`);
        }
        if (venta.estado !== venta_entity_1.VentaEstado.PENDIENTE) {
            throw new Error('Esta venta no está pendiente de pago.');
        }
        const ahora = new Date();
        const interesCalculado = interes || 0;
        const totalActualizado = venta.subtotal + interesCalculado;
        venta.estado = venta_entity_1.VentaEstado.COMPLETADA;
        venta.formaPago = formaPago;
        venta.interes = interesCalculado;
        venta.total = totalActualizado;
        venta.fechaHora = ahora;
        venta.turno = (0, turnos_util_1.determinarTurno)(ahora);
        this.logger.log(`Pago registrado para Venta #${venta.numeroVenta}. Nuevo estado: ${venta.estado}`);
        return this.ventaRepository.save(venta);
    }
    async delete(id) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const venta = await queryRunner.manager.findOne(venta_entity_1.Venta, {
                where: { id },
                relations: ['items'],
            });
            if (!venta) {
                throw new common_1.NotFoundException(`Venta con ID #${id} no encontrada.`);
            }
            if (venta.estado === venta_entity_1.VentaEstado.COMPLETADA ||
                venta.estado === venta_entity_1.VentaEstado.PENDIENTE) {
                for (const item of venta.items) {
                    await queryRunner.manager.increment(articulo_entity_1.Articulo, { id: item.articuloId }, 'stock', item.cantidad);
                    this.logger.log(`Stock devuelto: ${item.cantidad} a Artículo ID #${item.articuloId}`);
                }
            }
            await queryRunner.manager.delete(venta_entity_1.Venta, { id });
            await queryRunner.commitTransaction();
            this.logger.warn(`Venta #${venta.numeroVenta} eliminada permanentemente.`);
            return {
                message: `Venta #${venta.numeroVenta} eliminada exitosamente`,
                ventaEliminada: venta.numeroVenta,
            };
        }
        catch (err) {
            this.logger.error(`Error al eliminar la venta: ${err.message}`);
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deleteAll() {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const ventas = await queryRunner.manager.find(venta_entity_1.Venta, {
                relations: ['items'],
            });
            for (const venta of ventas) {
                if (venta.estado === venta_entity_1.VentaEstado.COMPLETADA ||
                    venta.estado === venta_entity_1.VentaEstado.PENDIENTE) {
                    for (const item of venta.items) {
                        await queryRunner.manager.increment(articulo_entity_1.Articulo, { id: item.articuloId }, 'stock', item.cantidad);
                        this.logger.log(`Stock restaurado: ${item.cantidad} a Artículo ID #${item.articuloId}`);
                    }
                }
            }
            await queryRunner.manager.delete(venta_detalle_entity_1.VentaDetalle, {});
            const result = await queryRunner.manager.delete(venta_entity_1.Venta, {});
            await queryRunner.manager.query(`DELETE FROM sqlite_sequence WHERE name = 'ventas'`);
            await queryRunner.manager.query(`DELETE FROM sqlite_sequence WHERE name = 'venta_detalles'`);
            await queryRunner.commitTransaction();
            const cantidadEliminada = result.affected || 0;
            this.logger.warn(`Se eliminaron ${cantidadEliminada} ventas de prueba.`);
            return {
                message: 'Todas las ventas fueron eliminadas exitosamente',
                ventasEliminadas: cantidadEliminada,
            };
        }
        catch (err) {
            this.logger.error(`Error al eliminar ventas: ${err.message}`);
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.VentasService = VentasService;
exports.VentasService = VentasService = VentasService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(venta_entity_1.Venta)),
    __param(1, (0, typeorm_1.InjectRepository)(venta_detalle_entity_1.VentaDetalle)),
    __param(2, (0, typeorm_1.InjectRepository)(articulo_entity_1.Articulo)),
    __param(3, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], VentasService);
//# sourceMappingURL=ventas.service.js.map