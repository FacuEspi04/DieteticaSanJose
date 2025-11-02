import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { Pedido } from './pedido.entity';
import { PedidoDetalle } from './pedido-detalle.entity';
import { Articulo } from 'src/articulos/articulo.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      PedidoDetalle,
      Articulo, // Importante para que el servicio pueda buscar artículos
    ]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
