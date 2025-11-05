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
var RetirosService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetirosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const retiro_entity_1 = require("./retiro.entity");
const turnos_util_1 = require("../common/turnos.util");
let RetirosService = RetirosService_1 = class RetirosService {
    retiroRepository;
    logger = new common_1.Logger(RetirosService_1.name);
    constructor(retiroRepository) {
        this.retiroRepository = retiroRepository;
    }
    async create(createRetiroDto) {
        const ahora = new Date();
        const nuevoRetiro = this.retiroRepository.create({
            ...createRetiroDto,
            fechaHora: ahora,
            turno: (0, turnos_util_1.determinarTurno)(ahora),
        });
        const retiroGuardado = await this.retiroRepository.save(nuevoRetiro);
        this.logger.log(`Retiro de $${retiroGuardado.monto} registrado exitosamente.`);
        return retiroGuardado;
    }
    async findAll(fecha) {
        const where = {};
        if (fecha) {
            const fechaInicio = new Date(`${fecha}T00:00:00`);
            const fechaFin = new Date(`${fecha}T23:59:59`);
            where.fechaHora = (0, typeorm_2.Between)(fechaInicio, fechaFin);
        }
        return this.retiroRepository.find({
            where,
            order: { fechaHora: 'DESC' },
        });
    }
};
exports.RetirosService = RetirosService;
exports.RetirosService = RetirosService = RetirosService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(retiro_entity_1.Retiro)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RetirosService);
//# sourceMappingURL=retiros.service.js.map