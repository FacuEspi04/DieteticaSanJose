import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { RetirosService } from './retiros.service';
import { CreateRetiroDto } from './dto/create-retiro.dto';

@Controller('api/retiros')
export class RetirosController {
  constructor(private readonly retirosService: RetirosService) {}

  @Post()
  create(@Body(new ValidationPipe()) createRetiroDto: CreateRetiroDto) {
    return this.retirosService.create(createRetiroDto);
  }

  @Get()
  findAll(@Query('fecha') fecha?: string) {
    return this.retirosService.findAll(fecha);
  }
}

