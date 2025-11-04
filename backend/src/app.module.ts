import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

// Entidades
import { Articulo } from './articulos/articulo.entity';
import { Categoria } from './categorias/categoria.entity';
import { Cliente } from './clientes/cliente.entity';
import { Marca } from './marcas/marca.entity';
import { Pedido } from './pedidos/pedido.entity';
import { Proveedor } from './proveedores/proveedores.entity';
import { Retiro } from './retiros/retiro.entity';
import { VentaDetalle } from './ventas/venta-detalle.entity';
import { Venta } from './ventas/venta.entity';
import { PedidoDetalle } from './pedidos/pedido-detalle.entity';

// --- Módulos de la App ---
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticulosModule } from './articulos/articulos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { VentasModule } from './ventas/ventas.module';
import { ClientesModule } from './clientes/clientes.module';
import { RetirosModule } from './retiros/retiros.module';
import { MarcasModule } from './marcas/marcas.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // --- ¡Paso 2: CONFIGURA TYPEORM MANUALMENTE! ---
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'dietetica.db',
      
      // Reemplazamos 'autoLoadEntities' por 'entities'
      // autoLoadEntities: true, // <--- BORRA ESTA LÍNEA
      entities: [
        Articulo,
        Categoria,
        Marca,
        Proveedor,
        Pedido,
        PedidoDetalle, // (Asegúrate de importar todas)
        Venta,
        VentaDetalle, // (Asegúrate de importar todas)
        Cliente,
        Retiro,
      ],
      
      synchronize: true, 
    }),

    // --- Módulos de API ---
    ArticulosModule,
    CategoriasModule,
    ProveedoresModule,
    PedidosModule,
    VentasModule,
    ClientesModule,
    RetirosModule,
    MarcasModule,

    // --- Módulo de React (Frontend) AL FINAL ---
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      
    }),
  ],
  //controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

