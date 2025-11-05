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
exports.ClientesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cliente_entity_1 = require("./cliente.entity");
let ClientesService = class ClientesService {
    clienteRepository;
    constructor(clienteRepository) {
        this.clienteRepository = clienteRepository;
    }
    create(createClienteDto) {
        const nuevoCliente = this.clienteRepository.create(createClienteDto);
        return this.clienteRepository.save(nuevoCliente);
    }
    findAll() {
        return this.clienteRepository.find({
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        const cliente = await this.clienteRepository.findOneBy({ id });
        if (!cliente) {
            throw new common_1.NotFoundException(`Cliente con ID #${id} no encontrado.`);
        }
        return cliente;
    }
    async update(id, updateClienteDto) {
        const cliente = await this.clienteRepository.preload({
            id,
            ...updateClienteDto,
        });
        if (!cliente) {
            throw new common_1.NotFoundException(`Cliente con ID #${id} no encontrado.`);
        }
        return this.clienteRepository.save(cliente);
    }
    async remove(id) {
        const cliente = await this.findOne(id);
        await this.clienteRepository.remove(cliente);
        return { message: `Cliente "${cliente.nombre}" (ID #${id}) eliminado.` };
    }
};
exports.ClientesService = ClientesService;
exports.ClientesService = ClientesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cliente_entity_1.Cliente)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ClientesService);
//# sourceMappingURL=clientes.service.js.map