import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticulosModule } from './articulos/articulos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { VentasModule } from './ventas/ventas.module';
import { ClientesModule } from './clientes/clientes.module'; // <-- 1. IMPORTAR
import { RetirosModule } from './retiros/retiros.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root', // Asumo que sigues usando 'root'
      database: process.env.DB_NAME || 'dietetica',
      autoLoadEntities: true,
      synchronize: true, // ¡Importante!
    }),
    ArticulosModule,
    CategoriasModule,
    ProveedoresModule,
    PedidosModule,
    VentasModule,
    ClientesModule,
    RetirosModule, // <-- 2. AÑADIR A IMPORTS
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

