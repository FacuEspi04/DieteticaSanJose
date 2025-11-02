import { PartialType } from '@nestjs/mapped-types';
import { CreateArticuloDto } from './create-articulo.dto';

// PartialType toma todas las validaciones de CreateArticuloDto
// y las aplica, pero haciendo que cada campo sea opcional.
export class UpdateArticuloDto extends PartialType(CreateArticuloDto) {}
