import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { existsSync } from 'fs';

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
import { SyncModule } from './sync/sync.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { Configuracion } from './configuracion/configuracion.entity';
import { LicenciaMiddleware } from './common/middlewares/licencia.middleware';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: (() => {
        const executableEnvPath = join(process.cwd(), '.env');
        const backendEnvPath = join(__dirname, '..', '.env');
        if (existsSync(executableEnvPath)) return executableEnvPath;
        if (existsSync(backendEnvPath)) return backendEnvPath;
        return undefined;
      })(),
    }),
    ScheduleModule.forRoot(),
    
    // --- ¡Paso 2: CONFIGURA TYPEORM MANUALMENTE! ---
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_PATH || join(process.cwd(), 'dietetica.db'),
      
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
        Configuracion,
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
    SyncModule,
    ConfiguracionModule,
    AuthModule,

    // --- Módulo de React (Frontend) AL FINAL ---
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      
    }),
  ],
  //controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LicenciaMiddleware)
      .forRoutes('*');
  }
}

