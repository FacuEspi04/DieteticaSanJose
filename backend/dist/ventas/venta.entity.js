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
exports.Venta = exports.TurnoVenta = exports.VentaEstado = exports.FormaPago = void 0;
const typeorm_1 = require("typeorm");
const venta_detalle_entity_1 = require("./venta-detalle.entity");
const cliente_entity_1 = require("../clientes/cliente.entity");
var FormaPago;
(function (FormaPago) {
    FormaPago["EFECTIVO"] = "efectivo";
    FormaPago["DEBITO"] = "debito";
    FormaPago["CREDITO"] = "credito";
    FormaPago["TRANSFERENCIA"] = "transferencia";
})(FormaPago || (exports.FormaPago = FormaPago = {}));
var VentaEstado;
(function (VentaEstado) {
    VentaEstado["COMPLETADA"] = "Completada";
    VentaEstado["PENDIENTE"] = "Pendiente";
})(VentaEstado || (exports.VentaEstado = VentaEstado = {}));
var TurnoVenta;
(function (TurnoVenta) {
    TurnoVenta["MANANA"] = "ma\u00F1ana";
    TurnoVenta["TARDE"] = "tarde";
    TurnoVenta["FUERA"] = "fuera";
})(TurnoVenta || (exports.TurnoVenta = TurnoVenta = {}));
let Venta = class Venta {
    id;
    numeroVenta;
    fechaHora;
    clienteId;
    cliente;
    clienteNombre;
    items;
    subtotal;
    interes;
    total;
    formaPago;
    estado;
    turno;
    createdAt;
    updatedAt;
};
exports.Venta = Venta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Venta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', unique: true }),
    __metadata("design:type", Number)
], Venta.prototype, "numeroVenta", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Venta.prototype, "fechaHora", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Venta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente, { nullable: true, eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], Venta.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Venta.prototype, "clienteNombre", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => venta_detalle_entity_1.VentaDetalle, (detalle) => detalle.venta, {
        cascade: true,
        eager: true,
    }),
    __metadata("design:type", Array)
], Venta.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Venta.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Venta.prototype, "interes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Venta.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        enum: FormaPago,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Venta.prototype, "formaPago", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        enum: VentaEstado,
    }),
    __metadata("design:type", String)
], Venta.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        enum: TurnoVenta,
    }),
    __metadata("design:type", String)
], Venta.prototype, "turno", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Venta.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Venta.prototype, "updatedAt", void 0);
exports.Venta = Venta = __decorate([
    (0, typeorm_1.Entity)({ name: 'ventas' })
], Venta);
//# sourceMappingURL=venta.entity.js.map