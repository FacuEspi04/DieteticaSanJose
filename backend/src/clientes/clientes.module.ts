import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesService } from './clientes.service';
import { Cliente } from './cliente.entity';
import { ClientesController } from './clientes.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Cliente])],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [TypeOrmModule], // Exportamos TypeOrmModule para que Ventas pueda usar Cliente
})
export class ClientesModule {}
