import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  ValidationPipe,
  Delete, // <-- AÑADIDO
  HttpCode, // <-- AÑADIDO
  HttpStatus, // <-- AÑADIDO
} from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';

@Controller('api/pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  create(@Body(new ValidationPipe()) createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get()
  findAll(
    @Query('proveedorId') proveedorId?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    const provId = proveedorId ? parseInt(proveedorId, 10) : undefined;
    return this.pedidosService.findAll(provId, desde, hasta);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.findOne(id);
  }

  // --- NUEVO ENDPOINT AÑADIDO ---
  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Devolver 200 OK
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.remove(id);
  }
}

