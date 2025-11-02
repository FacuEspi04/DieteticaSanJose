import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateArticuloDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  // --- CAMBIO ---
  @IsString()
  @IsOptional()
  @MaxLength(100)
  marca?: string; // <-- AÑADIDO

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  codigo_barras: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  @Min(0)
  stock_minimo: number;

  @IsInt()
  @IsNotEmpty()
  categoriaId: number;

  // --- CAMBIO ---
  // descripcion?: string; // <-- ELIMINADO
}

