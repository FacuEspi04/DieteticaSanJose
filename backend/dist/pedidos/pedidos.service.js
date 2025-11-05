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
var PedidosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const articulo_entity_1 = require("../articulos/articulo.entity");
const pedido_detalle_entity_1 = require("./pedido-detalle.entity");
const pedido_entity_1 = require("./pedido.entity");
let PedidosService = PedidosService_1 = class PedidosService {
    pedidoRepository;
    detalleRepository;
    articuloRepository;
    dataSource;
    logger = new common_1.Logger(PedidosService_1.name);
    constructor(pedidoRepository, detalleRepository, articuloRepository, dataSource) {
        this.pedidoRepository = pedidoRepository;
        this.detalleRepository = detalleRepository;
        this.articuloRepository = articuloRepository;
        this.dataSource = dataSource;
    }
    async create(createPedidoDto) {
        const { proveedorId, notas, items } = createPedidoDto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let totalPedido = 0;
            const detallesPedido = [];
            for (const itemDto of items) {
                const articulo = await this.articuloRepository.findOneBy({
                    id: itemDto.articuloId,
                });
                if (!articulo) {
                    throw new common_1.NotFoundException(`Artículo con ID #${itemDto.articuloId} no encontrado.`);
                }
                const precioUnitario = Number(articulo.precio);
                const subtotal = precioUnitario * itemDto.cantidad;
                totalPedido += subtotal;
                const detalle = new pedido_detalle_entity_1.PedidoDetalle();
                detalle.articuloId = itemDto.articuloId;
                detalle.cantidad = itemDto.cantidad;
                detalle.precioUnitario = precioUnitario;
                detalle.subtotal = subtotal;
                detallesPedido.push(detalle);
            }
            const pedido = new pedido_entity_1.Pedido();
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
        }
        catch (err) {
            this.logger.error(`Error al crear el pedido: ${err.message}`, err.stack);
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(proveedorId, desde, hasta) {
        const where = {};
        if (proveedorId) {
            where.proveedorId = proveedorId;
        }
        if (desde && hasta) {
            const fechaInicio = new Date(`${desde}T00:00:00`);
            const fechaFin = new Date(`${hasta}T23:59:59`);
            where.fechaPedido = (0, typeorm_2.Between)(fechaInicio, fechaFin);
        }
        else if (desde) {
            const fechaInicio = new Date(`${desde}T00:00:00`);
            where.fechaPedido = (0, typeorm_2.MoreThanOrEqual)(fechaInicio);
        }
        else if (hasta) {
            const fechaFin = new Date(`${hasta}T23:59:59`);
            where.fechaPedido = (0, typeorm_2.LessThanOrEqual)(fechaFin);
        }
        return this.pedidoRepository.find({
            where,
            relations: ['proveedor', 'items', 'items.articulo'],
            order: { fechaPedido: 'DESC' },
        });
    }
    async findOne(id) {
        const pedido = await this.pedidoRepository.findOne({
            where: { id },
            relations: ['proveedor', 'items', 'items.articulo'],
        });
        if (!pedido) {
            throw new common_1.NotFoundException(`Pedido con ID #${id} no encontrado.`);
        }
        return pedido;
    }
    async remove(id) {
        const pedido = await this.findOne(id);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.delete(pedido_detalle_entity_1.PedidoDetalle, { pedidoId: id });
            await queryRunner.manager.delete(pedido_entity_1.Pedido, { id: id });
            await queryRunner.commitTransaction();
            this.logger.warn(`Pedido #${pedido.id} (Proveedor: ${pedido.proveedor.nombre}) eliminado permanentemente.`);
            return { message: `Pedido #${pedido.id} eliminado exitosamente` };
        }
        catch (err) {
            this.logger.error(`Error al eliminar el pedido: ${err.message}`, err.stack);
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.PedidosService = PedidosService;
exports.PedidosService = PedidosService = PedidosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pedido_entity_1.Pedido)),
    __param(1, (0, typeorm_1.InjectRepository)(pedido_detalle_entity_1.PedidoDetalle)),
    __param(2, (0, typeorm_1.InjectRepository)(articulo_entity_1.Articulo)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], PedidosService);
//# sourceMappingURL=pedidos.service.js.map