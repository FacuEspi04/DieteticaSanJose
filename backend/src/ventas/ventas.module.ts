import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Articulo } from 'src/articulos/articulo.entity';
import { Venta } from './venta.entity';
import { VentaDetalle } from './venta-detalle.entity';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Cliente } from 'src/clientes/cliente.entity';
 // <-- Importante para el stock

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Venta, 
      VentaDetalle, 
      Articulo,
      Cliente, // <-- Registrar Articulo aqui para usar su repositorio
    ])
  ],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}

