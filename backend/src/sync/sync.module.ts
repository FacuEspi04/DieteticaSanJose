import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SyncService } from './sync.service';

import { Venta } from '../ventas/venta.entity';
import { Articulo } from '../articulos/articulo.entity';
import { Cliente } from '../clientes/cliente.entity';
import { Retiro } from '../retiros/retiro.entity';
import { Categoria } from '../categorias/categoria.entity';
import { Marca } from '../marcas/marca.entity';
import { ConfiguracionModule } from '../configuracion/configuracion.module';

@Module({
  imports: [
    HttpModule,
    ConfiguracionModule,
    TypeOrmModule.forFeature([
      Venta,
      Articulo,
      Cliente,
      Retiro,
      Categoria,
      Marca,
    ]),
  ],
  providers: [SyncService],
})
export class SyncModule {}
