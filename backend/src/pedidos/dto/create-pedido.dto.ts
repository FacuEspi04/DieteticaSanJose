import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, ValidateNested } from 'class-validator';

class CreatePedidoItemDto {
  @IsInt()
  @IsPositive()
  articuloId: number;

  @IsInt()
  @IsPositive()
  cantidad: number;
}

export class CreatePedidoDto {
  @IsInt()
  @IsPositive()
  proveedorId: number;

  @IsString()
  @IsOptional()
  notas?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePedidoItemDto)
  @IsNotEmpty()
  items: CreatePedidoItemDto[];
}
