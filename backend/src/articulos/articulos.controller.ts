import {
  Controller,
  Get,
  Post,
  Body,
  Patch, // <-- AÑADIDO
  Param,
  Delete,
  ParseIntPipe,
  Query, // <-- AÑADIDO
} from '@nestjs/common';
import { ArticulosService } from './articulos.service';
import { CreateArticuloDto } from './dto/create-articulo.dto';
import { UpdateArticuloDto } from './dto/update-articulo.dto'; // <-- AÑADIDO

@Controller('api/articulos')
export class ArticulosController {
  constructor(private readonly articulosService: ArticulosService) {}

  @Post()
  create(@Body() createArticuloDto: CreateArticuloDto) {
    return this.articulosService.create(createArticuloDto);
  }

  @Get()
  // --- MODIFICADO ---
  // Añadimos el query param para la búsqueda
  findAll(@Query('search') searchTerm?: string) {
    return this.articulosService.findAll(searchTerm);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articulosService.findOne(id);
  }

  // --- NUEVO ---
  // Añadimos el endpoint PATCH para actualizar
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticuloDto: UpdateArticuloDto,
  ) {
    return this.articulosService.update(id, updateArticuloDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.articulosService.remove(id);
  }
}

