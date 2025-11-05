import { Controller, Get, Post, Body, Param, ParseIntPipe, ValidationPipe, Delete, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { CreateProveedorDto } from './dto/create-proveedor.dto';

@Controller('api/proveedores')
export class ProveedoresController {
  constructor(private readonly proveedoresService: ProveedoresService) {}

  @Post()
  create(@Body(new ValidationPipe()) createProveedorDto: CreateProveedorDto) {
    return this.proveedoresService.create(createProveedorDto);
  }

  @Get()
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ skipMissingProperties: true }))
    updateProveedorDto: CreateProveedorDto,
  ) {
    return this.proveedoresService.update(id, updateProveedorDto);
  }
  // --- FIN DE AÑADIDO ---

   @Delete(':id')
  @HttpCode(HttpStatus.OK) // Devolver 200 OK
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.proveedoresService.remove(id);
  }
}
