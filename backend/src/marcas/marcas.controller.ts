import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';

@Controller('api/marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  @Post()
  create(@Body(new ValidationPipe()) createMarcaDto: CreateMarcaDto) {
    return this.marcasService.create(createMarcaDto);
  }

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.marcasService.findOne(id);
  }

  // (Opcional) Podemos añadir @Patch y @Delete si los necesitas
}

