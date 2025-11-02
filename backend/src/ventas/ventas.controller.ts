import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import {
  // AnularVentaDto, // Eliminado
  CreateVentaDto,
  RegistrarPagoDto,
} from './dto/venta.dto';

@Controller('api/ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.create(createVentaDto);
  }

  @Get()
  findAll(@Query('fecha') fecha?: string) {
    // Esto ahora coincide con el servicio
    return this.ventasService.findAll(fecha);
  }

  @Get('pendientes')
  findPendientes() {
    return this.ventasService.findPendientes();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ventasService.findOne(id);
  }

  @Patch(':id/pagar')
  @HttpCode(HttpStatus.OK)
  registrarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() registrarPagoDto: RegistrarPagoDto,
  ) {
    return this.ventasService.registrarPago(id, registrarPagoDto);
  }

  // --- ENDPOINT DE ANULAR ELIMINADO ---
  // @Patch(':id/anular')
  // @HttpCode(HttpStatus.OK)
  // anular(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() anularVentaDto: AnularVentaDto,
  // ) {
  //   return this.ventasService.anular(id, anularVentaDto);
  // }

  @Delete('limpiar-datos-prueba')
  @HttpCode(HttpStatus.OK)
  async deleteAll() {
    return this.ventasService.deleteAll();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id', ParseIntPipe) id: number) {
    // El frontend llamará a este endpoint para "Borrar"
    return this.ventasService.delete(id);
  }
}

