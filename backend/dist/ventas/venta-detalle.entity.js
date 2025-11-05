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
exports.VentaDetalle = void 0;
const typeorm_1 = require("typeorm");
const venta_entity_1 = require("./venta.entity");
const articulo_entity_1 = require("../articulos/articulo.entity");
let VentaDetalle = class VentaDetalle {
    id;
    numeroVenta;
    venta;
    articuloId;
    articulo;
    cantidad;
    precioUnitario;
    subtotal;
};
exports.VentaDetalle = VentaDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], VentaDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'numero_venta', type: 'integer' }),
    __metadata("design:type", Number)
], VentaDetalle.prototype, "numeroVenta", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => venta_entity_1.Venta, (venta) => venta.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'numero_venta' }),
    __metadata("design:type", venta_entity_1.Venta)
], VentaDetalle.prototype, "venta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'articulo_id', type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], VentaDetalle.prototype, "articuloId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => articulo_entity_1.Articulo, { onDelete: 'SET NULL', eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'articulo_id' }),
    __metadata("design:type", articulo_entity_1.Articulo)
], VentaDetalle.prototype, "articulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], VentaDetalle.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VentaDetalle.prototype, "precioUnitario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], VentaDetalle.prototype, "subtotal", void 0);
exports.VentaDetalle = VentaDetalle = __decorate([
    (0, typeorm_1.Entity)({ name: 'venta_detalles' })
], VentaDetalle);
//# sourceMappingURL=venta-detalle.entity.js.map