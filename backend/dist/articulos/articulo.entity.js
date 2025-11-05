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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Articulo = void 0;
const categoria_entity_1 = require("../categorias/categoria.entity");
const marca_entity_1 = require("../marcas/marca.entity");
const pedido_detalle_entity_1 = require("../pedidos/pedido-detalle.entity");
const venta_detalle_entity_1 = require("../ventas/venta-detalle.entity");
const typeorm_1 = require("typeorm");
let Articulo = class Articulo {
    id;
    nombre;
    codigo_barras;
    precio;
    stock;
    stock_minimo;
    categoriaId;
    categoria;
    marcaId;
    marca;
    activo;
    createdAt;
    updatedAt;
    itemsVenta;
    itemsPedido;
};
exports.Articulo = Articulo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Articulo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Articulo.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_barras', type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Articulo.prototype, "codigo_barras", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Articulo.prototype, "precio", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Articulo.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stock_minimo', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Articulo.prototype, "stock_minimo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'categoria_id', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Articulo.prototype, "categoriaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => categoria_entity_1.Categoria, {
        eager: true,
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'categoria_id' }),
    __metadata("design:type", Object)
], Articulo.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'marca_id', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Articulo.prototype, "marcaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marca_entity_1.Marca, {
        eager: true,
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'marca_id' }),
    __metadata("design:type", Object)
], Articulo.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Articulo.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Articulo.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Articulo.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => venta_detalle_entity_1.VentaDetalle, (detalle) => detalle.articulo),
    __metadata("design:type", Array)
], Articulo.prototype, "itemsVenta", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => pedido_detalle_entity_1.PedidoDetalle, (detalle) => detalle.articulo),
    __metadata("design:type", Array)
], Articulo.prototype, "itemsPedido", void 0);
exports.Articulo = Articulo = __decorate([
    (0, typeorm_1.Entity)({ name: 'articulos' })
], Articulo);
//# sourceMappingURL=articulo.entity.js.map