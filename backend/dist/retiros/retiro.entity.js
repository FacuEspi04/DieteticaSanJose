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
exports.Retiro = void 0;
const turnos_util_1 = require("../common/turnos.util");
const typeorm_1 = require("typeorm");
let Retiro = class Retiro {
    id;
    fechaHora;
    monto;
    motivo;
    turno;
    createdAt;
};
exports.Retiro = Retiro;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Retiro.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime' }),
    __metadata("design:type", Date)
], Retiro.prototype, "fechaHora", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Retiro.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Retiro.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        enum: turnos_util_1.TurnoVenta,
    }),
    __metadata("design:type", String)
], Retiro.prototype, "turno", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Retiro.prototype, "createdAt", void 0);
exports.Retiro = Retiro = __decorate([
    (0, typeorm_1.Entity)({ name: 'retiros' })
], Retiro);
//# sourceMappingURL=retiro.entity.js.map