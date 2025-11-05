"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const articulo_entity_1 = require("./articulos/articulo.entity");
const categoria_entity_1 = require("./categorias/categoria.entity");
const cliente_entity_1 = require("./clientes/cliente.entity");
const marca_entity_1 = require("./marcas/marca.entity");
const pedido_entity_1 = require("./pedidos/pedido.entity");
const proveedores_entity_1 = require("./proveedores/proveedores.entity");
const retiro_entity_1 = require("./retiros/retiro.entity");
const venta_detalle_entity_1 = require("./ventas/venta-detalle.entity");
const venta_entity_1 = require("./ventas/venta.entity");
const pedido_detalle_entity_1 = require("./pedidos/pedido-detalle.entity");
const app_service_1 = require("./app.service");
const articulos_module_1 = require("./articulos/articulos.module");
const categorias_module_1 = require("./categorias/categorias.module");
const proveedores_module_1 = require("./proveedores/proveedores.module");
const pedidos_module_1 = require("./pedidos/pedidos.module");
const ventas_module_1 = require("./ventas/ventas.module");
const clientes_module_1 = require("./clientes/clientes.module");
const retiros_module_1 = require("./retiros/retiros.module");
const marcas_module_1 = require("./marcas/marcas.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'better-sqlite3',
                database: 'dietetica.db',
                entities: [
                    articulo_entity_1.Articulo,
                    categoria_entity_1.Categoria,
                    marca_entity_1.Marca,
                    proveedores_entity_1.Proveedor,
                    pedido_entity_1.Pedido,
                    pedido_detalle_entity_1.PedidoDetalle,
                    venta_entity_1.Venta,
                    venta_detalle_entity_1.VentaDetalle,
                    cliente_entity_1.Cliente,
                    retiro_entity_1.Retiro,
                ],
                synchronize: true,
            }),
            articulos_module_1.ArticulosModule,
            categorias_module_1.CategoriasModule,
            proveedores_module_1.ProveedoresModule,
            pedidos_module_1.PedidosModule,
            ventas_module_1.VentasModule,
            clientes_module_1.ClientesModule,
            retiros_module_1.RetirosModule,
            marcas_module_1.MarcasModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
            }),
        ],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map