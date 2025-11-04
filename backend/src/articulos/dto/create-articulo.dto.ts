import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateArticuloDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  // --- CAMBIO ---
  @IsOptional()
  @IsInt()
  marcaId?: number; // <-- AÑADIDO: Ahora es un ID

  @IsString()
  @IsNotEmpty()
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
  categoriaId: number;

  // 'descripcion' ya no existe
}

