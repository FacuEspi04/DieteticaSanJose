import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsNumber,
  Min,
} from 'class-validator';

export class UpdateArticuloDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nombre?: string;

  // --- AGREGAR ESTOS CAMPOS QUE FALTABAN ---
  
  @IsString()
  @IsOptional()
  codigo_barras?: string;

  @IsNumber() // O @IsString() si en tu BD es string, pero suele ser number/decimal
  @IsPositive()
  @IsOptional()
  precio?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock_minimo?: number;

  // -----------------------------------------

  @IsInt()
  @IsPositive()
  @IsOptional()
  categoriaId?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  marcaId?: number;
}