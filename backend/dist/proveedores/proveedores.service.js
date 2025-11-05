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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProveedoresService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const proveedores_entity_1 = require("./proveedores.entity");
let ProveedoresService = class ProveedoresService {
    proveedorRepository;
    constructor(proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }
    create(createProveedorDto) {
        const nuevoProveedor = this.proveedorRepository.create(createProveedorDto);
        return this.proveedorRepository.save(nuevoProveedor);
    }
    findAll() {
        return this.proveedorRepository.find({ order: { nombre: 'ASC' } });
    }
    async findOne(id) {
        const proveedor = await this.proveedorRepository.findOneBy({ id });
        if (!proveedor) {
            throw new common_1.NotFoundException(`Proveedor con ID #${id} no encontrado.`);
        }
        return proveedor;
    }
    async update(id, updateProveedorDto) {
        const proveedor = await this.findOne(id);
        this.proveedorRepository.merge(proveedor, updateProveedorDto);
        return this.proveedorRepository.save(proveedor);
    }
    async remove(id) {
        const proveedor = await this.findOne(id);
        try {
            await this.proveedorRepository.remove(proveedor);
            return { message: `Proveedor "${proveedor.nombre}" (ID: ${id}) eliminado.` };
        }
        catch (error) {
            const mysqlError = error;
            if (mysqlError.code === 'ER_ROW_IS_REFERENCED_2' || mysqlError.errno === 1451) {
                throw new common_1.ConflictException(`No se puede eliminar el proveedor "${proveedor.nombre}" porque ya tiene pedidos u otros registros asociados.`);
            }
            throw error;
        }
    }
};
exports.ProveedoresService = ProveedoresService;
exports.ProveedoresService = ProveedoresService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proveedores_entity_1.Proveedor)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProveedoresService);
//# sourceMappingURL=proveedores.service.js.map