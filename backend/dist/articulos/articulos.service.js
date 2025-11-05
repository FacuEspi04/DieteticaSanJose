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
exports.ArticulosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const articulo_entity_1 = require("./articulo.entity");
let ArticulosService = class ArticulosService {
    articuloRepository;
    constructor(articuloRepository) {
        this.articuloRepository = articuloRepository;
    }
    create(createArticuloDto) {
        const { categoriaId, marcaId, ...rest } = createArticuloDto;
        const nuevoArticulo = this.articuloRepository.create({
            ...rest,
            categoria: { id: categoriaId },
            marca: marcaId ? { id: marcaId } : null,
        });
        return this.articuloRepository.save(nuevoArticulo);
    }
    async findAll(search) {
        const options = [];
        if (search) {
            const likeQuery = (0, typeorm_2.Like)(`%${search}%`);
            options.push({ nombre: likeQuery }, { codigo_barras: likeQuery }, { marca: { nombre: likeQuery } }, { categoria: { nombre: likeQuery } });
        }
        return this.articuloRepository.find({
            where: options.length > 0 ? options : undefined,
            relations: ['categoria', 'marca'],
            order: { nombre: 'ASC' },
        });
    }
    async findOne(id) {
        const articulo = await this.articuloRepository.findOne({
            where: { id },
            relations: ['categoria', 'marca'],
        });
        if (!articulo) {
            throw new common_1.NotFoundException(`Artículo con ID #${id} no encontrado.`);
        }
        return articulo;
    }
    async update(id, updateArticuloDto) {
        const articulo = await this.articuloRepository.findOneBy({ id });
        if (!articulo) {
            throw new common_1.NotFoundException(`Artículo con ID #${id} no encontrado.`);
        }
        const { categoriaId, marcaId, ...rest } = updateArticuloDto;
        this.articuloRepository.merge(articulo, rest);
        if (categoriaId) {
            articulo.categoria = { id: categoriaId };
        }
        if (marcaId) {
            articulo.marca = { id: marcaId };
        }
        else if (updateArticuloDto.hasOwnProperty('marcaId')) {
            articulo.marca = null;
        }
        return this.articuloRepository.save(articulo);
    }
    async remove(id) {
        const articulo = await this.findOne(id);
        await this.articuloRepository.remove(articulo);
        return { message: `Artículo con ID #${id} eliminado.` };
    }
};
exports.ArticulosService = ArticulosService;
exports.ArticulosService = ArticulosService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(articulo_entity_1.Articulo)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ArticulosService);
//# sourceMappingURL=articulos.service.js.map